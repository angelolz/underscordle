<script lang="ts">
    import { page } from '$app/state';
    import ErrorPage from '$lib/components/ErrorPage.svelte';
</script>

<ErrorPage data={page.data} />
