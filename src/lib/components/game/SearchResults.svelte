<script lang="ts">
    import { fly } from 'svelte/transition';
    import AlbumArt from './AlbumArt.svelte';
    let { results, suggestionIndex, submitGuess } = $props();
</script>

{#if results.length > 0}
    <div
        transition:fly={{ y: 10, duration: 250 }}
        class="absolute top-full left-0 z-100 mt-2 w-full overflow-hidden rounded-md border border-white bg-black"
    >
        <div class="flex flex-col">
            {#each results as result, i (result.id)}
                <button
                    class={`text-white ${i === suggestionIndex ? 'font-bold' : ''} px-2 py-1 text-left text-[12px] hover:font-bold ${i === suggestionIndex ? 'bg-white/20' : ''} flex w-full flex-row items-center gap-2 transition-colors hover:bg-white/20`}
                    onclick={() => submitGuess(result.title, result.id)}
                >
                    <AlbumArt albumName={result?.album} class="h-[24px] w-[24px] rounded-md" />
                    {result.title}
                </button>
            {/each}
        </div>
    </div>
{/if}
