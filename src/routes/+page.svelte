<script lang="ts">
	import Board from "$lib/components/game/Board.svelte";
    import Header from "$lib/components/Header.svelte";

    let day = 503;
</script>

<div class="flex flex-col items-center">
    <div class="max-w-[800px]">
        <Header/>
        <Board {day} rounds=null songs=null/>
    </div>
</div>