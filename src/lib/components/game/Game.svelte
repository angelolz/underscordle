<script lang="ts">
    import { Searcher } from 'fast-fuzzy';
    import { GUESSES_PER_ROUND, MAX_ROUNDS } from '$lib/statics';
    import { onDestroy, onMount, untrack } from 'svelte';
    import type { GameState, GuessStatus, Song } from '$lib/interfaces';
    import Board from './Board.svelte';
    import Results from './Results.svelte';
    import { AngleLeftOutline } from 'flowbite-svelte-icons';
    import { resolve } from '$app/paths';
    import { createSharedSnippetPlayer } from '$lib/player.svelte';
    import { getSettingsContext } from '$lib/settings.svelte';
    import { calculatePoints } from '$lib/gameUtils';
    import { invalidateAll } from '$app/navigation';
    import { calculateDays, getTodayDate } from '../../../params/date';

    const { data } = $props();

    const songList: Song[] = $derived(data.songList || []);
    const dailyMeta = $derived(data.dailyMeta);
    const date = $derived(data.date);
    const day = $derived(data.day);
    const globalData = $derived(data.globalData);
    const settings = getSettingsContext();
    const player = createSharedSnippetPlayer();
    const isToday = $derived(date === getTodayDate());

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
        hasSaved: false,
    });

    let stats = $state({
        currentStreak: 0,
        bestStreak:0, 
        lastChallengeCompletedDate: ""
    });

    onMount(() => {
        player.mount();
        player.setVolume(settings?.volume ?? 10);
    });

    onDestroy(() => {
        player.destroy();
    });

    $effect(() => {
        player.setVolume(settings?.volume ?? 10);
    });

    //stop playing when changing dates
    $effect(() => {
        const _ = date;
        player.stop();
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
            gameState.hasSaved = false;

            //get stats
            const savedStats = localStorage.getItem("underscordle-stats");
            if(savedStats) {
                const statsParsed = JSON.parse(savedStats);
                stats.currentStreak = statsParsed.currentStreak ?? 0;
                stats.bestStreak = statsParsed.bestStreak ?? 0;
                if (stats.currentStreak > stats.bestStreak) {
                    stats.bestStreak = stats.currentStreak;
                }
                stats.lastChallengeCompletedDate = statsParsed.lastChallengeCompletedDate ?? "";
            }

            //get save data for current date
            const savedGameData = localStorage.getItem(`underscordle-${date}`);
            if (savedGameData) {
                const parsed = JSON.parse(savedGameData);
                if (parsed.roundGuesses && parsed.roundStatuses) {
                    gameState.currentRound =
                        parsed.currentRound >= 0 && parsed.currentRound < MAX_ROUNDS
                            ? parsed.currentRound
                            : 0;

                    gameState.roundGuesses = parsed.roundGuesses.slice(0, MAX_ROUNDS);
                    gameState.roundStatuses = parsed.roundStatuses.slice(0, MAX_ROUNDS);
                    gameState.hasSaved = parsed.hasSaved || false;

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

    // save every time there changes to the stats
    $effect(() => {
        const statsToSave = JSON.stringify(stats);
        if(!loading) {
            localStorage.setItem("underscordle-stats", statsToSave);
        }
    })

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
        } else if (guesses.length >= GUESSES_PER_ROUND) {
            if (gameState.roundStatuses[currentRound] !== 'lost') {
                gameState.roundStatuses[currentRound] = 'lost';
            }
        }
    });

    // update streak upon finishing the last round
    $effect(() => {
        if (!isToday || loading) return;

        const isGameFinished = gameState.roundStatuses[MAX_ROUNDS - 1] !== 'playing';
        if (isGameFinished && stats.lastChallengeCompletedDate !== date) {
            const lastDate = stats.lastChallengeCompletedDate;
            if (lastDate === '') {
                // First game ever completed
                stats.currentStreak = 1;
            } else {
                const diff = Math.round(calculateDays(lastDate, date));
                if (diff === 2) {
                    // Completed yesterday, increment streak
                    stats.currentStreak += 1;
                } else if (diff > 2) {
                    // Missed a day or more, reset streak to 1
                    stats.currentStreak = 1;
                }
            }

            if (stats.currentStreak > stats.bestStreak) {
                stats.bestStreak = stats.currentStreak;
            }

            stats.lastChallengeCompletedDate = date;
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

    async function saveScoreToDb() {
        if (!date || gameState.hasSaved) return;

        const points = calculatePoints(gameState);
        try {
            const formData = new FormData();
            formData.append('points', points.toString());

            const response = await fetch('?/saveScore', {
                method: 'POST',
                body: formData,
                headers: {
                    'x-sveltekit-action': 'true',
                },
            });

            if (response.ok) {
                gameState.hasSaved = true;
                await invalidateAll();
            }
        } catch (e) {
            console.error('Failed to save score:', e);
        }
    }

    $effect(() => {
        if (!loading && showResults) {
            saveScoreToDb();
        }
    });

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
                {player}
            />
        {:else}
            <Results {day} {isToday} {date} {songList} {dailyMeta} {gameState} {player} {globalData} {stats} />
        {/if}
    </div>
{:else if !loading && !dailyMeta}
    <div
        class="flex flex-col items-center justify-center gap-4 p-10 text-center align-middle text-white"
    >
        <p>No challenge found for this date. Please let Angel know about this!</p>
        <a
            class="flex flex-row items-center gap-1 text-sm hover:underline"
            href={resolve('/archive')}
        >
            <AngleLeftOutline class="h-4 w-4 shrink-0" />
            <p>Play past games</p>
        </a>
    </div>
{:else}
    <div class="flex w-full items-center justify-center">
        <div
            class="m-12 h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-white"
        ></div>
    </div>
{/if}
