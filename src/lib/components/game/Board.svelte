<script lang="ts">
	import AudioCard from "./AudioCard.svelte";

    let { day, rounds, songs } = $props();
</script>

<div class="flex flex-col justify-center align-middle items-center">
    <span class="text-white text-lg"><b>Day #{day}</b></span>
    <AudioCard guess={0}/>
    <AudioCard guess={1}/>
    <AudioCard guess={2}/>
</div>

