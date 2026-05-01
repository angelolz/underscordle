import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, '../out/data');
const REGISTRY_FILE = path.join(DATA_DIR, 'song-registry.json');
const MASTERS_DIR = process.env.MASTERS_DIR || path.resolve(__dirname, '../out/masters');
const OUTPUT_BASE_DIR = process.env.OUTPUT_DIR || path.resolve(__dirname, '../out/dailies');

function createSeededRandom(seed) {
    let hash = crypto.createHash('sha256').update(seed).digest('hex');
    let index = 0;

    return function () {
        if (index + 8 > hash.length) {
            hash = crypto.createHash('sha256').update(hash).digest('hex');
            index = 0;
        }
        const val = parseInt(hash.substring(index, index + 8), 16) / 0xffffffff;
        index += 8;
        return val;
    };
}

async function generateDaily() {
    try {
        const dateArg = process.argv[2] || new Date().toISOString().split('T')[0];
        console.log(`Generating challenge for: ${dateArg}`);

        const registry = JSON.parse(await fs.readFile(REGISTRY_FILE, 'utf-8'));
        const songIds = Object.keys(registry);
        
        if (songIds.length < 5) {
            throw new Error('Not enough songs in registry (need at least 5)');
        }

        const random = createSeededRandom(dateArg);

        const selectedIds = [];
        const availableIds = [...songIds];
        for (let i = 0; i < 5; i++) {
            const idx = Math.floor(random() * availableIds.length);
            selectedIds.push(availableIds.splice(idx, 1)[0]);
        }

        const dayDir = path.join(OUTPUT_BASE_DIR, dateArg);
        await fs.mkdir(dayDir, { recursive: true });

        console.log('\nGenerating Daily Challenge...');

        const roundsMeta = [];

        for (let i = 0; i < selectedIds.length; i++) {
            const songId = selectedIds[i];
            const song = registry[songId];
            const round = i + 1;
            const masterPath = path.join(MASTERS_DIR, song.filename);

            console.log(`Round ${round}: ${song.title}`);

            const snippets = [
                { id: 1, duration: 0.5, type: 'random' },
                { id: 2, duration: 1.0, type: 'random' },
                { id: 3, duration: 3.0, type: 'start' },
            ];

            for (const snip of snippets) {
                let startTime = 0;
                if (snip.type === 'random') {
                    const min = song.duration * 0.1;
                    const max = song.duration * 0.9 - snip.duration;
                    startTime = min + random() * (max - min);
                }

                const outputName = `round-${round}-guess-${snip.id}.opus`;
                const outputPath = path.join(dayDir, outputName);

                await new Promise((resolve, reject) => {
                    ffmpeg(masterPath)
                        .setStartTime(startTime)
                        .setDuration(snip.duration)
                        .output(outputPath)
                        .audioCodec('libopus')
                        .outputFormat('opus')
                        .on('end', resolve)
                        .on('error', (err) => {
                            console.error(`Error processing snippet ${outputName}:`, err);
                            reject(err);
                        })
                        .run();
                });
                console.log(`  - Generated: ${outputName} (Start: ${startTime.toFixed(2)}s)`);
            }

            roundsMeta.push({
                round,
                songId,
            });
        }

        const challengeMeta = {
            date: dateArg,
            rounds: roundsMeta,
        };

        await fs.writeFile(path.join(dayDir, 'meta.json'), JSON.stringify(challengeMeta, null, 2));

        console.log(`\nDaily challenge generation complete! Files in: ${dayDir}`);
    } catch (error) {
        console.error('Generation failed:', error);
        process.exit(1);
    }
}

generateDaily();
