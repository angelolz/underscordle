<script lang="ts">
    import { fly } from "svelte/transition";


    const {children, revealed, onClose} = $props();
</script>

{#if revealed}
    <div transition:fly={{ y: 10, duration: 250 }} class="fixed inset-0 flex items-center justify-center bg-black/65 z-50 animate-fade-in animate">
        <div class="bg-[#121212] rounded-lg border-2 border-white w-full max-w-md mx-3 sm:mx-0 p-6 relative animate-fly-fade-in text-center">
            <button onclick={onClose} class="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors" title="close">
                <svg
                    class="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            {@render children()}
        </div>
    </div>
{/if}
