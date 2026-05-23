import type { ThemeName } from './themes';

export interface Song {
    id: string;
    artist: string;
    title: string;
    album: string;
}

export interface Guess {
    status: GuessStatus;
    id: string;
    title: string;
}

export type RoundStatus = 'playing' | 'won' | 'lost';
export type GuessStatus = 'skip' | 'wrong' | 'correct';

export interface GameState {
    currentRound: number;
    roundGuesses: Guess[][];
    roundStatuses: RoundStatus[];
    hasSaved?: boolean;
}

export interface DailyMeta {
    date: string;
    rounds: RoundInfo[];
}

export interface RoundInfo {
    round: number;
    songId: string;
}

export interface AlbumArt {
    name: string;
    file: string;
    isSingle: boolean;
}

export type AppSettings = {
    volume: number;
    theme: ThemeName;
};

export type ArchiveEntry = {
    date: string;
    day: number;
};
