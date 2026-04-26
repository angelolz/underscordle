<script lang="ts">
    import { AngleRightOutline } from 'flowbite-svelte-icons';

    const { song, currentRound, advanceRound, isLastRound = false } = $props();
    $inspect(song);
</script>

<div
    class="flex w-full min-w-[300px] flex-row items-center justify-between gap-4 rounded-xl border border-white p-3"
>
    <div class="flex min-w-0 flex-1 flex-row items-center gap-2">
        <div class="h-[60px] w-[60px] shrink-0 rounded-xl border border-white"></div>
        <div class="flex min-w-0 flex-col">
            <span class="text-[14px] font-bold wrap-break-word text-white"
                >{song?.title || 'title'}</span
            >
            <span class="text-[12px] wrap-break-word text-white">{song?.artist || 'artist'}</span>
            <span class="truncate text-[10px] text-white italic">{song?.album || 'album'}</span>
        </div>
    </div>
    {#if !isLastRound}
        <button
            class="flex shrink-0 flex-row items-center justify-around gap-1 rounded-full px-3 py-2 align-middle text-[14px] whitespace-nowrap text-white ring ring-white transition-all hover:ring-2"
            onclick={() => {
                advanceRound?.();
            }}
        >
            <span>Round {currentRound}</span>
            <AngleRightOutline class="h-5 w-5 shrink-0" />
        </button>
    {:else}
        <button
            class="flex shrink-0 flex-row items-center justify-around gap-1 rounded-full px-3 py-2 align-middle text-[14px] whitespace-nowrap text-white ring ring-white transition-all hover:ring-2"
            onclick={() => {
                console.log('view results');
            }}
        >
            <span>View Results</span>
            <AngleRightOutline class="h-5 w-5 shrink-0" />
        </button>
    {/if}
</div>
