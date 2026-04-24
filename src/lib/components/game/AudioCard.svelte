<script lang="ts">
 import { PlaySolid } from "flowbite-svelte-icons";

 const {guess} = $props();

 function getText() {
    switch(guess) {
        case 0:
            return "0.5 second";
        case 1:
            return "1 second";
        case 2:
            return "Start of song (3 seconds)";
    }
 }
</script>

<div class="relative flex items-center border rounded-lg border-white w-[400px] h-[80px] my-2">
    <span class="flex flex-row gap-2 items-center px-3 w-full">
        <PlaySolid class="h-[40px] w-[40px] shrink-0" color="white"/>
        <div class="border border-white rounded-3xl flex-1 focus-within:ring-2 focus-within:ring-white">
            <input type="text" class="w-full text-white my-1 px-4 bg-transparent border-none focus:ring-0 outline-none" value="test">
        </div>
    </span>
    <div class="absolute bottom-1 right-4 text-white text-[10px] opacity-50">
        {getText()}
    </div>
</div>