<script lang="ts">
    import { ChevronDoubleRightOutline, PlaySolid } from 'flowbite-svelte-icons';
    import SearchResults from './SearchResults.svelte';
    import type { Song } from '$lib/interfaces';

    const { guessIndex, isActive, guesses, searcher, submitGuess, src, result, player } = $props();
    let searchTerm = $state('');
    let suggestionIndex = $state(0);
    let results: Song[] = $state([]);

    $effect(() => {
        // only run searcher if current guess and search is non-empty
        if (isCurrentGuess() && searchTerm.trim().length > 0) {
            results = searcher.search(searchTerm).slice(0, 5);
        } else {
            results = [];
        }
    });

    $effect(() => {
        const _ = src;
        searchTerm = '';
        suggestionIndex = 0;
    });

    function getText() {
        switch (guessIndex) {
            case 0:
                return '0.5 seconds';
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
            player.play(src);
        }
    }

    function getBackgroundColor() {
        if (!guesses[guessIndex]) return 'border-theme-text';

        switch (guesses[guessIndex].status) {
            case 'correct':
                return 'bg-green-700/50 border-green-500';
            case 'wrong':
                return 'bg-red-700/30 border-red-500';
            case 'skip':
                return 'bg-theme-card border-theme-muted';
            default:
                return 'border-theme-text';
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
    <span class="flex w-full flex-row items-center gap-2 px-2">
        <button onclick={playClue} class="shrink-0 text-theme-text">
            <PlaySolid
                class={`h-[42px] w-[42px] ${isActive || result !== 'playing' ? 'transition-all hover:scale-110 active:scale-95' : ''}`}
            />
        </button>
        <div
            class="relative flex min-w-0 flex-1 flex-row rounded-3xl border border-theme-text focus-within:ring-2 focus-within:ring-theme-accent"
        >
            {#if isCurrentGuess()}
                <SearchResults {results} {suggestionIndex} {submitGuess} />
            {/if}
            <input
                class="text-md my-1 w-full min-w-0 border-none bg-transparent px-2 text-theme-text outline-none focus:ring-0"
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
                    class="m-1 flex flex-row items-center rounded-full bg-theme-accent px-2 transition-colors hover:bg-theme-text hover:text-theme-bg"
                    onclick={() => submitGuess('', '')}
                >
                    <ChevronDoubleRightOutline class="h-4 w-4 shrink-0" />
                    <span class="ml-0.5 text-sm">skip</span>
                </button>
            {/if}
        </div>
    </span>
    <div class="absolute right-4 bottom-1 text-[8px] text-theme-text opacity-75 sm:text-[10px]">
        {getText()}
    </div>
</div>
