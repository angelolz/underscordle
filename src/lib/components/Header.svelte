<script lang="ts">
    import logo from '$lib/assets/underscordle.svg';
    import { resolve } from '$app/paths';
    import { ArchiveOutline, CogOutline, QuestionCircleOutline } from 'flowbite-svelte-icons';
    import Modal from './Modal.svelte';

    let showHelpModal = $state(true);
    let showSettingsModal = $state(false)
</script>

<div class="flex w-full flex-col items-center justify-center gap-2 pt-4 align-middle">
    <img src={logo} alt="underscordle" class="h-8 w-auto sm:h-10" />
    <span class="px-4 text-center">
        <p class="text-sm text-white">A daily underscores song guessing game!</p>
        <p class="text-sm text-white">
            by <a class="hover:underline" target="_blank" href="https://angelolz.one">angelolz</a>
        </p>
    </span>
    <div class="flex flex-row gap-2 items-center text-white">
        <span class="hover:scale-105 active:scale-95 transition-all flex items-center"><a href={resolve('/archive')}><ArchiveOutline class="shrink-0 h-5 w-5"/></a></span>
        <span class="hover:scale-105 active:scale-95 transition-all flex items-center"><button onclick={() => {showHelpModal = true}}><QuestionCircleOutline class="shrink-0 h-5 w-5"/></button></span>
        <span class="hover:scale-105 active:scale-95 transition-all flex items-center"><button onclick={() => {showSettingsModal = true}}><CogOutline class="shrink-0 h-5 w-5"/></button></span>
    </div>
    <hr class="h-3 w-full max-w-[280px] border-gray-500 sm:max-w-sm" />
</div>

<Modal revealed={showHelpModal} onClose={() => {showHelpModal = false}}>
    <div class="flex flex-col items-center gap-4">
        <span class="font-bold text-white text-xl">How to Play:</span>
        <ul class="text-sm text-left text-white list-outside list-disc space-y-2 pl-4">
            <li>Each day you will have 5 songs to guess, with 3 guesses each.</li>
            <li>Click the play button to hear the clue and type in the box to make your guess.</li>
            <li>Feel free to come back later, progress is always saved.</li>
        </ul>
    </div>
</Modal>
<Modal revealed={showSettingsModal} onClose={() => {showSettingsModal = false}}>Test Settings</Modal>
