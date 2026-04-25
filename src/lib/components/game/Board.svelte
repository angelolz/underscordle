<script lang="ts">
	import { Searcher } from "fast-fuzzy";
	import AudioCard from "./AudioCard.svelte";
    import songs from '../../../../data/songs.json';
	import { GUESSES_PER_ROUND, MAX_ROUNDS } from "$lib/statics";
	import { onMount } from "svelte";
	import type { DailyMeta, GameState, GuessStatus, Song } from "$lib/interfaces";
	import SongCard from "./SongCard.svelte";

	const songList: Song[] = songs.map(song => ({
		artist: song.artist,
	    title: song.title,
	    album: song.album,
	    id: song.id
	}));

	const searcher = new Searcher(songList, {
	    keySelector: (song) => song.title,
	    threshold: 0.70
	});

	// const date = new Date().toISOString().split('T')[0];
	const date = "2026-04-25";

	let day = 915;
	let dailyMeta = $state<DailyMeta | null>(null);
	let gameState: GameState = $state({
	    currentRound: 0,
	    roundGuesses: Array.from({ length: MAX_ROUNDS }, () => []),
	    roundStatuses: Array(MAX_ROUNDS).fill('playing')
	})
	$inspect(gameState);

	//when page loads
	onMount(async () => {
	    //get daily meta
	    const res = await fetch(`snippets/${date}/meta.json`);
	    if (res.ok) {dailyMeta = await res.json();}

	    //get current game
	    const saved = localStorage.getItem(`underscordle-${date}`)
	    if(saved) {
	        const parsed = JSON.parse(saved);

	        if (parsed.roundGuesses && parsed.roundStatuses) {
	            gameState.currentRound = parsed.currentRound && (parsed.currentRound >= 0 || parsed.currentRound < MAX_ROUNDS) ? parsed.currentRound : 0;

	            //todo: feel free to extend on more validation on this LMFAO you can do it later ig
	            gameState.roundGuesses = parsed.roundGuesses.slice(0, MAX_ROUNDS);
	            gameState.roundStatuses = parsed.roundStatuses.slice(0, MAX_ROUNDS);
	        }
	    }
	});

	//save everytime theres a change to game state
	$effect(() => {
	    localStorage.setItem(`underscordle-${date}`, JSON.stringify(gameState));
	});

	$effect(() => {
		if(dailyMeta === null) return;

	    if(gameState.roundGuesses[gameState.currentRound].some(g => g.status === "correct")) {
	        gameState.roundStatuses[gameState.currentRound] = "won";
	    } else if (gameState.roundGuesses[gameState.currentRound].length === GUESSES_PER_ROUND) {
	        gameState.roundStatuses[gameState.currentRound] = "lost";
		}
	})
    function submitGuess(title: string, id: string) {
        console.log("submitted: " + id);
		let status: GuessStatus;
		if (title === "") {
			status = "skip";
		} else if(id === dailyMeta?.rounds[gameState.currentRound].songId) {
			status = "correct";
		} else {
			status = "wrong";
		}
        gameState.roundGuesses[gameState.currentRound].push({status, title, id});
    }

    function getBackgroundColor(i: number) {
        if(i === gameState.currentRound) {
            return 'bg-white/50';
        }
		
        switch(gameState.roundStatuses[i]) {
            case 'won':
                return 'bg-green-500';
            case 'lost':
                return 'bg-red-500';
			default:
				if(i === gameState.currentRound)
					return 'bg-white/50';
				else return '';
        }
    }

</script>

<div class="flex flex-col justify-center align-middle items-center">
	<div class="flex flex-col gap-1 align-middle items-center">
		<span class="text-white text-lg font-bold"><b>Day #{day}</b></span>
		<span class="flex flex-row gap-2">
			<span class="text-white text-sm pr-2 border-r-2"><b>Round {gameState.currentRound + 1} of {MAX_ROUNDS}</b></span>
			<div class="flex flex-row gap-2">
				{#each {length: MAX_ROUNDS} as _, i (i)}
					<div class={`w-[16px] h-[16px] ${i === gameState.currentRound ? "border-3" : "border"} ${getBackgroundColor(i)} bg-red border-white rounded-full`}></div>
				{/each}
			</div>
		</span>
	</div>

	<div class="flex flex-col gap-3 my-4">
		{#each {length: GUESSES_PER_ROUND} as _, i (i)}
			<AudioCard
				guessIndex={i}
				isActive={i <= gameState.roundGuesses[gameState.currentRound].length}
				guesses={gameState.roundGuesses[gameState.currentRound]}
				result={gameState.roundGuesses[gameState.currentRound] || null}
				name={`${date}/round-${gameState.currentRound + 1}-guess-${i + 1}.opus`}
				{searcher}
				{submitGuess}
			/>
		{/each}
		{#if gameState.roundStatuses[gameState.currentRound] !== "playing"}
			<SongCard 
				song={songList.find(s => s.id === dailyMeta?.rounds[gameState.currentRound]?.songId)} 
				currentRound={gameState.currentRound + 2}
			/>
		{/if}
	</div>
</div>

