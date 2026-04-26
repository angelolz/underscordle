<script lang="ts">
    import Game from '$lib/components/game/Game.svelte';
    import Header from '$lib/components/Header.svelte';
</script>

<div class="flex flex-col items-center">
    <div class="w-full max-w-[800px] px-4">
        <Header />
        <Game />
    </div>
</div>
