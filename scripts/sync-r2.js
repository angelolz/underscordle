import { snapshotDir, syncPull, syncPush } from './lib/r2.js';
import path from 'path';

const command = process.argv[2];

const BUCKETS = {
    masters: 'underscordle-music-list',
    data: 'underscordle-data',
    challenges: 'underscordle-challenges',
};

const DIRS = {
    masters: path.resolve('out/masters'),
    data: path.resolve('out/data'),
    art: path.resolve('out/covers'),
    dailies: path.resolve('out/dailies'),
    challenges: path.resolve('out/challenges'),
};

async function main() {
    try {
        switch (command) {
            case 'pull-masters':
                await syncPull(BUCKETS.masters, '', DIRS.masters);
                break;

            case 'pull-data':
                await syncPull(BUCKETS.data, '', DIRS.data, ['art/', 'history/']);
                break;

            case 'pull-art':
                await syncPull(BUCKETS.data, 'art/', DIRS.art);
                break;

            case 'pull-challenges':
                await syncPull(BUCKETS.challenges, '', DIRS.challenges);
                break;

            case 'push-data':
                {
                    const snapshotId = new Date().toISOString().replace(/[.:]/g, '-');
                    await snapshotDir(DIRS.data, BUCKETS.data, `history/data/${snapshotId}`, '', [
                        'art/',
                        'history/',
                    ]);
                }
                await syncPush(DIRS.data, BUCKETS.data, '');
                await syncPush(DIRS.art, BUCKETS.data, 'art');
                break;

            case 'push-challenges':
                await syncPush(DIRS.dailies, BUCKETS.challenges, '');
                break;

            default:
                console.log(
                    'Usage: node scripts/sync-r2.js [pull-masters|pull-data|pull-art|pull-challenges|push-data|push-challenges]'
                );
                process.exit(1);
        }
        console.log('Sync complete!');
    } catch (error) {
        console.error('Sync failed:', error);
        process.exit(1);
    }
}

main();
