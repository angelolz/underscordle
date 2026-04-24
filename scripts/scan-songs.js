import * as mm from 'music-metadata';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const MASTERS_DIR = path.resolve(__dirname, '../masters');
const OUTPUT_FILE = path.resolve(__dirname, '../data/songs.json');
const SUPPORTED_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.flac', '.ogg'];

async function scanSongs() {
	try {
		console.log(`Scanning directory: ${MASTERS_DIR}`);
		const files = await fs.readdir(MASTERS_DIR);
		const songList = [];

		for (const file of files) {
			const ext = path.extname(file).toLowerCase();
			if (SUPPORTED_EXTENSIONS.includes(ext)) {
				const fullPath = path.join(MASTERS_DIR, file);
				console.log(`Processing: ${file}...`);

				const metadata = await mm.parseFile(fullPath);

				songList.push({
					id: Buffer.from(file).toString('base64').substring(0, 12), // Stable ID based on filename
					filename: file,
					title: metadata.common.title || path.basename(file, ext),
					artist: metadata.common.artist || 'Unknown Artist',
					album: metadata.common.album || 'Unknown Album',
					duration: metadata.format.duration,
					year: metadata.common.year
				});
			}
		}

		// Ensure output directory exists
		await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });

		await fs.writeFile(OUTPUT_FILE, JSON.stringify(songList, null, 2));
		console.log(`\nSuccess! Generated manifest for ${songList.length} songs.`);
		console.log(`Output saved to: ${OUTPUT_FILE}`);
	} catch (error) {
		console.error('Error scanning songs:', error);
		process.exit(1);
	}
}

scanSongs();
