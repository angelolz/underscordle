<script lang="ts">
    import { ChevronDoubleRightOutline, PlaySolid } from 'flowbite-svelte-icons';
    import SearchResults from './SearchResults.svelte';
    import type { Song } from '$lib/interfaces';
    import { useAudioPlayer } from '$lib/player.svelte';

    const { guessIndex, isActive, guesses, searcher, submitGuess, name, result } = $props();
    let searchTerm = $state('');
    let suggestionIndex = $state(0);
    let results: Song[] = $state([]);

    const player = useAudioPlayer(() => name);

    $effect(() => {
        results = searcher.search(searchTerm).slice(0, 5);
    });

    $effect(() => {
        const _ = name;
        searchTerm = '';
        suggestionIndex = 0;
    });

    function getText() {
        switch (guessIndex) {
            case 0:
                return '0.5 second';
            case 1:
                return '1 second';
            case 2:
                return 'Start of song (3 seconds)';
        }
    }

    function isCurrentGuess() {
        return guesses.length === guessIndex;
    }

    function playClue() {
        if (guesses.length >= guessIndex || result !== 'playing') {
            player.play();
        } else {
            console.log('ignored');
        }
    }

    function getBackgroundColor() {
        if (!guesses[guessIndex]) return 'border-white';

        switch (guesses[guessIndex].status) {
            case 'correct':
                return 'bg-green-700/50 border-green-500';
            case 'wrong':
                return 'bg-red-700/30 border-red-500';
            case 'skip':
                return 'bg-gray-700/50 border-gray-500';
            default:
                return 'border-white';
        }
    }

    function getGuess() {
        if (!guesses[guessIndex]) return searchTerm;

        switch (guesses[guessIndex].status) {
            case 'correct':
            case 'wrong':
                return guesses[guessIndex]?.title;
            case 'skip':
                return 'Skipped';
            default:
                return '';
        }
    }
</script>

<div
    class={`relative flex items-center ${!isCurrentGuess() || result !== 'playing' ? 'border' : 'border-3'} rounded-lg ${getBackgroundColor()} h-[80px] w-[400px] ${!isActive && result === 'playing' ? 'opacity-50' : ''}`}
>
    <span class="flex w-full flex-row items-center gap-2 px-3">
        <button onclick={playClue}>
            <PlaySolid
                class={`h-[40px] w-[40px] shrink-0 ${isActive || result !== 'playing' ? 'transition-all hover:scale-110 active:scale-95' : ''}`}
                color="white"
            />
        </button>
        <div
            class="relative flex-1 rounded-3xl border border-white focus-within:ring-2 focus-within:ring-white flex flex-row"
        >
            {#if isCurrentGuess()}
                <SearchResults {results} {suggestionIndex} {submitGuess} />
            {/if}
            <input
                class="my-1 w-full border-none bg-transparent px-2 text-white outline-none focus:ring-0"
                type="text"
                autocomplete="off"
                disabled={!isCurrentGuess() || (result && result !== 'playing')}
                value={getGuess()}
                oninput={(e) => {
                    searchTerm = e.currentTarget.value;
                }}
                onkeydown={(event) => {
                    if (event.key === 'Enter') {
                        submitGuess(results[suggestionIndex].title, results[suggestionIndex].id);
                        return;
                    }
                    if (event.key === 'ArrowUp') {
                        event.preventDefault();
                        suggestionIndex--;
                        if (suggestionIndex < 0) suggestionIndex = results.length - 1;
                        return;
                    }
                    if (event.key === 'ArrowDown') {
                        event.preventDefault();
                        suggestionIndex++;
                        if (suggestionIndex >= results.length) suggestionIndex = 0;
                        return;
                    }
                }}
            />
            {#if isCurrentGuess()}
                <button class="bg-gray-500 hover:bg-white rounded-full px-1 m-1 flex flex-row transition-colors items-center" onclick={() => submitGuess("", "")}>
                    <ChevronDoubleRightOutline class="shrink-0 h-4 w-4" />
                    <span class="text-sm">skip</span>
                </button>
            {/if}
        </div>
    </span>
    <div class="absolute right-4 bottom-1 text-[10px] text-white opacity-50">
        {getText()}
    </div>
</div>
