<script lang="ts">
    import { GUESSES_PER_ROUND, MAX_ROUNDS } from '$lib/statics';
    import {
        CheckOutline,
        ChevronDoubleRightOutline,
        CloseOutline,
        MinusOutline,
    } from 'flowbite-svelte-icons';

    const { songList, dailyMeta, gameState } = $props();

    function getSong(roundIndex) {
        const songId = dailyMeta.rounds[roundIndex].songId;
        return songList.find((song) => song.id === songId).title;
    }

    function getRoundsCorrect() {
        return gameState.roundStatuses.filter((s) => s === 'won').length;
    }

    function getPoints() {
        return gameState.roundStatuses.reduce((total, status, i) => {
            if (status === 'won') {
                return total + (GUESSES_PER_ROUND - (gameState.roundGuesses[i].length - 1));
            }
            return total;
        }, 0);
    }

    function getMaxPoints() {
        return MAX_ROUNDS * GUESSES_PER_ROUND;
    }

    function getTimeUntilMidnight() {
        const now = new Date();
        const tomorrowUtc = new Date(now);
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

    $inspect('gameState inspect: ' + gameState);
</script>

<div
    class="flex w-[600px] flex-col items-center justify-center gap-6 rounded-xl border border-white p-4 align-middle text-white"
>
    <div class="flex flex-col text-center">
        <span class="text-2xl font-bold">Results</span>
        <span class="text-sm text-gray-500">Day #??? - 2026-09-15</span>
    </div>
    <div class="flex flex-col gap-2">
        {#each { length: MAX_ROUNDS } as _, i (i)}
            <div class="flex flex-row gap-4">
                <div class="flex flex-row justify-around gap-2">
                    <div class="h-[24px] w-[24px] rounded-md border border-white"></div>
                    <span>{getSong(i)}</span>
                </div>
                <div class="flex flex-row">
                    {#each { length: GUESSES_PER_ROUND } as _, j (j)}
                        {#if !gameState.roundGuesses[i][j]}
                            <MinusOutline class="h-6 w-6 shrink-0 text-gray-800" />
                        {:else if gameState.roundGuesses[i][j].status === 'correct'}
                            <CheckOutline class="h-6 w-6 shrink-0 text-green-500" />
                        {:else if gameState.roundGuesses[i][j].status === 'wrong'}
                            <CloseOutline class="h-6 w-6 shrink-0 text-red-500" />
                        {:else}
                            <ChevronDoubleRightOutline class="h-6 w-6 shrink-0" />
                        {/if}
                    {/each}
                </div>
            </div>
        {/each}
    </div>
    <div class="flex flex-row gap-8">
        <div class="flex flex-col text-center">
            <span class="text-2xl font-bold">{`${getRoundsCorrect()}/${MAX_ROUNDS}`}</span>
            <span>CORRECT</span>
        </div>
        <div class="flex flex-col text-center">
            <span class="text-2xl font-bold"
                >{`${getPoints()}/${MAX_ROUNDS * GUESSES_PER_ROUND}`}</span
            >
            <span>POINTS</span>
        </div>
    </div>
</div>

<div class="flex flex-col gap-1 text-white">
    <span>Next Challenge in:</span>
    <span class="text-2xl font-bold">asdfafdssdf</span>
</div>
