import { onMount } from 'svelte';
import { playAudio, stopAllAudio } from '$lib/audioState';
import { CHALLENGES_URL } from '$lib/statics';
import { getSettingsContext } from '$lib/settings.svelte';

export function useAudioPlayer(getName: () => string | undefined) {
    let audio = $state<HTMLAudioElement | null>(null);
    const settings = getSettingsContext();

    onMount(() => {
        audio = new Audio();
        audio.preload = 'auto';
        audio.volume = (settings?.volume ?? 10) / 100;

        return () => {
            stopAllAudio();
        };
    });

    $effect(() => {
        const name = getName();
        if (audio && name) {
            audio.src = `${CHALLENGES_URL}/${name}`;
            audio.load();
        }
    });

    $effect(() => {
        if (audio) {
            const volume = settings?.volume ?? 10;
            audio.volume = Math.min(Math.max(volume / 100, 0), 1);
        }
    });

    $effect(() => {
        getName();
        stopAllAudio();
    });

    return {
        get instance() {
            return audio;
        },
        play: () => {
            if (audio && audio.src) {
                playAudio(audio);
            }
        },
    };
}
