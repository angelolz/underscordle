<script lang="ts">
    import type { Guess, GuessStatus, Song } from '$lib/interfaces';
    import { CHALLENGES_URL, MAX_ROUNDS, GUESSES_PER_ROUND, SITE } from '$lib/statics';
    import { AngleLeftOutline, ShareNodesOutline } from 'flowbite-svelte-icons';
    import AlbumArt from './AlbumArt.svelte';
    import ResultIcon from './ResultIcon.svelte';
    import TimerLeft from './TimerLeft.svelte';
    import { slide, fade } from 'svelte/transition';
    import { resolve } from '$app/paths';
    import { calculatePoints, calculateRoundsCorrect } from '$lib/gameUtils';
    import StreamingLinks from './StreamingLinks.svelte';

    const { day, isToday, date, songList, dailyMeta, gameState, player, globalData, stats } = $props();
    const SHARE_TEXT = 'Copy Results';
    let copyText = $state(SHARE_TEXT);

    let expandedSongs = $state<boolean[]>(Array(MAX_ROUNDS).fill(false));

    function toggleSong(index: number) {
        expandedSongs[index] = !expandedSongs[index];
    }

    const points = $derived(calculatePoints(gameState));
    const roundsCorrect = $derived(calculateRoundsCorrect(gameState));

    const communityAvg = $derived(
        globalData?.totalGames > 0
            ? (globalData.totalPoints / globalData.totalGames).toFixed(1)
            : '0.0'
    );

    function getSong(roundIndex: number) {
        const songId = dailyMeta.rounds[roundIndex].songId;
        return songList.find((song: Song) => song.id === songId);
    }

    function getResultEmoji(guessStatus: GuessStatus) {
        switch (guessStatus) {
            case 'skip':
                return '⏩';
            case 'wrong':
                return '🟥';
            case 'correct':
                return '🟩';
            default:
                return '';
        }
    }

    async function copyResults() {
        const text: string[] = [];
        text.push(`underscordle #${day} - ${points === MAX_ROUNDS * GUESSES_PER_ROUND ? "👑" : `${points}/${MAX_ROUNDS * GUESSES_PER_ROUND}`}`);
        text.push('');

        const grid = gameState.roundGuesses
            .slice(0, MAX_ROUNDS)
            .map((round: Guess[]) => {
                const emojis = round
                    .slice(0, GUESSES_PER_ROUND)
                    .map((r) => getResultEmoji(r.status));
                return emojis.join('');
            })
            .join('\n');

        text.push(grid);
        text.push(`<${SITE}>`);
        const fullText = text.join('\n');

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(fullText);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = fullText;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }

            copyText = 'Copied!';
            setTimeout(() => {
                copyText = SHARE_TEXT;
            }, 3000);
        } catch (err) {
            console.error('Failed to copy: ', err);
            copyText = 'Error!';
        }
    }
</script>

{#snippet statGroup(heading: string, val1: string | number, label1: string, val2: string | number, label2: string, extraClass: string = '')}
<div class="flex flex-row items-center justify-center gap-6 {extraClass}">
    <div class="flex flex-col items-center gap-2">
        <p class="text-sm text-theme-text uppercase">{heading}</p>
        <div class="flex flex-row justify-center gap-6">
            <div class="flex min-w-[50px] flex-col text-center">
                <span class="text-2xl font-bold">{val1}</span>
                <span class="text-sm whitespace-nowrap uppercase opacity-50">{label1}</span>
            </div>
            <div class="flex min-w-[50px] flex-col text-center">
                <span class="text-2xl font-bold">{val2}</span>
                <span class="text-sm whitespace-nowrap uppercase opacity-50">{label2}</span>
            </div>
        </div>
    </div>
</div>
{/snippet}

<div class="flex w-full flex-col items-center gap-6 px-1 sm:px-2">
    <div
        class="flex w-full max-w-[500px] flex-col items-center justify-center gap-4 rounded-xl border border-theme-text bg-theme-bg p-3 align-middle text-theme-text sm:gap-6 sm:p-4"
    >
        <div class="flex flex-col text-center">
            <span class="text-xl font-bold sm:text-2xl">Results</span>
            <span class="text-[10px] text-theme-muted sm:text-sm">{`Day #${day} - ${date}`}</span>
        </div>
        <div class="flex w-full flex-col gap-2">
            {#each { length: MAX_ROUNDS } as _, i (i)}
                {@const song = getSong(i)}
                <div class="flex w-full flex-row items-center justify-between gap-2">
                    <div class="flex min-w-0 flex-row items-center gap-2">
                        <AlbumArt
                            albumName={song?.album}
                            class="h-[20px] w-[20px] shrink-0 rounded-md border border-theme-text sm:h-[24px] sm:w-[24px]"
                        />
                        <div class="flex flex-col gap-1">
                            <button
                                class="flex items-center gap-1 text-left cursor-pointer hover:opacity-80 hover:underline transition-opacity focus:outline-none"
                                onclick={() => toggleSong(i)}
                                aria-expanded={expandedSongs[i]}
                            >
                                <svg
                                    class="h-3 w-3 shrink-0 text-theme-muted transition-transform duration-200"
                                    class:rotate-90={expandedSongs[i]}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                                <span class="text-sm font-semibold">{song?.title}</span>
                            </button>
                            {#if expandedSongs[i]}
                                <div transition:slide={{ duration: 200 }} class="overflow-hidden">
                                    <div transition:fade={{ duration: 150 }} class="pt-0.5">
                                        <StreamingLinks links={song.links} inGame={false} />
                                    </div>
                                </div>
                            {/if}
                        </div>
                    </div>
                    <div class="flex shrink-0 flex-row items-center mt-0.5">
                        {#each { length: GUESSES_PER_ROUND } as _, j (j)}
                            <ResultIcon
                                status={gameState.roundGuesses[i][j]?.status}
                                src={`${CHALLENGES_URL}/${date}/round-${i + 1}-guess-${j + 1}.opus`}
                                {player}
                            />
                        {/each}
                    </div>
                </div>
                {#if i < MAX_ROUNDS - 1}
                    <hr class="w-full border-theme-muted opacity-25" />
                {/if}
            {/each}
        </div>
        <div class="flex flex-col gap-4 w-full">
            <span class="flex items-center justify-evenly gap-6 flex-row">
                {@render statGroup('Your Stats', `${roundsCorrect}/${MAX_ROUNDS}`, 'Correct', `${points}/${MAX_ROUNDS * GUESSES_PER_ROUND}`, 'Points')}
                {@render statGroup('Community Stats', globalData?.totalGames || 0, 'Games', communityAvg, 'Avg. Pts.')}
            </span>
            {#if isToday}
                <span class="flex items-center justify-evenly gap-6 flex-row">
                    {#if stats}
                        {@render statGroup('Your Streak', `${stats.currentStreak}`, 'Streak', stats.bestStreak, 'Best')}
                    {/if}
                    <div class="flex flex-row items-center justify-center gap-6">
                        <TimerLeft />
                    </div>
                </span>
            {/if}
        </div>
        <div class="flex flex-col">
            <button
                class="flex shrink-0 cursor-pointer flex-row items-center justify-around gap-1 rounded-full bg-theme-accent px-3 py-2 align-middle text-[10px] whitespace-nowrap text-white ring ring-theme-text transition-all hover:opacity-80 hover:ring-2 active:scale-95 sm:text-[14px]"
                onclick={() => {
                    copyResults();
                }}
            >
                <ShareNodesOutline class="h-4 w-4 shrink-0 text-theme-text sm:h-5 sm:w-5" />
                <span class="text-theme-text">{copyText}</span>
            </button>
        </div>
    </div>
    <a
        class="flex flex-row items-center justify-center gap-0.5 text-theme-text hover:underline"
        href={resolve('/archive')}
    >
        <AngleLeftOutline class="h-4 w-4 shrink-0" />
        <p>{isToday ? 'Play past games' : 'Back to archive'}</p>
    </a>
</div>
