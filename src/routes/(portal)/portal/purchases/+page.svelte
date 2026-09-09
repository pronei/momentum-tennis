<script lang="ts">
	import { resolve } from '$app/paths';
	import { Banner, Button, DataTable, Eyebrow } from '$lib/ds';

	let { data } = $props();
	const columns = [
		{ key: 'ref', label: 'Ref', mono: true },
		{ key: 'on', label: 'Date', mono: true },
		{ key: 'item', label: 'Item' },
		{ key: 'player', label: 'Player' },
		{ key: 'amount', label: 'Amount', mono: true, numeric: true },
		{ key: 'status', label: 'Status', mono: true }
	];
</script>

<svelte:head><title>Purchases · Momentum Tennis</title></svelte:head>

<div class="pu">
	<Eyebrow ticks>Purchases</Eyebrow>

	{#if data.paid}
		<Banner>
			PAID · CREDITS ISSUED
			{#snippet action()}<Button size="sm" variant="ghost" href="/portal/credits"
					>See credits</Button
				>{/snippet}
		</Banner>
	{/if}
	{#if data.loadError}<Banner tone="error">{data.loadError}</Banner>{/if}

	<DataTable
		{columns}
		rows={data.rows}
		empty="NO PURCHASES YET"
		mobileTitleKey="ref"
		rowHref={(row) => resolve('/(portal)/portal/purchases/[id]', { id: String(row.id) })}
	/>
</div>

<style>
	.pu {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}
</style>
