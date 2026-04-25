<script lang="ts">
 import { PlaySolid } from "flowbite-svelte-icons";
	import SearchResults from "./SearchResults.svelte";
	import type { Song } from "$lib/interfaces";
	import { onMount } from "svelte";

    const {guessIndex, isActive, guesses, searcher, submitGuess, name, result} = $props();
    let searchTerm = $state("");
    let suggestionIndex = $state(0);
    let results: Song[] = $state([]);
    let audio = $state<HTMLAudioElement | null>(null);
    

    $effect(() => {
        results = searcher.search(searchTerm).slice(0,5);
    })

    $effect(() => {
        if (audio && isActive) {
            audio.src = "/snippets/" + name;
            audio.load();
        }
    })

    onMount(() => {
        audio = new Audio();
        audio.preload = "auto";
        audio.volume = 0.10;

        $inspect(result);
    });

    function getText() {
        switch(guessIndex) {
            case 0:
                return "0.5 second";
            case 1:
                return "1 second";
            case 2:
                return "Start of song (3 seconds)";
        }
    }

    function isCurrentGuess() {
        return guesses.length === guessIndex;
    };

    function playClue() {
        audio?.play().catch(err => console.error("Playback failed:", err));
    }

    function getBackgroundColor() {
        if(!result[guessIndex]) return "border-white";

        switch(result[guessIndex].status) {
            case "correct":
                return 'bg-green-700/50 border-green-500';
            case "wrong":
                return "bg-red-700/30 border-red-500";
            case "skip":
                return "bg-gray-700/50 border-gray-500";
            default:
                return "border-white";
        }
    }

    function getGuess() {
        if(!result[guessIndex])
            return searchTerm;

        switch(result[guessIndex].status) {
            case "correct":
            case "wrong":
                return guesses[guessIndex]?.title;
            case "skip":
                return "Skipped";
            default:
                return "";
        }    
    }
</script>

<div class={`relative flex items-center ${!isCurrentGuess() ? "border" : "border-3"} rounded-lg ${getBackgroundColor()} w-[400px] h-[80px] ${!isActive ? "opacity-50" : ""}`}>
    <span class="flex flex-row gap-2 items-center px-3 w-full">
        <button onclick={playClue}>
            <PlaySolid class={`h-[40px] w-[40px] shrink-0 ${isActive ? "hover:scale-110 active:scale-95 transition-all" : ""}`} color="white"/>
        </button>
        <div class="border relative border-white rounded-3xl flex-1 focus-within:ring-2 focus-within:ring-white">
            {#if isCurrentGuess()}
                <SearchResults {results} {suggestionIndex} {submitGuess}/>
            {/if}
            <input 
                class="w-full text-white my-1 px-4 bg-transparent border-none focus:ring-0 outline-none"
                type="text"
                autocomplete="off"
                disabled={!isCurrentGuess()}
                value={getGuess()}
                oninput={(e) => { searchTerm = e.currentTarget.value }}
                onkeydown={(event) => {
                    if (event.key === 'Enter') {
                        submitGuess(results[suggestionIndex].title, results[suggestionIndex].id);
                        return;
                    }
                    if (event.key === 'ArrowUp') {
                        console.log("up");
                        event.preventDefault();
                        suggestionIndex--;
                        if (suggestionIndex < 0) suggestionIndex = results.length - 1;
                        return;
                    }
                    if (event.key === 'ArrowDown') {
                        console.log("down");
                        event.preventDefault();
                        suggestionIndex++;
                        if (suggestionIndex >= results.length) suggestionIndex = 0;
                        return;
                    }
                }} 
            />
        </div>
    </span>
    <div class="absolute bottom-1 right-4 text-white text-[10px] opacity-50">
        {getText()}
    </div>
</div>