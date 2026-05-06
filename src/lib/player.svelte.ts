export type SharedSnippetPlayer = {
    mount(): void;
    destroy(): void;
    play(src: string): Promise<void>;
    stop(): void;
    setVolume(volume: number): void;
    getCurrentSrc(): string | null;
};

export function createSharedSnippetPlayer(): SharedSnippetPlayer {
    let audio: HTMLAudioElement | null = null;
    let currentSrc: string | null = null;

    function getClampedVolume(volume: number) {
        return Math.min(Math.max(volume / 100, 0), 1);
    }

    function mount() {
        if (audio) return;

        audio = new Audio();
        audio.preload = 'none';
    }

    function destroy() {
        if (!audio) return;

        audio.pause();
        audio.currentTime = 0;
        audio.removeAttribute('src');
        currentSrc = null;
        audio = null;
    }

    async function play(src: string) {
        if (!audio) return;

        if (currentSrc !== src) {
            audio.src = src;
            currentSrc = src;
        }

        audio.currentTime = 0;

        try {
            await audio.play();
        } catch (error) {
            console.error('Playback failed:', error);
        }
    }

    function stop() {
        if (!audio) return;

        audio.pause();
        audio.currentTime = 0;
    }

    function setVolume(volume: number) {
        if (!audio) return;
        audio.volume = getClampedVolume(volume);
    }

    function getCurrentSrc() {
        return currentSrc;
    }

    return { mount, destroy, play, stop, setVolume, getCurrentSrc};
}
