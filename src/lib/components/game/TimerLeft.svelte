<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import { SvelteDate } from 'svelte/reactivity';

    let timeLeft: string | null = $state(getTimeUntilMidnight());
    let timer: NodeJS.Timeout | null = null;

    onMount(() => {
        timer = setInterval(() => {
            timeLeft = getTimeUntilMidnight();
        }, 1000);
    });

    onDestroy(() => {
        if (timer) {
            clearInterval(timer);
        }
    });

    function getTimeUntilMidnight() {
        const now = new SvelteDate();
        const tomorrowUtc = new SvelteDate(now.getTime());
        tomorrowUtc.setUTCDate(now.getUTCDate() + 1);
        tomorrowUtc.setUTCHours(0, 0, 0, 0);

        const timeLeft = tomorrowUtc.getTime() - now.getTime();

        const hours = Math.floor((timeLeft / 1000 / 60 / 60) % 24)
            .toString()
            .padStart(2, '0');
        const minutes = Math.floor((timeLeft / 1000 / 60) % 60)
            .toString()
            .padStart(2, '0');
        const seconds = Math.floor((timeLeft / 1000) % 60)
            .toString()
            .padStart(2, '0');

        return `${hours}:${minutes}:${seconds}`;
    }
</script>

<div class="flex flex-col items-center gap-2">
    <p class="text-sm text-theme-text uppercase">Next Challenge</p>
    <div class="flex min-w-[50px] flex-col text-center">
        <span class="text-2xl font-bold">{timeLeft}</span>
        <span class="text-sm whitespace-nowrap uppercase opacity-50">Remaining</span>
    </div>
</div>
