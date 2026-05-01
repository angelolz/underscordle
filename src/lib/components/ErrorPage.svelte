<script lang="ts">
    import { resolve } from '$app/paths';
    import { AngleLeftOutline } from 'flowbite-svelte-icons';

    const { data } = $props();
</script>

<div class="my-5 flex justify-center text-white">
    <div class="w-[300px] rounded-xl border border-white p-2 text-center">
        <p class="text-lg font-bold">{data.errorLine}</p>
        <p class="text-sm">Can't find what you're looking for!</p>
        <a class="my-2 inline-flex items-center gap-2 hover:underline" href={resolve('/')}>
            <AngleLeftOutline class="h-4 w-4 shrink-0" />
            <span>Go Home</span>
        </a>
    </div>
</div>
