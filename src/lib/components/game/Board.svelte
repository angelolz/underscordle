<script lang="ts">
    import type { Song } from '$lib/interfaces';
    import { GUESSES_PER_ROUND, MAX_ROUNDS } from '$lib/statics';
    import AudioCard from './AudioCard.svelte';
    import SongCard from './SongCard.svelte';
    const {
        day,
        date,
        songList,
        gameState,
        dailyMeta,
        searcher,
        submitGuess,
        advanceRound,
        toggleResults,
    } = $props();

    function getBackgroundColor(i: number) {
        if (i === gameState.currentRound) {
            return 'bg-white/50';
        }

        switch (gameState.roundStatuses[i]) {
            case 'won':
                return 'bg-green-500';
            case 'lost':
                return 'bg-red-500';
            default:
                if (i === gameState.currentRound) return 'bg-white/50';
                else return '';
        }
    }
</script>

<div class="flex flex-col items-center gap-1 align-middle">
    <span class="text-lg font-bold text-white"><b>Day #{day}</b></span>
    <span class="flex flex-row gap-2">
        <span class="border-r-2 pr-2 text-sm text-white"
            ><b>Round {gameState.currentRound + 1} of {MAX_ROUNDS}</b></span
        >
        <div class="flex flex-row gap-2">
            {#each { length: MAX_ROUNDS } as _, i (i)}
                <div
                    class={`h-[16px] w-[16px] ${i === gameState.currentRound ? 'border-3' : 'border'} ${getBackgroundColor(i)} bg-red rounded-full border-white`}
                ></div>
            {/each}
        </div>
    </span>
</div>

<div class="my-4 flex flex-col gap-3">
    {#each { length: GUESSES_PER_ROUND } as _, i (i)}
        <AudioCard
            guessIndex={i}
            isActive={i <= gameState.roundGuesses[gameState.currentRound].length}
            guesses={gameState.roundGuesses[gameState.currentRound]}
            result={gameState.roundStatuses[gameState.currentRound] || null}
            name={`${date}/round-${gameState.currentRound + 1}-guess-${i + 1}.opus`}
            {searcher}
            {submitGuess}
        />
    {/each}
</div>

<div class="my-4">
    {#if gameState.roundStatuses[gameState.currentRound] !== 'playing'}
        <SongCard
            song={songList.find(
                (s: Song) => s.id === dailyMeta?.rounds[gameState.currentRound]?.songId
            )}
            currentRound={gameState.currentRound + 2}
            isLastRound={gameState.currentRound === MAX_ROUNDS - 1}
            {advanceRound}
            {toggleResults}
        />
    {/if}
</div>
