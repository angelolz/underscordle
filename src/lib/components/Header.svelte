<script lang="ts">
    import { resolve } from '$app/paths';
    import {
        ArchiveOutline,
        CogOutline,
        GithubSolid,
        ListMusicOutline,
        QuestionCircleOutline,
    } from 'flowbite-svelte-icons';
    import Logo from './Logo.svelte';

    import HelpModal from './modals/HelpModal.svelte';
    import SettingsModal from './modals/SettingsModal.svelte';
    import SonglistModal from './modals/SonglistModal.svelte';

    let {
        volume = $bindable(),
        theme = $bindable(),
        firstTimeHelp = $bindable(),
        saveSettings,
        songList,
        albums,
    } = $props();
    let showHelpModal = $state(false);
    let showSettingsModal = $state(false);
    let showSongListModal = $state(false);

    $effect(() => {
        if (firstTimeHelp) {
            showHelpModal = true;
        }
    });
</script>

<div class="flex w-full flex-col items-center justify-center gap-2 pt-4 align-middle">
    <Logo class="h-10 w-auto text-theme-text sm:h-15" />
    <span class="px-4 text-center">
        <p class="text-lg text-theme-text">A daily underscores song guessing game!</p>
        <p class="text-sm text-theme-text">
            by <a
                class="hover:text-theme-accent hover:underline"
                target="_blank"
                href="https://angelolz.one">angelolz</a
            >
        </p>
    </span>
    <div class="flex cursor-pointer flex-row items-center gap-3 text-theme-text select-none">
        <span class="flex flex-col items-center transition-all hover:scale-105 active:scale-95">
            <a href={resolve('/archive')}><ArchiveOutline class="h-8 w-8 shrink-0" /></a>
            Archive
        </span>
        <span class="flex flex-col items-center transition-all hover:scale-105 active:scale-95">
            <button
                onclick={() => {
                    showHelpModal = true;
                }}
            >
                <QuestionCircleOutline class="h-8 w-8 shrink-0 cursor-pointer" />
            </button>
            Help
        </span>
        <span class="flex flex-col items-center transition-all hover:scale-105 active:scale-95">
            <button
                onclick={() => {
                    showSongListModal = true;
                }}
                ><ListMusicOutline class="h-8 w-8 shrink-0 cursor-pointer" />
            </button>
            Songlist
        </span>
        <span class="flex flex-col items-center transition-all hover:scale-105 active:scale-95">
            <button
                onclick={() => {
                    showSettingsModal = true;
                }}><CogOutline class="h-8 w-8 shrink-0 cursor-pointer" /></button
            >
            Settings
        </span>
        <span class="flex flex-col items-center transition-all hover:scale-105 active:scale-95">
            <a href="https://github.com/angelolz/underscordle" target="_blank" rel="noreferrer">
                <GithubSolid class="h-8 w-8 shrink-0" />
            </a>
            GitHub
        </span>
    </div>
    <hr class="h-3 w-full max-w-70 border-theme-muted sm:max-w-sm" />
</div>

<HelpModal bind:showHelpModal bind:firstTimeHelp {saveSettings} />

<SettingsModal bind:showSettingsModal bind:volume bind:theme {saveSettings} />

<SonglistModal bind:showSongListModal {songList} {albums} />
