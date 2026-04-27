import ffmpeg from 'fluent-ffmpeg';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join, parse, resolve } from 'path';

const MASTERS_DIR = resolve('masters');
const OUTPUT_DIR = resolve('out', 'masters');

if (!existsSync(OUTPUT_DIR)) {
    console.log(`Creating output directory: ${OUTPUT_DIR}`);
    mkdirSync(OUTPUT_DIR, { recursive: true });
}

const files = readdirSync(MASTERS_DIR);
const audioExtensions = ['.flac', '.wav', '.mp3'];

console.log(`Found ${files.length} files in ${MASTERS_DIR}`);

async function convertFile(file) {
    const { ext, name } = parse(file);
    if (!audioExtensions.includes(ext.toLowerCase())) return;

    const inputPath = join(MASTERS_DIR, file);
    const outputPath = join(OUTPUT_DIR, `${name}.m4a`);

    return new Promise((resolvePromise, reject) => {
        ffmpeg(inputPath)
            .outputOptions('-map', '0:a') // map audio
            .outputOptions('-map', '0:v?') // map video/art if it exists
            .outputOptions('-c:v', 'copy') // copy the image without re-encoding
            .audioCodec('aac')
            .audioBitrate('192k')
            .outputOptions('-movflags', 'faststart')
            .on('start', () => {
                console.log(`Converting: ${file}`);
            })
            .on('error', (err, _, __) => {
                console.error(`Failed to convert ${file}:`, err.message);
                reject(err);
            })
            .on('end', () => {
                console.log(`Finished: ${name}.m4a`);
                resolvePromise();
            })
            .save(outputPath);
    });
}

async function run() {
    for (const file of files) {
        try {
            await convertFile(file);
        } catch (_) {
            /* ignored */
        }
    }
    console.log('All conversions complete!');
}

run();
