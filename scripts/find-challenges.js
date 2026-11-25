import { readdir, readFile, stat } from 'fs/promises';
import path from 'path';

const dates = [];
const songId = process.argv[2];

async function findChallenges() {
    if (!songId) {
        console.error('ERROR: Must provide a song ID.');
        process.exitCode = 1;
        return;
    }

    await processDir('out/challenges');
    console.log(`The songId (${songId}) is found in ${dates.length} challenge(s).`);
    if (dates.length > 0) {
        console.log('-------------------');
        dates.forEach((date) => {
            console.log(date);
        });
    }
}

async function processDir(filePath) {
    const files = await readdir(filePath);
    for (const file of files) {
        const currentObject = path.join(filePath, file);
        const fileStats = await stat(currentObject);

        if (fileStats.isFile() && file.endsWith('.json')) {
            await processFile(currentObject);
        } else if (fileStats.isDirectory()) {
            await processDir(currentObject);
        }
    }
}

async function processFile(filePath) {
    const data = await readFile(filePath, 'utf8');
    const challengeData = JSON.parse(data);
    for (const round of challengeData.rounds ?? []) {
        if (round.songId === songId) {
            dates.push(challengeData.date);
            return;
        }
    }
}

findChallenges().catch((error) => {
    console.error('Failed to find challenges:', error);
    process.exitCode = 1;
});
