<script lang="ts">
    import type { StreamingLinks } from '$lib/interfaces';

    type Platform = {
        key: keyof StreamingLinks;
        label: string;
    };

    const { links, inGame } = $props();

    const platforms: Platform[] = [
        { key: 'appleMusic', label: 'Apple Music' },
        { key: 'bandcamp', label: 'Bandcamp' },
        { key: 'soundcloud', label: 'SoundCloud' },
        { key: 'spotify', label: 'Spotify' },
        { key: 'tidal', label: 'Tidal' },
        { key: 'youtube', label: 'YouTube' },
        { key: 'youtubeMusic', label: 'YouTube Music' },
    ];

    const hasLink = (value: string | undefined) => Boolean(value?.trim());
</script>

<div class={`flex flex-row ${inGame ? 'items-center justify-center' : ''} gap-2 text-theme-text`}>
    {#each platforms as platform (platform.key)}
        {@const href = links[platform.key]}
        {#if hasLink(href)}
            <a
                class={`transition-all hover:scale-110 active:scale-90 ${inGame ? 'h-8 w-8' : 'h-5 w-5'}`}
                {href}
                target="_blank"
                rel="noreferrer external"
                aria-label={`Open on ${platform.label}`}
                title={platform.label}
            >
                {#if platform.key === 'appleMusic'}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                        ><path
                            fill="currentColor"
                            fill-rule="evenodd"
                            d="M12 23c6.075 0 11-4.925 11-11S18.075 1 12 1S1 5.925 1 12s4.925 11 11 11m4.814-17.889A.5.5 0 0 1 17 5.5V15c0 .37-.07.86-.363 1.297c-.304.454-.809.792-1.555.908c-.768.119-1.42 0-1.88-.402c-.459-.4-.623-.986-.623-1.57c0-.415.199-.774.451-1.056a3.5 3.5 0 0 1 .962-.723A5.7 5.7 0 0 1 16 12.835V9.17l-6 1.366V16c0 .848-.238 1.438-.647 1.84c-.388.383-.875.536-1.206.638c-.43.132-1.033.153-1.55-.163c-.55-.336-.878-.973-.878-1.894c0-1.084.74-1.704 1.496-2.048c.58-.265 1.246-.405 1.785-.493V7a.5.5 0 0 1 .395-.489l7-1.5a.5.5 0 0 1 .42.1Z"
                            clip-rule="evenodd"
                        /></svg
                    >
                {:else if platform.key === 'bandcamp'}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                        ><path
                            fill="currentColor"
                            fill-rule="evenodd"
                            d="m4.5 8.5l-3.5 7h8.5L12.75 9v6.5h1.5v-.545a2.32 2.32 0 0 0 1.5.545c1.472 0 2.5-1.328 2.5-2.75c0 1.422 1.028 2.75 2.5 2.75c1.207 0 2.116-.894 2.404-2H21.55c-.199.322-.514.5-.8.5c-.461 0-1-.462-1-1.25s.539-1.25 1-1.25c.286 0 .601.178.8.5h1.604c-.288-1.106-1.197-2-2.404-2c-1.472 0-2.5 1.328-2.5 2.75c0-1.422-1.028-2.75-2.5-2.75a2.32 2.32 0 0 0-1.5.545V8.5zm10.25 4.25c0-.788.539-1.25 1-1.25s1 .462 1 1.25s-.539 1.25-1 1.25s-1-.462-1-1.25"
                            clip-rule="evenodd"
                        /></svg
                    >
                {:else if platform.key === 'soundcloud'}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                        ><path
                            fill="currentColor"
                            fill-rule="evenodd"
                            d="M23 13a3 3 0 0 1-3 3h-7.5a.5.5 0 0 1-.5-.5V8.025a.47.47 0 0 1 .226-.41a4.502 4.502 0 0 1 6.595 2.624A3 3 0 0 1 23 13M10 7.75a.75.75 0 0 1 .75.75v7a.75.75 0 1 1-1.5 0v-7a.75.75 0 0 1 .75-.75m-5.333 2a.75.75 0 0 1 .75.75v5a.75.75 0 0 1-1.5 0v-5a.75.75 0 0 1 .75-.75m2.666 1a.75.75 0 0 1 .75.75v4a.75.75 0 0 1-1.5 0v-4a.75.75 0 0 1 .75-.75M2.75 12a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 0 1.5 0z"
                            clip-rule="evenodd"
                        /></svg
                    >
                {:else if platform.key === 'spotify'}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                        ><path
                            fill="currentColor"
                            fill-rule="evenodd"
                            d="M12 23c6.075 0 11-4.925 11-11S18.075 1 12 1S1 5.925 1 12s4.925 11 11 11M5.993 9.159c1.19-.317 3.276-.649 5.57-.578c2.3.071 4.71.545 6.627 1.748a1 1 0 0 0 1.063-1.695c-2.333-1.463-5.138-1.975-7.628-2.052c-2.498-.077-4.778.28-6.146.644a1 1 0 1 0 .514 1.933m5.036 3.41c-1.887-.066-3.55.23-4.469.508a1 1 0 0 1-.58-1.914c1.127-.341 3.01-.667 5.12-.592c2.112.075 4.527.554 6.648 1.899a1 1 0 1 1-1.07 1.69c-1.728-1.096-3.762-1.523-5.649-1.59Zm-4.17 4.102c.92-.23 2.508-.461 4.187-.38c1.694.082 3.346.476 4.524 1.37a1 1 0 0 0 1.21-1.593c-1.64-1.244-3.76-1.684-5.638-1.775c-1.893-.091-3.677.165-4.768.438a1 1 0 1 0 .485 1.94"
                            clip-rule="evenodd"
                        /></svg
                    >
                {:else if platform.key === 'tidal'}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                        ><path
                            fill="currentColor"
                            fill-rule="evenodd"
                            d="M.75 8.25L4.5 4.5l3.75 3.75L4.5 12zm15 0L12 4.5L8.25 8.25L12 12l-3.75 3.75L12 19.5l3.75-3.75L12 12zm0 0L19.5 12l3.75-3.75L19.5 4.5z"
                            clip-rule="evenodd"
                        /></svg
                    >
                {:else if platform.key === 'youtube'}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                        ><path
                            fill="currentColor"
                            fill-rule="evenodd"
                            d="M1.172 7.693A56 56 0 0 0 1 12c0 1.632.08 3.167.182 4.44c.146 1.817 1.531 3.206 3.318 3.33c1.794.125 4.305.23 7.5.23s5.706-.105 7.5-.23c1.787-.124 3.172-1.513 3.318-3.33c.102-1.273.182-2.808.182-4.44c0-1.576-.074-3.06-.172-4.307a3.73 3.73 0 0 0-3.46-3.46C17.59 4.107 15.164 4 12 4s-5.591.107-7.368.233a3.73 3.73 0 0 0-3.46 3.46M15.5 12L10 9v6z"
                            clip-rule="evenodd"
                        /></svg
                    >
                {:else}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                        ><path
                            fill="currentColor"
                            fill-rule="evenodd"
                            d="M23 12c0 6.075-4.925 11-11 11S1 18.075 1 12S5.925 1 12 1s11 4.925 11 11M12 7a5 5 0 1 0 0 10a5 5 0 0 0 0-10m-6 5a6 6 0 1 1 12 0a6 6 0 0 1-12 0m9 0l-5-3v6z"
                            clip-rule="evenodd"
                        /></svg
                    >
                {/if}
            </a>
        {/if}
    {/each}
</div>
