<script lang="ts">
    import Modal from '../Modal.svelte';
    import icon128 from '$lib/assets/favicon-128x128.png';

    let { showHelpModal = $bindable(), saveSettings, firstTimeHelp = $bindable() } = $props();
</script>

<Modal
    revealed={showHelpModal}
    onClose={() => {
        showHelpModal = false;
        if (firstTimeHelp) {
            firstTimeHelp = false;
            saveSettings();
        }
    }}
>
    <div class="flex flex-col items-center gap-3">
        <span class="text-xl font-bold text-theme-text">How to Play:</span>
        <ul class="list-outside list-disc space-y-2 pl-4 text-left text-theme-text">
            <li>Each day you will have 5 songs to guess, with 3 guesses each.</li>
            <li>Click the play button to hear the clue and type in the box to make your guess.</li>
            <li>Feel free to come back later, progress is always saved.</li>
        </ul>
        <hr class="h-3 w-full max-w-70 border-theme-muted sm:max-w-sm" />
        <span class="text-xl font-bold text-theme-text">Credits</span>
        <div class="flex flex-col items-center justify-center">
            <img src={icon128} alt="underscordle icon" class="h-25" />
            <p class="text-theme-text">
                Icon created by <a
                    class="hover:underline"
                    target="_blank"
                    href="https://youtube.com/@augeagora">douglas</a
                >!
            </p>
        </div>
        <p class="text-theme-text">
            <b>underscordle</b> is heavily inspired by
            <a class="hover:underline" target="_blank" href="https://twitch.tv/ottomated"
                >Ottomated</a
            >'s
            <a class="hover:underline" target="_blank" href="https://porterrobinsle.com/"
                ><i>PORTER ROBINSONLE</i></a
            >.
        </p>
    </div>
</Modal>
