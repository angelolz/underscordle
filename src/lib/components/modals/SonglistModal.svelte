<script lang="ts">
    import Modal from '../Modal.svelte';
    import { page } from '$app/state';
    import type { AlbumArt as AlbumMetadata, Song } from '$lib/interfaces';
    import { Searcher } from 'fast-fuzzy';
    import StreamingLinks from '../game/StreamingLinks.svelte';
    import AlbumArt from '../game/AlbumArt.svelte';

    let {
        songList,
        showSongListModal = $bindable(),
    }: { songList: Song[]; showSongListModal: boolean } = $props();
    let searchTerm = $state('');
    const sorts = ['A-Z', 'Album'];
    let selectedSort = $state('A-Z');
    let results: Song[] = $state([]);
    const albums = $derived(page.data.albums || []);

    const searcher = $derived(
        new Searcher(songList, {
            keySelector: (song) => [song.title, song.album],
            threshold: 0.7,
        })
    );

    $effect(() => {
        if (searchTerm.trim().length > 0) {
            results = searcher.search(searchTerm);
        } else {
            results = songList;
        }
    });

    const displayedResults = $derived(
        [...results].sort((a, b) => {
            const compare = (first: string, second: string) =>
                first.localeCompare(second, undefined, { sensitivity: 'base' });

            if (selectedSort === 'Album') {
                const aIsSingle =
                    albums.find((album: AlbumMetadata) => album.name === a.album)?.isSingle ??
                    false;
                const bIsSingle =
                    albums.find((album: AlbumMetadata) => album.name === b.album)?.isSingle ??
                    false;

                if (aIsSingle !== bIsSingle) {
                    return aIsSingle ? -1 : 1;
                }

                return compare(a.album, b.album) || compare(a.title, b.title);
            }

            return compare(a.title, b.title);
        })
    );
</script>

<Modal
    revealed={showSongListModal}
    maxWidth="max-w-2xl"
    onClose={() => {
        showSongListModal = false;
    }}
>
    <div class="flex flex-col gap-4 text-theme-text">
        <span class="text-xl font-bold">Song List</span>
        <span class="flex flex-row gap-1">
            <input
                class="text-md w-full min-w-0 rounded-lg border border-theme-muted bg-transparent p-2 text-theme-text outline-none focus:border-theme-text focus:ring-0"
                type="text"
                autocomplete="off"
                placeholder="Search using song title or album name"
                oninput={(e) => {
                    searchTerm = e.currentTarget.value;
                }}
            />
            <span class="flex flex-row">
                <select
                    class="rounded-lg border border-theme-muted p-2 focus:border-theme-text"
                    bind:value={selectedSort}
                >
                    {#each sorts as s (s)}
                        <option value={s}>
                            {s}
                        </option>
                    {/each}
                </select>
            </span>
        </span>
        <span class="text-sm text-theme-muted italic"
            >There are currently {songList.length} songs that can appear in daily challenges.</span
        >
        <div class="h-[50vh] divide-y divide-theme-muted overflow-y-auto pr-3">
            {#each displayedResults as result (result.id)}
                {@const album = albums.find((entry: AlbumMetadata) => entry.name === result.album)}
                <div
                    class="flex w-full flex-col gap-2 bg-theme-bg py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div class="flex min-w-0 flex-1 flex-row items-center gap-2">
                        <AlbumArt
                            albumName={result?.album}
                            class="h-15 w-15 shrink-0 rounded-xl border border-theme-text"
                        />
                        <div class="flex min-w-0 flex-col overflow-hidden text-left">
                            <span class="text-[14px] font-bold text-theme-text"
                                >{result?.title || 'title'}</span
                            >
                            <span class="text-[12px] text-theme-text">
                                {result?.artist || 'artist'}
                            </span>
                            {#if album && !album.isSingle}
                                <span class="text-[12px] text-theme-text italic opacity-75">
                                    {result.album}
                                </span>
                            {/if}
                            <div class="sm:hidden block pt-1">
                                <StreamingLinks links={result.links} inGame={false} />
                            </div>
                        </div>
                        
                    </div>
                    <div class="sm:block hidden">
                        <StreamingLinks links={result.links} inGame={false} />
                    </div>
                </div>
            {/each}
        </div>
    </div>
</Modal>
