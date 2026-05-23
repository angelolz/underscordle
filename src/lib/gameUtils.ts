import type { GameState } from './interfaces';
import { GUESSES_PER_ROUND, MAX_ROUNDS } from './statics';

export function calculatePoints(gameState: GameState) {
    return gameState.roundStatuses
        .slice(0, MAX_ROUNDS)
        .reduce((total: number, status: string, i: number) => {
            if (status === 'won') {
                const guessesInRound = Math.min(
                    gameState.roundGuesses[i]?.length || 0,
                    GUESSES_PER_ROUND
                );

                if (guessesInRound > 0) {
                    return total + (GUESSES_PER_ROUND - (guessesInRound - 1));
                }
            }
            return total;
        }, 0);
}

export function calculateRoundsCorrect(gameState: GameState) {
    return gameState.roundStatuses.slice(0, MAX_ROUNDS).filter((s) => s === 'won').length;
}
