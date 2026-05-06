<script lang="ts">
    import logo from '$lib/assets/underscordle.svg';
    import { resolve } from '$app/paths';
    import {
        ArchiveOutline,
        CogOutline,
        ExclamationCircleOutline,
        QuestionCircleOutline,
    } from 'flowbite-svelte-icons';
    import Modal from './Modal.svelte';

    let { volume = $bindable() } = $props();
    let showHelpModal = $state(false);
    let showSettingsModal = $state(false);

    function setVolume(value: number) {
        volume = value;
    }
</script>

<div class="flex w-full flex-col items-center justify-center gap-2 pt-4 align-middle">
    <img src={logo} alt="underscordle" class="h-8 w-auto sm:h-10" />
    <span class="px-4 text-center">
        <p class="text-sm text-white">A daily underscores song guessing game!</p>
        <p class="text-sm text-white">
            by <a class="hover:underline" target="_blank" href="https://angelolz.one">angelolz</a>
        </p>
    </span>
    <div class="flex flex-row items-center gap-2 text-white">
        <span class="flex items-center transition-all hover:scale-105 active:scale-95"
            ><a href={resolve('/archive')}><ArchiveOutline class="h-5 w-5 shrink-0" /></a></span
        >
        <span class="flex items-center transition-all hover:scale-105 active:scale-95"
            ><button
                onclick={() => {
                    showHelpModal = true;
                }}><QuestionCircleOutline class="h-5 w-5 shrink-0" /></button
            ></span
        >
        <span class="flex items-center transition-all hover:scale-105 active:scale-95"
            ><button
                onclick={() => {
                    showSettingsModal = true;
                }}><CogOutline class="h-5 w-5 shrink-0" /></button
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
    <div class="flex flex-col items-center gap-4">
        <span class="text-xl font-bold text-white">How to Play:</span>
        <ul class="list-outside list-disc space-y-2 pl-4 text-left text-sm text-white">
            <li>Each day you will have 5 songs to guess, with 3 guesses each.</li>
            <li>Click the play button to hear the clue and type in the box to make your guess.</li>
            <li>Feel free to come back later, progress is always saved.</li>
        </ul>
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
            <span>Volume: <b>{volume}%</b></span>
            <input
                class="w-[200px]"
                type="range"
                min="1"
                max="100"
                value={volume}
                onchange={(e) => {
                    setVolume(Number(e.currentTarget.value));
                }}
            />
            {#if volume > 35}
                <span class="flex flex-row items-center justify-center gap-1 text-sm text-red-500">
                    <ExclamationCircleOutline class="h-6 w-6 shrink-0" /> This may be too loud, please
                    take caution.
                </span>
            {/if}
        </div>
    </div>
</Modal>
