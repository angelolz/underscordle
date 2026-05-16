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
    const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
    });

    const response = await s3.send(command);
    return response.Contents || [];
}

export async function syncPull(bucket, prefix, localDir, excludePrefix = null) {
    console.log(`Pulling s3://${bucket}/${prefix} to ${localDir}...`);
    const objects = await listObjects(bucket, prefix);

    await Promise.all(
        objects.map(async (obj) => {
            if (obj.Key.endsWith('/')) return; //ignore folders
            if (excludePrefix && obj.Key.startsWith(excludePrefix)) return; //ignore excluded files

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
        })
    );
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

    await Promise.all(
        files.map(async (filePath) => {
            const relativePath = path.relative(localDir, filePath);
            const key = prefix
                ? path.join(prefix, relativePath).replace(/\\/g, '/')
                : relativePath.replace(/\\/g, '/');

            console.log(`  Uploading ${relativePath} -> s3://${bucket}/${key}`);
            await uploadFile(bucket, key, filePath);
        })
    );
}
