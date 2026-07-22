import * as mm from 'music-metadata';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MASTERS_DIR = process.env.MASTERS_DIR || path.resolve(__dirname, '../out/masters');
const REGISTRY_FILE = path.resolve(__dirname, '../out/data/song-registry.json');
const SUPPORTED_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.flac', '.ogg'];

async function getFileHash(filePath) {
    const content = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
}

function getOldId(filename) {
    return crypto.createHash('sha256').update(filename).digest('hex').substring(0, 12);
}

async function bootstrap() {
    try {
        try {
            await fs.access(REGISTRY_FILE);
            console.error(`\n❌ Error: Registry file already exists at:\n   ${REGISTRY_FILE}`);
            console.error(
                '\nRunning bootstrap again would overwrite all existing song IDs, contents, and streaming links.'
            );
            console.error('- To add new songs, run: pnpm scan');
            console.error('- To force-reinitialize, manually delete the registry file first.\n');
            process.exit(1);
        } catch (_) {
            //ignored
        }

        console.log(`Bootstrapping registry from: ${MASTERS_DIR}`);

        // check if out/data exists
        await fs.mkdir(path.dirname(REGISTRY_FILE), { recursive: true });

        const files = await fs.readdir(MASTERS_DIR);
        const registry = {};

        for (const file of files) {
            const ext = path.extname(file).toLowerCase();
            if (SUPPORTED_EXTENSIONS.includes(ext)) {
                const fullPath = path.join(MASTERS_DIR, file);
                console.log(`Processing: ${file}...`);

                const metadata = await mm.parseFile(fullPath);
                const id = getOldId(file);
                const contentHash = await getFileHash(fullPath);

                registry[id] = {
                    filename: file,
                    title: metadata.common.title || path.basename(file, ext),
                    artist: metadata.common.artist || 'Unknown Artist',
                    album: metadata.common.album || 'Unknown Album',
                    duration: Math.floor(metadata.format.duration * 1000) / 1000,
                    contentHash: contentHash,
                };
            }
        }

        await fs.writeFile(REGISTRY_FILE, JSON.stringify(registry, null, 2));
        console.log(`\nSuccess! Registry initialized with ${Object.keys(registry).length} songs.`);
        console.log(`Registry saved to: ${REGISTRY_FILE}`);
    } catch (error) {
        console.error('Bootstrap failed:', error);
        process.exit(1);
    }
}

bootstrap();
