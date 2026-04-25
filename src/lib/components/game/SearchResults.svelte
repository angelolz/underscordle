<script lang="ts">
    import { fly } from 'svelte/transition';
    let { results, suggestionIndex, submitGuess } = $props();
</script>

{#if results.length > 0}
    <div transition:fly={{y: 10, duration: 200}} class="border border-white rounded-md absolute left-0 top-full mt-2 bg-black z-100 w-full overflow-hidden">
        <div class="flex flex-col">
        {#each results as result, i (result.id)}
            <button 
                class={`text-white ${i === suggestionIndex ? "font-bold" : ""} hover:font-bold text-left px-2 py-1 text-[12px] ${i === suggestionIndex ? "bg-white/20" : ""} hover:bg-white/20 transition-colors w-full`} 
                onclick={() => submitGuess(result.title, result.id)}
            >
                {result.title}
            </button>
        {/each}
        </div>
    </div>
{/if}
