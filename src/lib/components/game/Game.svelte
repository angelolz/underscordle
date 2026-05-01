<script lang="ts">
    import { Searcher } from 'fast-fuzzy';
    import { GUESSES_PER_ROUND, MAX_ROUNDS } from '$lib/statics';
    import { untrack } from 'svelte';
    import type { GameState, GuessStatus, Song } from '$lib/interfaces';
    import Board from './Board.svelte';
    import Results from './Results.svelte';

    const { data } = $props();

    const songList: Song[] = $derived(data.songList || []);
    const dailyMeta = $derived(data.dailyMeta);
    const date = $derived(data.date);
    const day = $derived(data.day);

    const searcher = $derived(
        new Searcher(songList, {
            keySelector: (song) => song.title,
            threshold: 0.7,
        })
    );

    let loading = $state(true);
    let showResults = $state<boolean>(false);
    let gameState: GameState = $state({
        currentRound: 0,
        roundGuesses: Array.from({ length: MAX_ROUNDS }, () => []),
        roundStatuses: Array(MAX_ROUNDS).fill('playing'),
    });

    $effect(() => {
        if (!date) return;

        loading = true;

        // untrack to prevent this effect from reacting to the changes we make inside it
        untrack(() => {
            showResults = false;

            gameState.currentRound = 0;
            gameState.roundGuesses = Array.from({ length: MAX_ROUNDS }, () => []);
            gameState.roundStatuses = Array(MAX_ROUNDS).fill('playing');

            const saved = localStorage.getItem(`underscordle-${date}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.roundGuesses && parsed.roundStatuses) {
                    gameState.currentRound =
                        parsed.currentRound >= 0 && parsed.currentRound < MAX_ROUNDS
                            ? parsed.currentRound
                            : 0;

                    gameState.roundGuesses = parsed.roundGuesses.slice(0, MAX_ROUNDS);
                    gameState.roundStatuses = parsed.roundStatuses.slice(0, MAX_ROUNDS);

                    if (
                        gameState.roundStatuses[gameState.currentRound] !== 'playing' &&
                        gameState.currentRound !== MAX_ROUNDS - 1
                    ) {
                        gameState.currentRound = gameState.currentRound + 1;
                    }

                    if (gameState.roundStatuses.every((s) => s !== 'playing')) {
                        showResults = true;
                    }
                }
            }
        });

        loading = false;
    });

    // save everytime theres a change to game state
    $effect(() => {
        const stateToSave = JSON.stringify(gameState);
        if (!loading && date) {
            localStorage.setItem(`underscordle-${date}`, stateToSave);
        }
    });

    // round logic (win/loss detection)
    $effect(() => {
        if (!dailyMeta || loading) return;

        const currentRound = gameState.currentRound;
        const guesses = gameState.roundGuesses[currentRound];

        if (!guesses || guesses.length === 0) return;

        if (guesses.some((g) => g.status === 'correct')) {
            if (gameState.roundStatuses[currentRound] !== 'won') {
                gameState.roundStatuses[currentRound] = 'won';
            }
        } else if (guesses.length === GUESSES_PER_ROUND) {
            if (gameState.roundStatuses[currentRound] !== 'lost') {
                gameState.roundStatuses[currentRound] = 'lost';
            }
        }
    });

    function submitGuess(title: string, id: string) {
        if (!dailyMeta) return;

        let status: GuessStatus;
        if (title === '') {
            status = 'skip';
        } else if (id === dailyMeta.rounds[gameState.currentRound].songId) {
            status = 'correct';
        } else {
            status = 'wrong';
        }
        gameState.roundGuesses[gameState.currentRound].push({ status, title, id });
    }

    function advanceRound() {
        if (gameState.currentRound < MAX_ROUNDS - 1) {
            gameState.currentRound = gameState.currentRound + 1;
        }
    }

    function toggleResults() {
        showResults = !showResults;
    }
</script>

{#if !loading && dailyMeta}
    <div class="flex w-full flex-col items-center justify-center">
        {#if !showResults}
            <Board
                {day}
                {date}
                {songList}
                {gameState}
                {dailyMeta}
                {searcher}
                {submitGuess}
                {advanceRound}
                {toggleResults}
            />
        {:else}
            <Results {day} {date} {songList} {dailyMeta} {gameState} />
        {/if}
    </div>
{:else if !loading && !dailyMeta}
    <div class="p-10 text-center text-white">
        <p>No challenge found for this date. Please let Angel know about this!</p>
    </div>
{:else}
    <div class="flex w-full items-center justify-center">
        <div
            class="m-12 h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-white"
        ></div>
    </div>
{/if}
