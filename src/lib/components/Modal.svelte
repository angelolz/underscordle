<script lang="ts">
    import { fly } from 'svelte/transition';

    const { children, revealed, onClose } = $props();
</script>

{#if revealed}
    <div
        transition:fly={{ y: 10, duration: 250 }}
        class="animate-fade-in animate fixed inset-0 z-50 flex items-center justify-center bg-black/65"
    >
        <div
            class="animate-fly-fade-in relative mx-3 w-full max-w-md rounded-lg border-2 border-white bg-[#121212] p-6 text-center sm:mx-0"
        >
            <button
                onclick={onClose}
                class="absolute top-2 right-2 text-gray-400 transition-colors hover:text-white"
                title="close"
            >
                <svg
                    class="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width={2}
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>
            {@render children()}
        </div>
    </div>
{/if}
