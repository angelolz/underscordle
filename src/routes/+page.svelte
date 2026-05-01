<script lang="ts">
    import { page } from '$app/state';
    import Game from '$lib/components/game/Game.svelte';
</script>

<Game data={page.data} />
