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
const BUCKET_URL = 'https://challenges.underscordle.org';
const VOLUME_THRESHOLD = -35;
const MAX_RETRIES = 5;
const DEDUPLICATE_DAYS = 5;
const TODAY_DATE = new Date().toISOString().split('T')[0];

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

async function getMeanVolume(masterPath, startTime, duration) {
    return new Promise((resolve) => {
        let meanVolume = -100;
        ffmpeg(masterPath)
            .setStartTime(startTime)
            .setDuration(duration)
            .audioFilters('volumedetect')
            .addOption('-f', 'null')
            .output('-')
            .on('stderr', (line) => {
                const match = line.match(/mean_volume: ([-\d.]+) dB/);
                if (match) {
                    meanVolume = parseFloat(match[1]);
                }
            })
            .on('end', () => {
                resolve(meanVolume);
            })
            .on('error', (err) => {
                console.error(`    Volume detection error: ${err.message}`);
                resolve(-100);
            })
            .run();
    });
}

function getPreviousDays(dateArg) {
    const dates = [];

    for (let i = 1; i <= DEDUPLICATE_DAYS; i++) {
        const oldDate = new Date(dateArg);
        oldDate.setDate(oldDate.getDate() - i);
        dates.push(oldDate.toISOString().split('T')[0]);
    }

    return dates;
}

async function getPreviousSongIds(dateArg) {
    const previousSongsSet = new Set();
    const previousDates = getPreviousDays(dateArg);

    await Promise.all(
        previousDates.map(async (date) => {
            try {
                const metaResponse = await fetch(`${BUCKET_URL}/${date}/meta.json`);
                if (!metaResponse.ok) {
                    console.log(`   Failed to get meta.json for ${date}, response not ok`);
                    return;
                }

                const metaResult = await metaResponse.json();

                metaResult.rounds?.forEach((round) => {
                    previousSongsSet.add(round.songId);
                });
            } catch (e) {
                console.log(`   Failed to get meta.json for ${date}, ${e.message}`);
            }
        })
    );

    return previousSongsSet;
}

async function generateDaily() {
    try {
        const dateArg = process.argv[2] || TODAY_DATE;
        console.log(`Generating challenge for: ${dateArg}`);

        console.log(`Retrieving songs for last ${DEDUPLICATE_DAYS} days of challenges...`);
        const previousSongsSet = await getPreviousSongIds(dateArg);

        const registry = JSON.parse(await fs.readFile(REGISTRY_FILE, 'utf-8'));
        const songIds = Object.keys(registry);

        if (songIds.length < 5) {
            throw new Error('Not enough songs in registry (need at least 5)');
        }

        const random = createSeededRandom(dateArg);

        const availableIds = [...songIds];
        const selectedRounds = [];

        console.log('\nSelecting and Validating Songs...');

        while (selectedRounds.length < 5 && availableIds.length > 0) {
            const idx = Math.floor(random() * availableIds.length);
            const songId = availableIds.splice(idx, 1)[0];
            const song = registry[songId];

            if (previousSongsSet.has(songId)) {
                console.log(`  - [${song.title}] Skipping since it was used previously`);
                continue;
            }

            const masterPath = path.join(MASTERS_DIR, song.filename);
            const songRandom = createSeededRandom(dateArg + songId);
            const snippetConfigs = [
                { id: 1, duration: 0.5, type: 'random' },
                { id: 2, duration: 1.0, type: 'random' },
                { id: 3, duration: 3.0, type: 'start' },
            ];

            const validatedSnippets = [];
            let songOk = true;

            for (const config of snippetConfigs) {
                let startTime = 0;
                let snippetOk = false;

                for (let retry = 0; retry <= MAX_RETRIES; retry++) {
                    if (config.type === 'random' || retry > 0) {
                        const min = song.duration * 0.1;
                        const max = song.duration * 0.9 - config.duration;
                        startTime = min + songRandom() * (max - min);
                    } else {
                        startTime = 0;
                    }

                    const volume = await getMeanVolume(masterPath, startTime, config.duration);
                    if (volume >= VOLUME_THRESHOLD) {
                        validatedSnippets.push({ ...config, startTime });
                        snippetOk = true;
                        break;
                    }
                    console.log(
                        `  - [${song.title}] Snippet ${config.id} too quiet (${volume}dB) at ${startTime.toFixed(2)}s. Retry ${retry + 1}/${MAX_RETRIES}`
                    );
                }

                if (!snippetOk) {
                    songOk = false;
                    break;
                }
            }

            if (songOk) {
                selectedRounds.push({
                    songId,
                    song,
                    snippets: validatedSnippets,
                });
                console.log(`  + Accepted: ${song.title}`);
            } else {
                console.log(`  ! Rejected: ${song.title} (too quiet after retries)`);
            }
        }

        if (selectedRounds.length < 5) {
            throw new Error('Could not find 5 valid songs with audible snippets');
        }

        const dayDir = path.join(OUTPUT_BASE_DIR, dateArg);
        await fs.mkdir(dayDir, { recursive: true });

        console.log('\nGenerating Snippets...');

        const roundsMeta = [];

        for (let i = 0; i < selectedRounds.length; i++) {
            const { songId, song, snippets } = selectedRounds[i];
            const round = i + 1;
            const masterPath = path.join(MASTERS_DIR, song.filename);

            console.log(`Round ${round}: ${song.title}`);

            for (const snip of snippets) {
                const outputName = `round-${round}-guess-${snip.id}.opus`;
                const outputPath = path.join(dayDir, outputName);

                await new Promise((resolve, reject) => {
                    ffmpeg(masterPath)
                        .setStartTime(snip.startTime)
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
                console.log(`  - Generated: ${outputName} (Start: ${snip.startTime.toFixed(2)}s)`);
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
