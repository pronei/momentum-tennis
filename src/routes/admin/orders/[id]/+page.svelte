<script lang="ts">
	import { resolve } from '$app/paths';
	import { Banner, Button, DataTable, Dialog, Eyebrow, StatusChip } from '$lib/ds';

	let { data, form } = $props();
	let confirming = $state(false);

	const lotColumns = [
		{ key: 'player', label: 'Player' },
		{ key: 'kind', label: 'Credits' },
		{ key: 'issued', label: 'Issued', numeric: true },
		{ key: 'remaining', label: 'Remaining', numeric: true },
		{ key: 'expires', label: 'Expires', mono: true }
	];
	const ledgerColumns = [
		{ key: 'on', label: 'Date', mono: true },
		{ key: 'entryType', label: 'Entry', mono: true },
		{ key: 'movement', label: 'Change', numeric: true },
		{ key: 'reason', label: 'Reason' }
	];
	const consequence = $derived(
		`${data.reverses} CREDITS REVERSE · ${data.order.total} RETURNS THROUGH STRIPE`
	);
</script>

<svelte:head><title>Order {data.order.ref} · Momentum Tennis</title></svelte:head>

<div class="od">
	<div>
		<Eyebrow ticks>Order</Eyebrow>
		<h2 class="od__title">ORDER {data.order.ref}</h2>
		<a class="od__back" href={resolve('/admin/orders')}>All orders</a>
	</div>

	{#if form?.message}<Banner>{form.message}</Banner>{/if}
	{#if form?.reason}<Banner tone="error">{form.reason}</Banner>{/if}

	<div class="od__top">
		<StatusChip status={data.order.statusLabel} />
		<span class="od__mono">{data.order.on}</span>
		<span class="od__mono">{data.order.total}</span>
	</div>

	<dl class="od__facts">
		<div class="od__row">
			<dt class="od__label">Account</dt>
			<dd class="od__value">{data.order.account}</dd>
		</div>
		{#each data.order.items as item, i (i)}
			<div class="od__row">
				<dt class="od__label">Item</dt>
				<dd class="od__value">{item.name} · {item.player} · {item.amount}</dd>
			</div>
		{/each}
		<div class="od__row">
			<dt class="od__label">Payment intent</dt>
			<dd class="od__value od__mono">{data.order.paymentIntentId ?? '—'}</dd>
		</div>
		<div class="od__row">
			<dt class="od__label">Checkout session</dt>
			<dd class="od__value od__mono">{data.order.checkoutSessionId ?? '—'}</dd>
		</div>
		<div class="od__row">
			<dt class="od__label">Gateway</dt>
			<dd class="od__value od__mono">{data.gateway.toUpperCase()}</dd>
		</div>
	</dl>

	<section>
		<h3 class="od__head">Credit lots</h3>
		<DataTable columns={lotColumns} rows={data.lots} empty="NO CREDITS ISSUED" />
	</section>

	<section>
		<h3 class="od__head">Ledger</h3>
		<DataTable
			columns={ledgerColumns}
			rows={data.ledger}
			empty="NO LEDGER ROWS"
			mobileTitleKey="on"
		/>
	</section>

	{#if data.notRefundable}
		<Banner tone="error">{data.notRefundable}</Banner>
	{/if}

	<div class="od__actions">
		{#if data.refundable}
			<Button variant="secondary" onclick={() => (confirming = true)}>Refund</Button>
		{/if}
		{#if data.order.status === 'pending'}
			<form method="POST" action="?/cancel">
				<Button variant="ghost" type="submit">Cancel order</Button>
			</form>
		{/if}
	</div>
</div>

<Dialog bind:open={confirming} title="Refund this order" {consequence}>
	<p class="od__body">
		The pack has not been drawn on, so it reverses whole. The money returns through the gateway that
		took it; the credits come back as refund rows nobody can edit.
	</p>
	{#snippet actions()}
		<Button variant="ghost" onclick={() => (confirming = false)}>Keep it</Button>
		<form method="POST" action="?/refund">
			<Button type="submit" variant="secondary">Refund order</Button>
		</form>
	{/snippet}
</Dialog>

<style>
	.od {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}
	.od__title {
		margin: var(--space-2) 0 var(--space-1);
		font-family: var(--font-mono);
		font-size: var(--size-h4);
		letter-spacing: 0.07em;
		color: var(--ink);
	}
	.od__back,
	.od__label {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}
	.od__top {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		flex-wrap: wrap;
	}
	.od__facts {
		margin: 0;
		border: var(--hairline);
		padding: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		max-width: var(--measure);
	}
	.od__row {
		display: grid;
		grid-template-columns: 10rem 1fr;
		gap: var(--space-3);
		align-items: baseline;
	}
	.od__value {
		margin: 0;
		font-size: var(--size-body-sm);
		color: var(--ink);
	}
	.od__mono {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}
	.od__head {
		margin: 0 0 var(--space-3);
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}
	.od__body {
		margin: 0;
		font-size: var(--size-body-sm);
		color: var(--text-secondary);
	}
	.od__actions {
		display: flex;
		gap: var(--space-3);
		align-items: center;
	}
	@media (max-width: 760px) {
		.od__row {
			grid-template-columns: 1fr;
			gap: var(--space-1);
		}
	}
</style>
