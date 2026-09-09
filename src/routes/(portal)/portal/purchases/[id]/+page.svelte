<script lang="ts">
	import { Button, DataTable, Eyebrow, StatusChip } from '$lib/ds';

	let { data } = $props();
	const lotColumns = [
		{ key: 'player', label: 'Player' },
		{ key: 'kind', label: 'Credits' },
		{ key: 'issued', label: 'Issued', numeric: true },
		{ key: 'remaining', label: 'Remaining', numeric: true },
		{ key: 'expires', label: 'Expires', mono: true }
	];
</script>

<svelte:head><title>Receipt · Momentum Tennis</title></svelte:head>

<div class="rc">
	<div class="rc__top">
		<Eyebrow ticks>Receipt</Eyebrow>
		<StatusChip status={data.order.statusLabel} />
	</div>

	<dl class="rc__facts">
		{#each data.order.items as item, i (i)}
			<div class="rc__row">
				<dt class="rc__label">Item</dt>
				<dd class="rc__value">{item.name} · {item.player} · {item.amount}</dd>
			</div>
		{/each}
		<div class="rc__row">
			<dt class="rc__label">Total</dt>
			<dd class="rc__value rc__mono">{data.order.total}</dd>
		</div>
		<div class="rc__row">
			<dt class="rc__label">Date</dt>
			<dd class="rc__value rc__mono">{data.order.on}</dd>
		</div>
		<div class="rc__row">
			<dt class="rc__label">Ref</dt>
			<dd class="rc__value rc__mono">ORDER {data.order.ref}</dd>
		</div>
		{#if data.order.stripeRef}
			<div class="rc__row">
				<dt class="rc__label">Stripe ref</dt>
				<dd class="rc__value rc__mono">{data.order.stripeRef}</dd>
			</div>
		{/if}
	</dl>

	<section>
		<h2 class="rc__head">Credits</h2>
		<DataTable columns={lotColumns} rows={data.lots} empty="NO CREDITS ISSUED" />
	</section>

	<div>
		<Button variant="ghost" size="sm" href="/portal/purchases">All purchases</Button>
	</div>
</div>

<style>
	.rc {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}
	.rc__top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		flex-wrap: wrap;
	}
	.rc__facts {
		margin: 0;
		border: var(--hairline);
		padding: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		max-width: var(--measure);
	}
	.rc__row {
		display: grid;
		grid-template-columns: 8rem 1fr;
		gap: var(--space-3);
		align-items: baseline;
	}
	.rc__label {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}
	.rc__value {
		margin: 0;
		font-size: var(--size-body-sm);
		color: var(--ink);
	}
	.rc__mono {
		font-family: var(--font-mono);
		letter-spacing: 0.07em;
		text-transform: uppercase;
	}
	.rc__head {
		margin: 0 0 var(--space-3);
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}
	@media (max-width: 760px) {
		.rc__row {
			grid-template-columns: 1fr;
			gap: var(--space-1);
		}
	}
</style>
