<script lang="ts">
	import { Button, EmptyState } from '$lib/ds';
</script>

<svelte:head><title>Portal · Momentum Tennis</title></svelte:head>

<EmptyState ticks>
	No players yet — phase 1 adds player profiles, ball levels and guardianship here
	{#snippet action()}
		<Button variant="secondary" size="sm" href="/portal/account">Complete your account</Button>
	{/snippet}
</EmptyState>
