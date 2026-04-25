import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SONGS_JSON = path.resolve(__dirname, '../data/songs.json');
const MASTERS_DIR = path.resolve(__dirname, '../masters');
const OUTPUT_BASE_DIR = path.resolve(__dirname, '../static/snippets'); // Local testing

// Deterministic random number generator based on a seed (the date)
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
		// 1. Get the date (default to today YYYY-MM-DD)
		const dateArg = process.argv[2] || new Date().toISOString().split('T')[0];
		console.log(`Generating challenge for: ${dateArg}`);

		// 2. Load songs
		const songs = JSON.parse(await fs.readFile(SONGS_JSON, 'utf-8'));
		if (songs.length < 5) {
			throw new Error('Not enough songs in songs.json (need at least 5)');
		}

		// 3. Setup seeded RNG
		const random = createSeededRandom(dateArg);

		// 4. Select 5 unique songs deterministically
		const selectedSongs = [];
		const availableSongs = [...songs];
		for (let i = 0; i < 5; i++) {
			const idx = Math.floor(random() * availableSongs.length);
			selectedSongs.push(availableSongs.splice(idx, 1)[0]);
		}

		// 5. Create output directory
		const dayDir = path.join(OUTPUT_BASE_DIR, dateArg);
		await fs.mkdir(dayDir, { recursive: true });

		console.log('\nGenerating Snippets...');

		// 6. Process each song
		for (let i = 0; i < selectedSongs.length; i++) {
			const song = selectedSongs[i];
			const round = i + 1;
			const masterPath = path.join(MASTERS_DIR, song.filename);

			console.log(`Round ${round}: ${song.title}`);

			const snippets = [
				{ id: 1, duration: 0.5, type: 'random' },
				{ id: 2, duration: 1.0, type: 'random' },
				{ id: 3, duration: 3.0, type: 'start' }
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
		}

		// 7. Generate a small metadata file for the frontend to know which songs were used (encrypted or hidden if needed)
		const challengeMeta = {
			date: dateArg,
			rounds: selectedSongs.map((s, i) => ({
				round: i + 1,
				songId: s.id
			}))
		};

		await fs.writeFile(path.join(dayDir, 'meta.json'), JSON.stringify(challengeMeta, null, 2));

		console.log(`\nDaily challenge generation complete! Files in: ${dayDir}`);
	} catch (error) {
		console.error('Generation failed:', error);
		process.exit(1);
	}
}

generateDaily();
