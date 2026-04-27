<script lang="ts">
    import './layout.css';
    import favicon from '$lib/assets/favicon.svg';
    import '@fontsource/poppins';

    let { children } = $props();

    const artwork = import.meta.glob('../../static/art/*.webp');
    const artPaths = Object.keys(artwork).map((path) => path.replace('../../static', ''));
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    {#each artPaths as path (path)}
        <link rel="preload" as="image" href={path} type="image/webp" />
    {/each}
</svelte:head>
{@render children()}
