<script lang="ts">
	import { Banner, Button, DataTable, EmptyState, Eyebrow } from '$lib/ds';

	let { data } = $props();
	const player = $derived(data.currentPlayer);
	const columns = [
		{ key: 'on', label: 'Date', mono: true },
		{ key: 'entryType', label: 'Entry', mono: true },
		{ key: 'kind', label: 'Credits' },
		{ key: 'reason', label: 'Reason' },
		{ key: 'movement', label: 'Change', numeric: true }
	];
</script>

<svelte:head><title>Credits · Momentum Tennis</title></svelte:head>

<div class="cr">
	<Eyebrow ticks>Credits</Eyebrow>

	{#if data.loadError}<Banner tone="error">{data.loadError}</Banner>{/if}

	{#if !player}
		<EmptyState ticks>Add a player to see their credits</EmptyState>
	{:else}
		<div class="cr__wallet">
			{#each data.balances as b (b.creditKind)}
				<div class="cr__card">
					<span class="cr__label">{b.label}</span>
					<span class="cr__count">{b.balance}</span>
					<span class="cr__expiry"
						>{b.expiresOn ? `NEXT EXPIRY ${b.expiresOn}` : 'NOTHING EXPIRING'}</span
					>
				</div>
			{/each}
		</div>

		{#if data.balances.every((b) => b.balance === 0)}
			<Banner>
				No credits yet. The academy grants them; buying a package arrives with the next phase.
				{#snippet action()}<Button size="sm" variant="ghost" href="/portal/book">See classes</Button
					>{/snippet}
			</Banner>
		{/if}

		<section>
			<h2 class="cr__head">History</h2>
			<DataTable {columns} rows={data.entries} empty="NOTHING YET" mobileTitleKey="on" />
		</section>
	{/if}
</div>

<style>
	.cr {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}
	.cr__wallet {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr) /* ds-allow card column floor */);
		gap: var(--space-4);
	}
	.cr__card {
		border: var(--hairline);
		padding: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	.cr__label {
		font-family: var(--font-sans);
		font-size: var(--size-label-sm);
		font-weight: var(--weight-bold);
		letter-spacing: var(--track-label);
		text-transform: uppercase;
		color: var(--text-secondary);
	}
	.cr__count {
		font-family: var(--font-mono);
		font-size: var(--size-h3);
		color: var(--ink);
	}
	.cr__expiry {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		color: var(--text-secondary);
	}
	.cr__head {
		margin: 0 0 var(--space-3);
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}
</style>
