<script lang="ts">
    import './layout.css';
    import favicon from '$lib/assets/favicon.svg';
    import '@fontsource/poppins';
    import Header from '$lib/components/Header.svelte';
    import { ASSETS_URL } from '$lib/statics.js';

    let { children, data } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    {#if data.albums && data.albums.length > 0}
        {#each data.albums as album (album.file)}
            <link rel="preload" as="image" href="{ASSETS_URL}/art/{album.file}" type="image/webp" />
        {/each}
    {/if}
</svelte:head>

<div class="flex flex-col items-center">
    <div class="w-full max-w-[800px] px-4">
        <Header />
        {@render children()}
    </div>
</div>
