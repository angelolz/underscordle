import {
    S3Client,
    ListObjectsV2Command,
    GetObjectCommand,
    PutObjectCommand,
} from '@aws-sdk/client-s3';
import fs from 'fs/promises';
import path from 'path';
import { Readable } from 'stream';
import mime from 'mime';
import 'dotenv/config';

const MAX_CONCURRENT_SYNC = 16;

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.warn('R2 credentials missing. R2 operations will fail.');
}

export const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

export async function downloadFile(bucket, key, localPath) {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await s3.send(command);
    await fs.mkdir(path.dirname(localPath), { recursive: true });

    const stream = response.Body;
    if (stream instanceof Readable) {
        await fs.writeFile(localPath, stream);
    } else {
        const data = await response.Body.transformToByteArray();
        await fs.writeFile(localPath, data);
    }
}

export async function uploadFile(bucket, key, localPath) {
    const content = await fs.readFile(localPath);
    const contentType = mime.getType(localPath) || 'application/octet-stream';

    let cacheControl = 'public, max-age=3600'; // 1 hour for json

    if (key.includes('/round-')) {
        // 1 year for snippets, won't change
        cacheControl = 'public, max-age=31536000, immutable';
    } else if (key.startsWith('art/')) {
        // 1 week for album covers
        cacheControl = 'public, max-age=604800';
    }

    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: content,
        ContentType: contentType,
        CacheControl: cacheControl,
    });

    await s3.send(command);
}

export async function listObjects(bucket, prefix = '') {
    const objects = [];
    let continuationToken;

    do {
        const response = await s3.send(
            new ListObjectsV2Command({
                Bucket: bucket,
                Prefix: prefix,
                ContinuationToken: continuationToken,
            })
        );

        objects.push(...(response.Contents || []));
        continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
    } while (continuationToken);

    return objects;
}

async function runWithConcurrency(items, worker, concurrency = MAX_CONCURRENT_SYNC) {
    let nextIndex = 0;

    async function runWorker() {
        while (nextIndex < items.length) {
            const index = nextIndex++;
            await worker(items[index]);
        }
    }

    const workerCount = Math.min(concurrency, items.length);
    await Promise.all(Array.from({ length: workerCount }, runWorker));
}

export async function syncPull(bucket, prefix, localDir, excludePrefix = null) {
    console.log(`Pulling s3://${bucket}/${prefix} to ${localDir}...`);
    const objects = await listObjects(bucket, prefix);
    const excludedPrefixes = Array.isArray(excludePrefix)
        ? excludePrefix
        : excludePrefix
          ? [excludePrefix]
          : [];

    await runWithConcurrency(objects, async (obj) => {
        if (obj.Key.endsWith('/')) return; //ignore folders
        if (excludedPrefixes.some((excluded) => obj.Key.startsWith(excluded))) return;

        const relativeKey = prefix ? obj.Key.replace(prefix, '').replace(/^\//, '') : obj.Key;
        const localPath = path.join(localDir, relativeKey);

        try {
            const stats = await fs.stat(localPath);
            if (stats.size === obj.Size) {
                return;
            }
        } catch (_) {
            // File missing
        }

        console.log(`  Downloading ${obj.Key} -> ${localPath}`);
        await downloadFile(bucket, obj.Key, localPath);
    });
}

export async function snapshotDir(
    localDir,
    bucket,
    prefix,
    currentPrefix = '',
    excludePrefixes = []
) {
    console.log(`Snapshotting ${localDir} to s3://${bucket}/${prefix}...`);

    const files = [];
    async function walk(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const filePath = path.resolve(dir, entry.name);
            if (entry.isDirectory()) {
                await walk(filePath);
            } else {
                files.push(filePath);
            }
        }
    }

    await walk(localDir);

    const remoteObjects = (await listObjects(bucket, currentPrefix)).filter(
        (obj) =>
            !obj.Key.endsWith('/') &&
            !excludePrefixes.some((excluded) => obj.Key.startsWith(excluded))
    );
    const remoteByKey = new Map(remoteObjects.map((obj) => [obj.Key, obj]));
    const localKeys = new Set(
        files.map((filePath) => {
            const relativePath = path.relative(localDir, filePath).replace(/\\/g, '/');
            return currentPrefix
                ? `${currentPrefix.replace(/\/$/, '')}/${relativePath}`
                : relativePath;
        })
    );
    let hasChanges = remoteObjects.length !== files.length;

    await runWithConcurrency(files, async (filePath) => {
        const relativePath = path.relative(localDir, filePath).replace(/\\/g, '/');
        const currentKey = currentPrefix
            ? `${currentPrefix.replace(/\/$/, '')}/${relativePath}`
            : relativePath;
        const remoteObject = remoteByKey.get(currentKey);

        if (!remoteObject || remoteObject.Size !== (await fs.stat(filePath)).size) {
            hasChanges = true;
            return;
        }

        const response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: currentKey }));
        const remoteContent = Buffer.from(await response.Body.transformToByteArray());
        const localContent = await fs.readFile(filePath);
        if (!remoteContent.equals(localContent)) {
            hasChanges = true;
        }
    });

    if (!hasChanges && remoteObjects.some((obj) => !localKeys.has(obj.Key))) {
        hasChanges = true;
    }

    if (!hasChanges) {
        console.log('No data changes detected; skipping snapshot.');
        return false;
    }

    await runWithConcurrency(files, async (filePath) => {
        const relativePath = path.relative(localDir, filePath).replace(/\\/g, '/');
        const key = `${prefix.replace(/\/$/, '')}/${relativePath}`;

        console.log(`  Snapshotting ${relativePath} -> s3://${bucket}/${key}`);
        await uploadFile(bucket, key, filePath);
    });

    return true;
}

export async function syncPush(localDir, bucket, prefix = '') {
    console.log(`Pushing ${localDir} to s3://${bucket}/${prefix}...`);

    const files = [];
    async function walk(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const res = path.resolve(dir, entry.name);
            if (entry.isDirectory()) {
                await walk(res);
            } else {
                files.push(res);
            }
        }
    }

    await walk(localDir);

    await runWithConcurrency(files, async (filePath) => {
        const relativePath = path.relative(localDir, filePath);
        const key = prefix
            ? path.join(prefix, relativePath).replace(/\\/g, '/')
            : relativePath.replace(/\\/g, '/');

        console.log(`  Uploading ${relativePath} -> s3://${bucket}/${key}`);
        await uploadFile(bucket, key, filePath);
    });
}
