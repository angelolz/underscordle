<script lang="ts">
    import logo from '$lib/assets/underscordle.svg';
    import { resolve } from '$app/paths';
    import { ArchiveOutline, CogOutline, QuestionCircleOutline } from 'flowbite-svelte-icons';
    import Modal from './Modal.svelte';

    let showHelpModal = $state(true);
    let showSettingsModal = $state(false);
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
    }}>Test Settings</Modal
>
