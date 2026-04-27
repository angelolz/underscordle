import * as mm from 'music-metadata';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import ffmpeg from 'fluent-ffmpeg';
import { encode } from '@msgpack/msgpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// configuration
const MASTERS_DIR = process.env.MASTERS_DIR || path.resolve(__dirname, '../out/masters');
const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, '../out/data');
const COVER_DIR = process.env.COVER_DIR || path.resolve(__dirname, '../out/covers');

const SONGLIST_FULL_OUTPUT_FILE = path.join(DATA_DIR, 'songs-full.json');
const SONGLIST_LITE_OUTPUT_FILE = path.join(DATA_DIR, 'songs-lite.json');
const ALBUMS_OUTPUT_FILE = path.join(DATA_DIR, 'covers.json');
const SONGLIST_FULL_MIN_OUTPUT_FILE = path.join(DATA_DIR, 'songs-full.min.json');
const SONGLIST_LITE_MIN_OUTPUT_FILE = path.join(DATA_DIR, 'songs-lite.min.json');
const ALBUMS_MIN_OUTPUT_FILE = path.join(DATA_DIR, 'covers.min.json');
const SUPPORTED_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.flac', '.ogg'];
async function extractArt(songPath, albumName, metadata) {
    const slug = albumName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const outputPath = path.join(COVER_DIR, `${slug}.webp`);

    try {
        await fs.access(outputPath);
        return `/art/${slug}.webp`;
    } catch {
        if (metadata.common.picture && metadata.common.picture.length > 0) {
            const picture = metadata.common.picture[0];
            console.log(`  Extracting art from metadata for ${albumName}...`);

            const tempInput = path.join(path.dirname(outputPath), `temp-${slug}`);
            await fs.writeFile(tempInput, picture.data);

            return new Promise((resolve) => {
                ffmpeg(tempInput)
                    .output(outputPath)
                    .frames(1)
                    .size('80x80')
                    .on('end', async () => {
                        await fs.unlink(tempInput).catch(() => {});
                        resolve(`/art/${slug}.webp`);
                    })
                    .on('error', async (err) => {
                        console.warn(`  Could not convert art for ${albumName}: ${err.message}`);
                        await fs.unlink(tempInput).catch(() => {});
                        resolve(null);
                    })
                    .run();
            });
        }

        return new Promise((resolve) => {
            ffmpeg(songPath)
                .output(outputPath)
                .frames(1)
                .size('80x80')
                .on('end', () => resolve(`/art/${slug}.webp`))
                .on('error', (err) => {
                    console.warn(
                        `  Could not extract art via ffmpeg for ${albumName}: ${err.message}`
                    );
                    resolve(null);
                })
                .run();
        });
    }
}

async function scanSongs() {
    try {
        console.log(`Scanning directory: ${MASTERS_DIR}`);
        const files = await fs.readdir(MASTERS_DIR);
        const songList = [];
        const albumsMap = new Map();

        await fs.mkdir(path.dirname(SONGLIST_FULL_OUTPUT_FILE), { recursive: true });
        await fs.mkdir(COVER_DIR, { recursive: true });

        for (const file of files) {
            const ext = path.extname(file).toLowerCase();
            if (SUPPORTED_EXTENSIONS.includes(ext)) {
                const fullPath = path.join(MASTERS_DIR, file);
                console.log(`Processing: ${file}...`);

                const metadata = await mm.parseFile(fullPath);
                const albumName = metadata.common.album || 'Unknown Album';
                const slug = albumName.toLowerCase().replace(/[^a-z0-9]/g, '-');
                const id = crypto.createHash('sha256').update(file).digest('hex').substring(0, 12);

                await extractArt(fullPath, albumName, metadata);

                if (!albumsMap.has(slug)) {
                    albumsMap.set(slug, {
                        name: albumName,
                        file: `${slug}.webp`,
                        isSingle: true,
                    });
                } else {
                    let album = albumsMap.get(slug);
                    album.isSingle = false;
                    albumsMap.set(slug, album);
                }

                songList.push({
                    id,
                    filename: file,
                    title: metadata.common.title || path.basename(file, ext),
                    artist: metadata.common.artist || 'Unknown Artist',
                    album: albumName,
                    duration: Math.floor(metadata.format.duration * 1000) / 1000,
                });
            }
        }

        const albums = Array.from(albumsMap.values());

        await fs.writeFile(SONGLIST_FULL_OUTPUT_FILE, JSON.stringify(songList, null, 2));
        await fs.writeFile(SONGLIST_FULL_MIN_OUTPUT_FILE, encode(songList));

        await fs.writeFile(ALBUMS_OUTPUT_FILE, JSON.stringify(albums, null, 2));
        await fs.writeFile(ALBUMS_MIN_OUTPUT_FILE, encode(albums));

        songList.forEach((song) => {
            delete song.filename;
            delete song.duration;
        });

        await fs.writeFile(SONGLIST_LITE_OUTPUT_FILE, JSON.stringify(songList, null, 2));
        await fs.writeFile(SONGLIST_LITE_MIN_OUTPUT_FILE, encode(songList));

        console.log(
            `\nSuccess! Generated manifest for ${songList.length} songs and ${albums.length} albums.`
        );
        console.log(
            `Output saved to: ${SONGLIST_FULL_OUTPUT_FILE} and ${SONGLIST_LITE_OUTPUT_FILE}`
        );
    } catch (error) {
        console.error('Error scanning songs:', error);
        process.exit(1);
    }
}

scanSongs();
