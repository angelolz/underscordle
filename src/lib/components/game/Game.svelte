<script lang="ts">
    import { Searcher } from 'fast-fuzzy';
    import songs from '../../../../data/songs-lite.json';
    import { GUESSES_PER_ROUND, MAX_ROUNDS } from '$lib/statics';
    import { onMount } from 'svelte';
    import type { DailyMeta, GameState, GuessStatus, Song } from '$lib/interfaces';
    import Board from './Board.svelte';
    import Results from './Results.svelte';
    import { SvelteDate } from 'svelte/reactivity';

    const songList: Song[] = songs.map((song) => ({
        artist: song.artist,
        title: song.title,
        album: song.album,
        id: song.id,
    }));

    const searcher = new Searcher(songList, {
        keySelector: (song) => song.title,
        threshold: 0.7,
    });

    // const date = new SvelteDate().toISOString().split('T')[0];
    const date = '2026-04-26';

    let day = 915;
    let loading = $state(true);
    let dailyMeta = $state<DailyMeta | null>(null);
    let showResults = $state<boolean>(false);
    let gameState: GameState = $state({
        currentRound: 0,
        roundGuesses: Array.from({ length: MAX_ROUNDS }, () => []),
        roundStatuses: Array(MAX_ROUNDS).fill('playing'),
    });
    $inspect(gameState);

    //when page loads
    onMount(async () => {
        //get daily meta
        const res = await fetch(`snippets/${date}/meta.json`);
        if (res.ok) {
            dailyMeta = await res.json();
        }

        //get current game
        const saved = localStorage.getItem(`underscordle-${date}`);
        console.log('saved: ' + saved);
        if (saved) {
            const parsed = JSON.parse(saved);
            console.log('parsed: ' + saved);

            if (parsed.roundGuesses && parsed.roundStatuses) {
                gameState.currentRound =
                    parsed.currentRound &&
                    (parsed.currentRound >= 0 || parsed.currentRound < MAX_ROUNDS)
                        ? parsed.currentRound
                        : 0;

                //todo: feel free to extend on more validation on this LMFAO you can do it later ig
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
        loading = false;
    });

    //save everytime theres a change to game state
    $effect(() => {
        if (!loading) {
            console.log('saved game');
            localStorage.setItem(`underscordle-${date}`, JSON.stringify(gameState));
        } else {
            console.log('not saving game');
        }
    });

    $effect(() => {
        if (dailyMeta === null) return;

        if (gameState.roundGuesses[gameState.currentRound].some((g) => g.status === 'correct')) {
            gameState.roundStatuses[gameState.currentRound] = 'won';
        } else if (gameState.roundGuesses[gameState.currentRound].length === GUESSES_PER_ROUND) {
            gameState.roundStatuses[gameState.currentRound] = 'lost';
        }
    });

    function submitGuess(title: string, id: string) {
        console.log('submitted: ' + id);
        let status: GuessStatus;
        if (title === '') {
            status = 'skip';
        } else if (id === dailyMeta?.rounds[gameState.currentRound].songId) {
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

{#if !loading}
    <div class="flex flex-col items-center justify-center">
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
{:else}
    <div class="flex w-full items-center justify-center">
        <div
            class="m-12 h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-white"
        ></div>
    </div>
{/if}
