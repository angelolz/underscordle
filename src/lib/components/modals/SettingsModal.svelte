<script lang="ts">
    import Modal from '../Modal.svelte';
    import { themes } from '$lib/themes';
    import { ExclamationCircleOutline } from 'flowbite-svelte-icons';

    let {
        showSettingsModal = $bindable(),
        volume = $bindable(),
        theme = $bindable(),
        saveSettings,
    } = $props();
</script>

<Modal
    revealed={showSettingsModal}
    onClose={() => {
        showSettingsModal = false;
    }}
>
    <div class="flex flex-col gap-4 text-theme-text">
        <span class="text-xl font-bold">Settings</span>

        <div class="flex flex-col gap-2">
            <label for="theme-select" class="text-sm font-bold">Theme</label>
            <select
                id="theme-select"
                class="w-full rounded-lg border border-theme-text bg-theme-bg p-2 text-sm text-theme-text outline-none focus:ring-2 focus:ring-theme-accent"
                bind:value={theme}
                onchange={(event) => {
                    theme = (event.currentTarget as HTMLSelectElement).value;
                    saveSettings();
                }}
            >
                {#each Object.keys(themes) as t (t)}
                    <option value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                {/each}
            </select>
        </div>

        <div class="flex flex-col items-center justify-around gap-2 align-middle">
            <span class="flex w-full flex-row gap-1 text-sm font-bold">
                <p>Volume: <b>{volume}%</b></p>
                {#if volume > 35}
                    <span
                        class="flex flex-row items-center justify-between gap-1 text-[10px] text-red-500"
                    >
                        <ExclamationCircleOutline class="h-4 w-4 shrink-0" /> This may be too loud, please
                        take caution.
                    </span>
                {/if}
            </span>
            <input
                class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-theme-accent accent-theme-text"
                type="range"
                min="1"
                max="100"
                bind:value={volume}
                onchange={saveSettings}
            />
        </div>
    </div>
</Modal>
