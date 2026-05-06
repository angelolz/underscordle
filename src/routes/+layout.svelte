<script lang="ts">
    import './layout.css';
    import favicon from '$lib/assets/favicon.svg';
    import '@fontsource/poppins';
    import Header from '$lib/components/Header.svelte';
    import { ASSETS_URL } from '$lib/statics.js';
    import { onMount } from 'svelte';
    import { setSettingsContext } from '$lib/settings.svelte';

    let { children, data } = $props();
    let settings = $state({
        volume: 10,
    });
    setSettingsContext(settings);

    onMount(() => {
        const settingsJson = localStorage.getItem(`underscordle-settings`);
        if (settingsJson) {
            const parsed = JSON.parse(settingsJson);
            const volumeNumber = Number(parsed.volume);
            if (!isNaN(volumeNumber) && volumeNumber >= 1 && volumeNumber <= 100) {
                settings.volume = volumeNumber;
            }
        }
    });
    // save everytime theres a change to settings
    $effect(() => {
        const stateToSave = JSON.stringify(settings);
        localStorage.setItem(`underscordle-settings`, stateToSave);
        console.log('saved settings');
    });
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    {#if data.albums && data.albums.length > 0}
        {#each data.albums as album (album.file)}
            <link rel="preload" as="image" href="{ASSETS_URL}/art/{album.file}" type="image/webp" />
        {/each}
    {/if}
</svelte:head>

<div class="m-auto flex w-full max-w-[800px] flex-col items-center p-2 align-middle">
    <Header bind:volume={settings.volume} />
    {@render children()}
</div>
