<script lang="ts">
    import { page } from '$app/state';
    import type { AlbumArt } from '$lib/interfaces';
    import { ASSETS_URL } from '$lib/statics';

    const { albumName, class: className = '' } = $props();

    const albums = $derived(page.data.albums || []);
    const albumFile = $derived(albums.find((a: AlbumArt) => a.name === albumName)?.file);
    const src = $derived(albumFile ? `${ASSETS_URL}/art/${albumFile}` : '');
</script>

{#if src}
    <img {src} alt={albumName} class={className} />
{:else}
    <div class={`${className} bg-theme-card`}></div>
{/if}
