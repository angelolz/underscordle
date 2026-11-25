import * as mm from 'music-metadata';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import ffmpeg from 'fluent-ffmpeg';
import { encode } from '@msgpack/msgpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MASTERS_DIR = process.env.MASTERS_DIR || path.resolve(__dirname, '../out/masters');
const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, '../out/data');
const COVER_DIR = process.env.COVERS_DIR || path.resolve(__dirname, '../out/covers');
const REGISTRY_FILE = path.join(DATA_DIR, 'song-registry.json');

const SONGLIST_OUTPUT_FILE = path.join(DATA_DIR, 'songs.json');
const SONGLIST_MIN_OUTPUT_FILE = path.join(DATA_DIR, 'songs.min.json');
const COVERS_OUTPUT_FILE = path.join(DATA_DIR, 'covers.json');
const COVERS_MIN_OUTPUT_FILE = path.join(DATA_DIR, 'covers.min.json');

const SUPPORTED_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.flac', '.ogg'];
const STREAMING_PLATFORMS = [
    'appleMusic',
    'bandcamp',
    'soundcloud',
    'spotify',
    'tidal',
    'youtube',
    'youtubeMusic',
];

const MUSICBRAINZ_USER_AGENT = 'underscordle/1.0 (https://underscordle.org)';
let lastMusicBrainzRequestAt = 0;

function normalizeText(value) {
    return value
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function mergeLinks(existingLinks, discoveredLinks) {
    const links = { ...existingLinks };

    for (const platform of STREAMING_PLATFORMS) {
        if (!links[platform] && discoveredLinks[platform]) {
            links[platform] = discoveredLinks[platform];
        }
    }

    return links;
}

async function fetchJson(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
    }
    return response.json();
}

async function fetchMusicBrainz(url) {
    const wait = Math.max(0, 1100 - (Date.now() - lastMusicBrainzRequestAt));
    if (wait > 0) {
        await new Promise((resolve) => setTimeout(resolve, wait));
    }

    lastMusicBrainzRequestAt = Date.now();
    return fetchJson(url, { headers: { 'User-Agent': MUSICBRAINZ_USER_AGENT } });
}

function getAppleMusicLink(results, title, artist) {
    const normalizedTitle = normalizeText(title);
    const normalizedArtist = normalizeText(artist);

    const match = results.find((result) => {
        const resultTitle = normalizeText(result.trackName || '');
        const resultArtist = normalizeText(result.artistName || '');
        return (
            resultTitle === normalizedTitle &&
            (resultArtist === normalizedArtist ||
                resultArtist.includes(normalizedArtist) ||
                normalizedArtist.includes(resultArtist))
        );
    });

    return match?.trackViewUrl;
}

function getMusicBrainzLink(relationUrl) {
    if (!relationUrl) return null;

    const url = relationUrl.toLowerCase();
    if (url.includes('open.spotify.com/track/')) return ['spotify', relationUrl];
    if (url.includes('music.youtube.com/')) return ['youtubeMusic', relationUrl];
    if (url.includes('youtube.com/') || url.includes('youtu.be/')) {
        return ['youtube', relationUrl];
    }
    if (url.includes('soundcloud.com/')) return ['soundcloud', relationUrl];
    if (url.includes('bandcamp.com/')) return ['bandcamp', relationUrl];
    if (url.includes('tidal.com/')) return ['tidal', relationUrl];
    if (url.includes('music.apple.com/') || url.includes('itunes.apple.com/')) {
        return ['appleMusic', relationUrl];
    }

    return null;
}

async function lookupStreamingLinks(title, artist) {
    const links = {};
    const searchTerm = encodeURIComponent(`${artist} ${title}`);

    try {
        const data = await fetchJson(
            `https://itunes.apple.com/search?term=${searchTerm}&entity=song&limit=10`
        );
        const appleMusicLink = getAppleMusicLink(data.results || [], title, artist);
        if (appleMusicLink) links.appleMusic = appleMusicLink;
    } catch (error) {
        console.warn(`  Apple Music lookup failed: ${error.message}`);
    }

    try {
        const query = encodeURIComponent(`recording:"${title}" AND artist:"${artist}"`);
        const search = await fetchMusicBrainz(
            `https://musicbrainz.org/ws/2/recording/?query=${query}&fmt=json&limit=5`
        );
        const normalizedTitle = normalizeText(title);
        const normalizedArtist = normalizeText(artist);
        const recording = (search.recordings || []).find((candidate) => {
            const candidateTitle = normalizeText(candidate.title || '');
            const candidateArtist = normalizeText(
                candidate['artist-credit']?.map((credit) => credit.name).join(' ') || ''
            );
            return (
                candidateTitle === normalizedTitle &&
                (candidateArtist.includes(normalizedArtist) ||
                    normalizedArtist.includes(candidateArtist))
            );
        });

        if (recording?.id) {
            const details = await fetchMusicBrainz(
                `https://musicbrainz.org/ws/2/recording/${recording.id}?inc=url-rels&fmt=json`
            );

            for (const relation of details.relations || []) {
                const match = getMusicBrainzLink(relation.url?.resource);
                if (match && !links[match[0]]) {
                    links[match[0]] = match[1];
                }
            }
        }
    } catch (error) {
        console.warn(`  MusicBrainz lookup failed: ${error.message}`);
    }

    return links;
}

async function getFileHash(filePath) {
    const content = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
}

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

            const imgExt = picture.format === 'image/png' ? '.png' : '.jpg';
            const tempInput = path.join(path.dirname(outputPath), `temp-${slug}${imgExt}`);
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

        console.log(`  No embedded cover art found for ${albumName}.`);
        return null;
    }
}

async function scanSongs() {
    try {
        console.log(`Scanning directory: ${MASTERS_DIR}`);
        const files = await fs.readdir(MASTERS_DIR);

        let registry = {};
        try {
            registry = JSON.parse(await fs.readFile(REGISTRY_FILE, 'utf-8'));
        } catch (_) {
            console.warn('No registry found. Please run bootstrap-registry.js first.');
            process.exit(1);
        }

        const songList = [];
        const albumsMap = new Map();

        await fs.mkdir(path.dirname(SONGLIST_OUTPUT_FILE), { recursive: true });
        await fs.mkdir(COVER_DIR, { recursive: true });

        for (const file of files) {
            const ext = path.extname(file).toLowerCase();
            if (SUPPORTED_EXTENSIONS.includes(ext)) {
                const fullPath = path.join(MASTERS_DIR, file);
                console.log(`Processing: ${file}...`);

                const metadata = await mm.parseFile(fullPath);
                const albumName = metadata.common.album || 'Unknown Album';
                const title = metadata.common.title || path.basename(file, ext);
                const artist = metadata.common.artist || 'Unknown Artist';
                const duration = Math.floor(metadata.format.duration * 1000) / 1000;
                const contentHash = await getFileHash(fullPath);

                let foundId = null;
                let existingEntry = null;

                // match file name
                for (const [id, entry] of Object.entries(registry)) {
                    if (entry.filename === file) {
                        foundId = id;
                        existingEntry = entry;
                        break;
                    }
                }

                // match file hash
                if (!foundId) {
                    for (const [id, entry] of Object.entries(registry)) {
                        if (entry.contentHash === contentHash) {
                            foundId = id;
                            existingEntry = entry;
                            console.log(
                                `  Detected rename (hash match): ${entry.filename} -> ${file}`
                            );
                            break;
                        }
                    }
                }

                // match title + artist
                if (!foundId) {
                    for (const [id, entry] of Object.entries(registry)) {
                        if (entry.title === title && entry.artist === artist) {
                            foundId = id;
                            existingEntry = entry;
                            console.log(
                                `  Detected rename/mod (metadata match): ${entry.filename} -> ${file}`
                            );
                            break;
                        }
                    }
                }

                const isNewSong = !foundId;

                // it is a new song
                if (isNewSong) {
                    foundId = crypto.randomBytes(6).toString('hex');
                    console.log(`  New song detected. Assigned ID: ${foundId}`);
                }

                let links = existingEntry?.links || {};
                if (isNewSong) {
                    console.log(`  Looking up streaming links for ${title}...`);
                    links = mergeLinks(links, await lookupStreamingLinks(title, artist));
                }

                registry[foundId] = {
                    filename: file,
                    title,
                    artist,
                    album: albumName,
                    duration,
                    contentHash,
                    links,
                };

                const slug = albumName.toLowerCase().replace(/[^a-z0-9]/g, '-');
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
                    id: foundId,
                    title,
                    artist,
                    album: albumName,
                    links: registry[foundId].links,
                });
            }
        }

        await fs.writeFile(REGISTRY_FILE, JSON.stringify(registry, null, 2));

        const albums = Array.from(albumsMap.values());

        await fs.writeFile(SONGLIST_OUTPUT_FILE, JSON.stringify(songList, null, 2));
        await fs.writeFile(SONGLIST_MIN_OUTPUT_FILE, encode(songList));

        await fs.writeFile(COVERS_OUTPUT_FILE, JSON.stringify(albums, null, 2));
        await fs.writeFile(COVERS_MIN_OUTPUT_FILE, encode(albums));

        console.log(`\nSuccess! Generated manifest for ${songList.length} songs.`);
        console.log(`Output saved to: ${SONGLIST_OUTPUT_FILE}`);
    } catch (error) {
        console.error('Error scanning songs:', error);
        process.exit(1);
    }
}

scanSongs();
