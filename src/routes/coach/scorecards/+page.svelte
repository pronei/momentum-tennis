<script lang="ts">
	import { resolve } from '$app/paths';
	import { Banner, Button, DataTable, Eyebrow, StatusChip } from '$lib/ds';

	let { data } = $props();
	const columns = [
		{ key: 'on', label: 'Date', mono: true },
		{ key: 'team', label: 'Team' },
		{ key: 'match', label: 'Match' },
		{ key: 'matchId', label: 'USTA id', mono: true },
		{ key: 'status', label: 'Status' }
	];
</script>

<svelte:head><title>Scorecards · Momentum Tennis</title></svelte:head>

<div class="scl">
	<div class="scl__bar">
		<Eyebrow ticks>Junior Team Tennis scorecards</Eyebrow>
		<Button href={resolve('/coach/scorecards/new')}>New scorecard</Button>
	</div>

	{#if data.loadError}<Banner tone="error">{data.loadError}</Banner>{/if}

	<DataTable
		{columns}
		rows={data.rows}
		empty="NO SCORECARDS YET"
		mobileTitleKey="match"
		rowHref={(row) => resolve('/coach/scorecards/[id]', { id: String(row.id) })}
	>
		{#snippet cell(row, column)}
			{#if column.key === 'status'}
				<StatusChip status={String(row.status)} />
			{:else if column.key === 'match'}
				<a class="scl__link" href={resolve('/coach/scorecards/[id]', { id: String(row.id) })}
					>{row.match}</a
				>
			{:else}
				{String(row[column.key] ?? '')}
			{/if}
		{/snippet}
	</DataTable>
</div>

<style>
	.scl {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}
	.scl__bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		flex-wrap: wrap;
	}
	.scl__link {
		color: var(--link);
	}
</style>
