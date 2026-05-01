<script lang="ts">
    import type { Guess, GuessStatus, RoundStatus, Song } from '$lib/interfaces';
    import { GUESSES_PER_ROUND, MAX_ROUNDS } from '$lib/statics';
    import { ShareNodesOutline } from 'flowbite-svelte-icons';
    import { onDestroy, onMount } from 'svelte';
    import { SvelteDate } from 'svelte/reactivity';
    import AlbumArt from './AlbumArt.svelte';
    import ResultIcon from './ResultIcon.svelte';

    const { day, date, songList, dailyMeta, gameState } = $props();
    const SHARE_TEXT = 'Copy Results';
    let timeLeft: string | null = $state(getTimeUntilMidnight());
    let copyText = $state(SHARE_TEXT);
    let timer: NodeJS.Timeout | null = null;

    function getSong(roundIndex: number) {
        const songId = dailyMeta.rounds[roundIndex].songId;
        return songList.find((song: Song) => song.id === songId);
    }

    function getRoundsCorrect() {
        return gameState.roundStatuses.filter((s: RoundStatus) => s === 'won').length;
    }

    function getPoints() {
        return gameState.roundStatuses.reduce((total: number, status: string, i: number) => {
            if (status === 'won') {
                return total + (GUESSES_PER_ROUND - (gameState.roundGuesses[i].length - 1));
            }
            return total;
        }, 0);
    }

    function getTimeUntilMidnight() {
        const now = new SvelteDate();
        const tomorrowUtc = new SvelteDate(now.getTime());
        tomorrowUtc.setUTCDate(now.getUTCDate() + 1);
        tomorrowUtc.setUTCHours(0, 0, 0, 0);

        const timeLeft = tomorrowUtc.getTime() - now.getTime();

        const hours = Math.floor((timeLeft / 1000 / 60 / 60) % 24)
            .toString()
            .padStart(2, '0');
        const minutes = Math.floor((timeLeft / 1000 / 60) % 60)
            .toString()
            .padStart(2, '0');
        const seconds = Math.floor((timeLeft / 1000) % 60)
            .toString()
            .padStart(2, '0');

        return `${hours}:${minutes}:${seconds}`;
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
        text.push(`underscordle #${day} - ${getPoints()}/${MAX_ROUNDS * GUESSES_PER_ROUND}`);
        text.push('');

        const grid = gameState.roundGuesses
            .map((round: Guess[]) => {
                const emojis = round.map((r) => getResultEmoji(r.status));
                return emojis.join('');
            })
            .join('\n');

        text.push(grid);
        text.push('<https://underscordle.com>');
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

    onMount(() => {
        timer = setInterval(() => {
            timeLeft = getTimeUntilMidnight();
        }, 1000);
    });

    onDestroy(() => {
        if (timer) {
            clearInterval(timer);
        }
    });

    $inspect('gameState inspect: ' + gameState);
</script>

<div class="flex w-full flex-col items-center gap-6 px-1 sm:px-2">
    <div
        class="flex w-full max-w-[500px] flex-col items-center justify-center gap-4 rounded-xl border border-white p-3 align-middle text-white sm:gap-6 sm:p-4"
    >
        <div class="flex flex-col text-center">
            <span class="text-xl font-bold sm:text-2xl">Results</span>
            <span class="text-[10px] text-gray-500 sm:text-sm">{`Day #${day} - ${date}`}</span>
        </div>
        <div class="flex w-full flex-col gap-2">
            {#each { length: MAX_ROUNDS } as _, i (i)}
                {@const song = getSong(i)}
                <div class="flex w-full flex-row items-center justify-between gap-2">
                    <div class="flex min-w-0 flex-row items-center gap-2">
                        <AlbumArt
                            albumName={song?.album}
                            class="h-[20px] w-[20px] shrink-0 rounded-md border border-white sm:h-[24px] sm:w-[24px]"
                        />
                        <span class="truncate text-xs sm:text-sm">{song?.title}</span>
                    </div>
                    <div class="flex shrink-0 flex-row items-center">
                        {#each { length: GUESSES_PER_ROUND } as _, j (j)}
                            <ResultIcon
                                status={gameState.roundGuesses[i][j]?.status}
                                name={`${date}/round-${i + 1}-guess-${j + 1}.opus`}
                            />
                        {/each}
                    </div>
                </div>
                {#if i < MAX_ROUNDS - 1}
                    <hr class="text-gray-500" />
                {/if}
            {/each}
        </div>
        <div class="flex w-full flex-row flex-wrap items-center justify-center gap-2 sm:gap-6">
            <div class="flex min-w-[50px] flex-col text-center">
                <span class="text-base font-bold sm:text-2xl"
                    >{`${getRoundsCorrect()}/${MAX_ROUNDS}`}</span
                >
                <span class="text-[8px] sm:text-sm">CORRECT</span>
            </div>
            <div class="flex min-w-[50px] flex-col text-center">
                <span class="text-base font-bold sm:text-2xl"
                    >{`${getPoints()}/${MAX_ROUNDS * GUESSES_PER_ROUND}`}</span
                >
                <span class="text-[8px] sm:text-sm">POINTS</span>
            </div>
            <div class="flex min-w-[50px] flex-col text-center">
                <span class="text-base font-bold sm:text-2xl"
                    >{(getPoints() / MAX_ROUNDS).toFixed(1)}</span
                >
                <span class="text-[8px] sm:text-sm">AVG. PTS</span>
            </div>
            <button
                class="mt-2 flex shrink-0 flex-row items-center justify-around gap-1 rounded-full px-3 py-2 align-middle text-[10px] whitespace-nowrap text-white ring ring-white transition-all hover:bg-white/25 hover:ring-2 sm:mt-0 sm:text-[14px]"
                onclick={() => {
                    copyResults();
                }}
            >
                <ShareNodesOutline class="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                <span>{copyText}</span>
            </button>
        </div>
    </div>
    <div class="flex flex-col text-center text-white">
        <span>Next Challenge in:</span>
        <span class="text-2xl font-bold">{timeLeft}</span>
    </div>
</div>
