<script lang="ts">
    import {
        CheckOutline,
        ChevronDoubleRightOutline,
        CloseOutline,
        MinusOutline,
        PlaySolid,
    } from 'flowbite-svelte-icons';
    import { fade } from 'svelte/transition';
    import { useAudioPlayer } from '$lib/player.svelte';

    const { status, name } = $props();
    let showPlay = $state(false);

    const player = useAudioPlayer(() => name);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
    class="relative flex h-6 w-6 cursor-pointer items-center justify-center"
    onmouseenter={() => (showPlay = true)}
    onmouseleave={() => (showPlay = false)}
    onclick={(e) => {
        e.stopPropagation();
        player.play();
    }}
    role="button"
    tabindex="0"
>
    {#if showPlay && name}
        <div in:fade={{ duration: 150 }} out:fade={{ duration: 150 }} class="absolute inset-0">
            <PlaySolid class="h-6 w-6" color="white" />
        </div>
    {:else}
        <div
            in:fade={{ duration: 150 }}
            out:fade={{ duration: 150 }}
            class="absolute inset-0 flex items-center justify-center"
        >
            {#if !status}
                <MinusOutline class="h-6 w-6 shrink-0 text-gray-800" />
            {:else if status === 'correct'}
                <CheckOutline class="h-6 w-6 shrink-0 text-green-500" />
            {:else if status === 'wrong'}
                <CloseOutline class="h-6 w-6 shrink-0 text-red-500" />
            {:else}
                <ChevronDoubleRightOutline class="h-6 w-6 shrink-0" />
            {/if}
        </div>
    {/if}
</div>
