import type { GameState } from './interfaces';
import { GUESSES_PER_ROUND } from './statics';

export function calculatePoints(gameState: GameState) {
    return gameState.roundStatuses.reduce((total: number, status: string, i: number) => {
        if (status === 'won') {
            const guessesInRound = gameState.roundGuesses[i]?.length || 0;
            return total + (GUESSES_PER_ROUND - (guessesInRound - 1));
        }
        return total;
    }, 0);
}

export function calculateRoundsCorrect(gameState: GameState) {
    return gameState.roundStatuses.filter((s) => s === 'won').length;
}
