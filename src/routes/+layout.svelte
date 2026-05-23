<script lang="ts">
    import './layout.css';
    import favicon32 from '$lib/assets/favicon-32x32.png';
    import favicon180 from '$lib/assets/favicon-180x180.png';
    import favicon192 from '$lib/assets/favicon-192x192.png';
    import favicon512 from '$lib/assets/favicon-512x512.png';

    import '@fontsource/poppins';
    import Header from '$lib/components/Header.svelte';
    import { ASSETS_URL } from '$lib/statics.js';
    import { onMount } from 'svelte';
    import { setSettingsContext } from '$lib/settings.svelte';
    import { themes } from '$lib/themes';

    import type { AppSettings } from '$lib/interfaces';

    let { children, data } = $props();
    let settings: AppSettings = $state({
        volume: 10,
        theme: 'dark',
        firstTimeHelp: false
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
            if (parsed.theme && parsed.theme in themes) {
                settings.theme = parsed.theme;
            }

            settings.firstTimeHelp = parsed.firstTimeHelp || false;
        } else {
            // No saved settings, this is a first-time user
            settings.firstTimeHelp = true;

            // Check system preference for theme
            const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
            if (prefersLight) {
                settings.theme = 'white';
            }
            
            // Save the initial settings so it's not a "first time" anymore next refresh
            saveSettings();
        }
    });

    $effect(() => {
        const themeData = themes[settings.theme];
        const root = document.documentElement;

        Object.entries(themeData).forEach(([key, value]) => {
            root.style.setProperty(`--${key}-color`, value);
        });

        document.body.style.backgroundColor = themeData.bg;
        document.body.style.color = themeData.text;
    });

    // save everytime theres a change to settings
    function saveSettings() {
        const stateToSave = JSON.stringify(settings);
        localStorage.setItem(`underscordle-settings`, stateToSave);
    }
</script>

<svelte:head>
    <link rel="icon" href={favicon32} />
    <link rel="icon" type="image/png" sizes="32x32" href={favicon32} />
    <link rel="apple-touch-icon" sizes="180x180" href={favicon180} />
    <link rel="icon" type="image/png" sizes="192x192" href={favicon192} />
    <link rel="icon" type="image/png" sizes="512x512" href={favicon512} />
    {#if data.albums && data.albums.length > 0}
        {#each data.albums as album (album.file)}
            <link rel="preload" as="image" href="{ASSETS_URL}/art/{album.file}" type="image/webp" />
        {/each}
    {/if}
</svelte:head>

<div class="m-auto flex w-full max-w-[800px] flex-col items-center p-2 align-middle">
    <Header bind:volume={settings.volume} bind:theme={settings.theme} bind:firstTimeHelp={settings.firstTimeHelp} {saveSettings} />
    {@render children()}
</div>
