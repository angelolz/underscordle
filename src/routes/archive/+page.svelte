<script lang="ts">
    import { resolve } from '$app/paths';
    import type { ArchiveEntry } from '$lib/interfaces.js';
    import { onMount } from 'svelte';
    const { data } = $props();

    const todayEntry = data.archiveEntries[0];
    const pastEntries = data.archiveEntries.slice(1);
    let clearedDates: string[] = $state([]);

    onMount(() => {
        data.archiveEntries.forEach((entry: ArchiveEntry) => {
            const saved = localStorage.getItem(`underscordle-${entry.date}`);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // A game is cleared if all rounds are finished (won or lost)
                    if (parsed.roundStatuses?.every((s: string) => s !== 'playing')) {
                        clearedDates.push(entry.date);
                    }
                } catch (e) {
                    console.error(`Failed to parse saved game for ${entry.date}:`, e);
                }
            }
        });
    });

    function isCleared(date: string) {
        return clearedDates.includes(date);
    }
</script>

<div class="flex w-full flex-col items-center gap-3 px-2 text-white">
    <h1 class="text-3xl font-bold">Archive</h1>

    {#if todayEntry}
        <div class="flex w-full flex-col gap-2">
            <span class="text-xs font-bold tracking-widest text-gray-400 uppercase"
                >Today's Challenge</span
            >
            <a
                href={resolve(`/${todayEntry.date}`)}
                class="flex w-full flex-col items-center justify-center rounded-xl border border-white p-6 transition-all hover:bg-white/10 active:scale-[0.98]"
            >
                <span class="text-xs tracking-widest text-gray-400 uppercase"
                    >Day #{todayEntry.day}</span
                >
                <span
                    class={`text-xl font-bold sm:text-2xl ${isCleared(todayEntry.date) ? 'line-through opacity-50' : ''}`}
                    >{todayEntry.date}</span
                >
            </a>
        </div>
    {/if}

    {#if pastEntries.length > 0}
        <div class="flex w-full flex-col gap-2">
            <span class="text-xs font-bold tracking-widest text-gray-400 uppercase"
                >Past Challenges</span
            >
            <div
                class="grid w-full grid-cols-2 gap-2 rounded-xl border border-white p-2 sm:grid-cols-4"
            >
                {#each pastEntries as entry (entry.date)}
                    <a
                        href={resolve(`/${entry.date}`)}
                        class="flex flex-row items-center justify-center gap-2 rounded-xl p-2 transition-all hover:bg-white/10"
                    >
                        <span class="text-[10px] tracking-widest text-gray-400 uppercase"
                            >#{entry.day}</span
                        >
                        <span
                            class={`text-sm font-bold sm:text-base ${isCleared(entry.date) ? 'line-through opacity-50' : ''}`}
                            >{entry.date}</span
                        >
                    </a>
                {/each}
            </div>
        </div>
    {/if}
</div>
