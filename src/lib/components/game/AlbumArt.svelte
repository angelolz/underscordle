<script lang="ts">
    import albums from '../../../../out/data/covers.json';

    const { albumName, class: className = '' } = $props();

    const albumFile = albums.find((a) => a.name === albumName)?.file;
    const src = albumFile ? `/out/art/${albumFile}` : '';
</script>

{#if src}
    <img {src} alt={albumName} class={className} />
{:else}
    <div class={`${className} bg-gray-800`}></div>
{/if}
