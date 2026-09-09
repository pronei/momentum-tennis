<script lang="ts">
	import { resolve } from '$app/paths';
	import { Banner, Button, DataTable, Eyebrow, Select, StatusChip } from '$lib/ds';

	let { data } = $props();
	const columns = [
		{ key: 'ref', label: 'Ref', mono: true },
		{ key: 'on', label: 'Date', mono: true },
		{ key: 'account', label: 'Account' },
		{ key: 'player', label: 'Player' },
		{ key: 'item', label: 'Item' },
		{ key: 'amount', label: 'Amount', mono: true, numeric: true },
		{ key: 'status', label: 'Status' }
	];
</script>

<svelte:head><title>Orders · Momentum Tennis</title></svelte:head>

<div class="or">
	<Eyebrow ticks>Orders</Eyebrow>

	<form method="GET" class="or__filter">
		<Select
			label="Status"
			name="status"
			options={data.statuses}
			placeholder="Every status"
			value={data.status}
		/>
		<Button variant="secondary" size="sm" type="submit">Filter</Button>
	</form>

	{#if data.loadError}<Banner tone="error">{data.loadError}</Banner>{/if}

	<DataTable
		{columns}
		rows={data.rows}
		empty="NO ORDERS"
		mobileTitleKey="ref"
		rowHref={(row) => resolve('/admin/orders/[id]', { id: String(row.id) })}
	>
		{#snippet cell(row, column)}
			{#if column.key === 'status'}
				<StatusChip status={String(row.status)} />
			{:else if column.key === 'ref'}
				<a class="or__link" href={resolve('/admin/orders/[id]', { id: String(row.id) })}
					>{row.ref}</a
				>
			{:else}
				{String(row[column.key] ?? '')}
			{/if}
		{/snippet}
	</DataTable>
</div>

<style>
	.or {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}
	.or__filter {
		display: flex;
		align-items: flex-end;
		gap: var(--space-3);
		flex-wrap: wrap;
	}
	.or__link {
		font-family: var(--font-mono);
		letter-spacing: 0.07em;
		color: var(--link);
	}
</style>
