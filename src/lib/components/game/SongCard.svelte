<script lang="ts">
	import { AngleRightOutline } from "flowbite-svelte-icons";

    const {song, currentRound, advanceRound, isLastRound = false} = $props();
    $inspect(song);
</script>

<div class="flex flex-row gap-4 p-3 border border-white rounded-xl justify-between items-center max-w-[400px] w-full">
    <div class="flex flex-row gap-2 items-center flex-1 min-w-0">
        <div class="w-[60px] h-[60px] rounded-xl border-white border shrink-0"></div>
        <div class="flex flex-col min-w-0">
            <span class="font-bold text-white text-[14px] break-words">{song?.title || 'title'}</span>
            <span class="italic text-white text-[10px] truncate">{song?.artist || 'artist'}</span>
        </div>
    </div>
    {#if !isLastRound}
        <button class="text-white rounded-full py-2 px-3 ring ring-white hover:ring-2 transition-all text-[14px] whitespace-nowrap shrink-0 flex flex-row items-center align-middle justify-around gap-1"
        onclick={() => {advanceRound?.()}}>
            <span>Round {currentRound}</span>
            <AngleRightOutline class="shrink-0 h-5 w-5" />
        </button>
    {:else}
        <div class="text-white font-bold text-[14px] px-3">
            Final Round
        </div>
    {/if}
</div>