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
        // only run searcher if current guess and search is non-empty
        if(isCurrentGuess() && searchTerm.trim().length > 0) { 
            results = searcher.search(searchTerm).slice(0, 5);
        }
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
    class={`relative flex shrink-0 items-center ${!isCurrentGuess() || result !== 'playing' ? 'border' : 'border-3'} h-[80px] w-full max-w-[400px] rounded-lg ${getBackgroundColor()} ${!isActive && result === 'playing' ? 'opacity-50' : ''}`}
>
    <span class="flex w-full flex-row items-center gap-2 px-2 sm:px-3">
        <button onclick={playClue} class="shrink-0">
            <PlaySolid
                class={`h-[32px] w-[32px] sm:h-[40px] sm:w-[40px] ${isActive || result !== 'playing' ? 'transition-all hover:scale-110 active:scale-95' : ''}`}
                color="white"
            />
        </button>
        <div
            class="relative flex min-w-0 flex-1 flex-row rounded-3xl border border-white focus-within:ring-2 focus-within:ring-white"
        >
            {#if isCurrentGuess()}
                <SearchResults {results} {suggestionIndex} {submitGuess} />
            {/if}
            <input
                class="my-1 w-full min-w-0 border-none bg-transparent px-2 text-sm text-white outline-none focus:ring-0 sm:text-base"
                type="text"
                autocomplete="off"
                placeholder={isCurrentGuess() ? 'Guess the song...' : ''}
                disabled={!isCurrentGuess() || (result && result !== 'playing')}
                value={getGuess()}
                oninput={(e) => {
                    searchTerm = e.currentTarget.value;
                }}
                onkeydown={(event) => {
                    if (event.key === 'Enter') {
                        if (results[suggestionIndex]) {
                            submitGuess(
                                results[suggestionIndex].title,
                                results[suggestionIndex].id
                            );
                        } else {
                            // Optional: handle enter with no results
                        }
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
            {#if isCurrentGuess() && result === 'playing'}
                <button
                    class="m-1 flex flex-row items-center rounded-full bg-gray-500 px-2 transition-colors hover:bg-white"
                    onclick={() => submitGuess('', '')}
                >
                    <ChevronDoubleRightOutline class="h-3 w-3 shrink-0 sm:h-4 sm:w-4" />
                    <span class="ml-0.5 text-[10px] sm:text-sm">skip</span>
                </button>
            {/if}
        </div>
    </span>
    <div class="absolute right-4 bottom-1 text-[8px] text-white opacity-50 sm:text-[10px]">
        {getText()}
    </div>
</div>
