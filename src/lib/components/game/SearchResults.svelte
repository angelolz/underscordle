<script lang="ts">
    import { fly } from 'svelte/transition';
    let { results, suggestionIndex, submitGuess } = $props();
</script>

{#if results.length > 0}
    <div
        transition:fly={{ y: 10, duration: 250 }}
        class="absolute top-full left-0 z-100 mt-2 w-full overflow-hidden rounded-md border border-white bg-black"
    >
        <div class="flex flex-col">
            {#each results as result, i (result.id)}
                <div class="flex flex-row">
                    <button
                        class={`text-white ${i === suggestionIndex ? 'font-bold' : ''} px-2 py-1 text-left text-[12px] hover:font-bold ${i === suggestionIndex ? 'bg-white/20' : ''} w-full transition-colors hover:bg-white/20`}
                        onclick={() => submitGuess(result.title, result.id)}
                    >
                        {result.title}
                    </button>
                </div>
            {/each}
        </div>
    </div>
{/if}
