<script lang="ts">
	import { resolve } from '$app/paths';
	import { Banner, Button, DataTable, Eyebrow, StatusChip } from '$lib/ds';

	let { data } = $props();
	const columns = [
		{ key: 'name', label: 'Product' },
		{ key: 'kind', label: 'Kind' },
		{ key: 'price', label: 'Price', mono: true, numeric: true },
		{ key: 'credits', label: 'Credits' },
		{ key: 'validity', label: 'Validity', mono: true },
		{ key: 'active', label: 'Status' },
		{ key: 'stripe', label: 'Stripe price', mono: true }
	];
</script>

<svelte:head><title>Products · Momentum Tennis</title></svelte:head>

<div class="pr">
	<div class="pr__top">
		<Eyebrow ticks>Products</Eyebrow>
		<Button variant="ghost" size="sm" href={resolve('/admin/products/[id]', { id: 'new' })}>
			New product
		</Button>
	</div>

	{#if data.loadError}<Banner tone="error">{data.loadError}</Banner>{/if}

	<DataTable
		{columns}
		rows={data.rows}
		empty="NO PRODUCTS"
		rowHref={(row) => resolve('/admin/products/[id]', { id: String(row.id) })}
	>
		{#snippet cell(row, column)}
			{#if column.key === 'active'}
				<StatusChip status={String(row.active)} />
			{:else if column.key === 'name'}
				<a class="pr__link" href={resolve('/admin/products/[id]', { id: String(row.id) })}
					>{row.name}</a
				>
			{:else}
				{String(row[column.key] ?? '')}
			{/if}
		{/snippet}
	</DataTable>
</div>

<style>
	.pr {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}
	.pr__top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		flex-wrap: wrap;
	}
	.pr__link {
		color: var(--link);
	}
</style>
