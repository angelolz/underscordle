import { onMount } from 'svelte';
import { playAudio, stopAllAudio } from '$lib/audioState';

export function useAudioPlayer(getName: () => string | undefined) {
    let audio = $state<HTMLAudioElement | null>(null);

    onMount(() => {
        audio = new Audio();
        audio.preload = 'auto';
        audio.volume = 0.1;

        return () => {
            stopAllAudio();
        };
    });

    $effect(() => {
        const name = getName();
        if (audio && name) {
            audio.src = '/snippets/' + name;
            audio.load();
        }
    });

    // Reset audio when name changes (stop whatever was playing)
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
        }
    };
}
