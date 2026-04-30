// src/lib/server/challenges.ts
import type { DailyMeta, Song } from '$lib/interfaces';

type AlbumEntry = {
    name: string;
    file: string;
};

const R2_BASE_URL = 'https://assets.underscordle.org';

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
    const res = await fetchFn(`${R2_BASE_URL}/snippets/${date}/meta.json`);

    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to load challenge metadata for ${date}`);

    return res.json();
}

export async function loadSongCatalog(fetchFn: typeof fetch): Promise<Song[]> {
    const res = await fetchFn(`${R2_BASE_URL}/data/songs-lite.v1.json`);
    if (!res.ok) throw new Error('Failed to load song catalog');
    return res.json();
}

export async function loadAlbumMap(fetchFn: typeof fetch): Promise<AlbumEntry[]> {
    const res = await fetchFn(`${R2_BASE_URL}/data/albums.v1.json`);
    if (!res.ok) throw new Error('Failed to load album map');
    return res.json();
}
