<script lang="ts">
    import './layout.css';
    import favicon from '$lib/assets/favicon.svg';
    import '@fontsource/poppins';
    import Header from '$lib/components/Header.svelte';

    let { children } = $props();

    const artwork = import.meta.glob('../../out/art/*.webp');
    const artPaths = Object.keys(artwork).map((path) => path.replace('../../static', ''));
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    {#each artPaths as path (path)}
        <link rel="preload" as="image" href={path} type="image/webp" />
    {/each}
</svelte:head>

<div class="flex flex-col items-center">
    <div class="w-full max-w-[800px] px-4">
        <Header />
        {@render children()}
    </div>
</div>
