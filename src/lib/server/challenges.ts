// src/lib/server/challenges.ts
import type { DailyMeta, Song } from '$lib/interfaces';
import { ASSETS_URL, CHALLENGES_URL, GUESSES_PER_ROUND, MAX_ROUNDS } from '$lib/statics';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { challengeStats } from './db/schema';
import { eq, sql } from 'drizzle-orm';
import * as schema from '$lib/server/db/schema';

type AlbumEntry = {
    name: string;
    file: string;
};

export function validateChallengeDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

    const [year, month, day] = value.split('-').map(Number);
    const candidate = new Date(Date.UTC(year, month - 1, day));

    return (
        candidate.getUTCFullYear() === year &&
        candidate.getUTCMonth() === month - 1 &&
        candidate.getUTCDate() === day
    );
}

export function isFutureChallengeDate(value: string): boolean {
    const today = new Date();
    const todayUtc = new Date(
        Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );

    const [year, month, day] = value.split('-').map(Number);
    const candidate = new Date(Date.UTC(year, month - 1, day));

    return candidate.getTime() > todayUtc.getTime();
}

export async function loadChallengeByDate(
    fetchFn: typeof fetch,
    date: string
): Promise<DailyMeta | null> {
    const res = await fetchFn(`${CHALLENGES_URL}/${date}/meta.json`);

    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to load challenge metadata for ${date}`);

    return res.json();
}

export async function loadSongCatalog(fetchFn: typeof fetch): Promise<Song[]> {
    const res = await fetchFn(`${ASSETS_URL}/songs.json`);
    if (!res.ok) throw new Error('Failed to load song catalog');
    return res.json();
}

export async function loadAlbumMap(fetchFn: typeof fetch): Promise<AlbumEntry[]> {
    const res = await fetchFn(`${ASSETS_URL}/covers.json`);
    if (!res.ok) throw new Error('Failed to load album map');
    return res.json();
}

export async function getGlobalData(db: DrizzleD1Database<typeof schema>, date: string) {
    const data = await db.select().from(challengeStats).where(eq(challengeStats.date, date));
    console.log('found data: ' + JSON.stringify(data));

    //if there's no data for the date yet
    if (data.length === 0) {
        console.log('did not find a date, creating a row');
        return insertNewGlobalData(db, date);
    }

    return data[0];
}

async function insertNewGlobalData(db: DrizzleD1Database<typeof schema>, date: string) {
    const newRow = await db.insert(challengeStats).values({ date: date }).returning();
    console.log('created new row: ', JSON.stringify(newRow));

    return newRow[0];
}

export async function updateGlobalData(
    db: DrizzleD1Database<typeof schema>,
    date: string,
    points: number
) {
    if (isFutureChallengeDate(date) || points < 0 || points > MAX_ROUNDS * GUESSES_PER_ROUND) {
        return { success: false };
    }

    await db
        .update(challengeStats)
        .set({
            totalGames: sql`${challengeStats.totalGames} + 1`,
            totalPoints: sql`${challengeStats.totalPoints} + ${points}`,
        })
        .where(eq(challengeStats.date, date));

    return { success: true };
}
