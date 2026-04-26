let currentAudio: HTMLAudioElement | null = null;

export function playAudio(audio: HTMLAudioElement) {
    if (currentAudio && currentAudio !== audio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    currentAudio = audio;
    currentAudio.currentTime = 0;

    const playPromise = currentAudio.play();
    if (playPromise !== undefined) {
        playPromise.catch((error) => {
            console.error('Playback failed:', error);
        });
    }
}

export function stopAllAudio() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
}
