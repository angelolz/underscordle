<script lang="ts">
    import { onMount } from 'svelte';
    import { resolve } from '$app/paths';
    import { AngleLeftOutline } from 'flowbite-svelte-icons';

    const ERROR_LINES = [
        "Stop me if you've heard this one before...",
        'Bozo, bozo, bozo...',
        'Stupid, stupid, stupid...',
        "Quite the mistake you've made...",
        "I'm going to assume something, is that fine?",
        'I never expected this...',
        'Slow down, slow down...',
        'What you tryna do?',
        "I got a problem and it's not my fault...",
        'You must be kidding me!',
        'Happens all the time...',
        "It's not the end of the world!",
        "Oh dear, that's rather alarming...",
    ];

    let line = $state("...");
    onMount(() => {
        line = ERROR_LINES[Math.floor(Math.random() * ERROR_LINES.length)];
    });
</script>

<div class="my-5 flex justify-center text-white">
    <div class="w-[300px] rounded-xl border border-white p-2 text-center">
        <p class="text-lg font-bold">{line}</p>
        <p class="text-sm">Can't find what you're looking for!</p>
        <a class="my-2 inline-flex items-center gap-2 hover:underline" href={resolve('/')}>
            <AngleLeftOutline class="h-4 w-4 shrink-0" />
            <span>Go Home</span>
        </a>
    </div>
</div>
