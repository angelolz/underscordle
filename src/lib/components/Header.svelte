<script lang="ts">
    import logo from '$lib/assets/underscordle.svg';
    import icon128 from '$lib/assets/favicon-128x128.png';
    import { resolve } from '$app/paths';
    import {
        ArchiveOutline,
        CogOutline,
        ExclamationCircleOutline,
        QuestionCircleOutline,
    } from 'flowbite-svelte-icons';
    import Modal from './Modal.svelte';

    let { volume = $bindable(), saveSettings } = $props();
    let showHelpModal = $state(false);
    let showSettingsModal = $state(false);
    let inputVolume = $state(volume);

    $effect(() => {
        inputVolume = volume;
    });

    function setVolume(value: number) {
        inputVolume = value;
        volume = value;
    }
</script>

<div class="flex w-full flex-col items-center justify-center gap-2 pt-4 align-middle">
    <img src={logo} alt="underscordle" class="h-full w-auto sm:h-15" />
    <span class="px-4 text-center">
        <p class="text-lg text-white">A daily underscores song guessing game!</p>
        <p class="text-sm text-white">
            by <a class="hover:underline" target="_blank" href="https://angelolz.one">angelolz</a>
        </p>
    </span>
    <div class="flex flex-row items-center gap-2 text-white">
        <span class="flex items-center transition-all hover:scale-105 active:scale-95"
            ><a href={resolve('/archive')}><ArchiveOutline class="h-8 w-8 shrink-0" /></a></span
        >
        <span class="flex items-center transition-all hover:scale-105 active:scale-95"
            ><button
                onclick={() => {
                    showHelpModal = true;
                }}><QuestionCircleOutline class="h-8 w-8 shrink-0" /></button
            ></span
        >
        <span class="flex items-center transition-all hover:scale-105 active:scale-95"
            ><button
                onclick={() => {
                    showSettingsModal = true;
                }}><CogOutline class="h-8 w-8 shrink-0" /></button
            ></span
        >
    </div>
    <hr class="h-3 w-full max-w-[280px] border-gray-500 sm:max-w-sm" />
</div>

<Modal
    revealed={showHelpModal}
    onClose={() => {
        showHelpModal = false;
    }}
>
    <div class="flex flex-col items-center gap-3">
        <span class="text-xl font-bold text-white">How to Play:</span>
        <ul class="list-outside list-disc space-y-2 pl-4 text-left text-sm text-white">
            <li>Each day you will have 5 songs to guess, with 3 guesses each.</li>
            <li>Click the play button to hear the clue and type in the box to make your guess.</li>
            <li>Feel free to come back later, progress is always saved.</li>
        </ul>
        <hr class="h-3 w-full max-w-[280px] border-gray-500 sm:max-w-sm" />
        <span class="text-xl font-bold text-white">Credits</span>
        <div class="flex flex-col items-center justify-center">
            <img src={icon128} alt="underscordle icon" class="h-[100px]"/>
            <p class="text-white">Icon created by <a class="hover:underline" target="_blank" href="https://youtube.com/@augeagora">douglas</a>!</p>
        </div>
        <p class="text-white"><b>underscordle</b> is heavily inspired by <a class="hover:underline" target="_blank" href="https://twitch.tv/ottomated">Ottomated</a>'s <a class="hover:underline" target="_blank" href="https://porterrobinsle.com/"><i>PORTER ROBINSONLE</i></a>.</p>
    </div>
</Modal>

<Modal
    revealed={showSettingsModal}
    onClose={() => {
        showSettingsModal = false;
    }}
>
    <div class="flex flex-col gap-2 text-white">
        <span class="text-xl font-bold">Settings</span>
        <div class="flex flex-col items-center justify-center align-middle">
            <span>Volume: <b>{inputVolume}%</b></span>
            <input
                class="w-[200px]"
                type="range"
                min="1"
                max="100"
                value={inputVolume}
                oninput={(e) => {
                    setVolume(Number(e.currentTarget.value));
                }}
                onchange={() => {
                    saveSettings();
                }}
            />
            {#if inputVolume > 35}
                <span class="flex flex-row items-center justify-center gap-1 text-sm text-red-500">
                    <ExclamationCircleOutline class="h-6 w-6 shrink-0" /> This may be too loud, please
                    take caution.
                </span>
            {/if}
        </div>
    </div>
</Modal>
