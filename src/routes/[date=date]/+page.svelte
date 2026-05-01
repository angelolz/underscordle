<script lang="ts">
    import Game from '$lib/components/game/Game.svelte';
    const { data } = $props();
</script>

<Game {data} />
