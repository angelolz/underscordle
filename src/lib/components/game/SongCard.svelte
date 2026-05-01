<script lang="ts">
    import { AngleRightOutline } from 'flowbite-svelte-icons';
    import AlbumArt from './AlbumArt.svelte';

    const { song, currentRound, advanceRound, isLastRound = false, toggleResults } = $props();
</script>

<div
    class="flex w-full max-w-[400px] flex-row items-center justify-between gap-4 rounded-xl border border-white p-3"
>
    <div class="flex min-w-0 flex-1 flex-row items-center gap-2">
        <AlbumArt
            albumName={song?.album}
            class="h-[60px] w-[60px] shrink-0 rounded-xl border border-white"
        />
        <div class="flex min-w-0 flex-col overflow-hidden">
            <span class="text-[14px] font-bold text-white">{song?.title || 'title'}</span>
            <span class="text-[12px] text-white">{song?.artist || 'artist'}</span>
            <span class="text-[10px] text-white italic">{song?.album || 'album'}</span>
        </div>
    </div>
    <button
        class="flex shrink-0 flex-row items-center justify-around gap-1 rounded-full px-3 py-2 align-middle text-[12px] whitespace-nowrap text-white ring ring-white transition-all hover:ring-2 sm:text-[14px]"
        onclick={() => {
            if (!isLastRound) advanceRound?.();
            else toggleResults();
        }}
    >
        {#if !isLastRound}
            <span>Round {currentRound}</span>
        {:else}
            <span>Results</span>
        {/if}
        <AngleRightOutline class="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
    </button>
</div>
