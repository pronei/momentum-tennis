<script lang="ts">
	import { Banner, Button, Eyebrow, StatusChip } from '$lib/ds';

	let { data, form } = $props();
</script>

<svelte:head><title>Checkout · Momentum Tennis</title></svelte:head>

<div class="ck">
	<Eyebrow ticks>Checkout</Eyebrow>
	<Banner>SIMULATED CHECKOUT · DEV ONLY · NO MONEY MOVES</Banner>

	{#if form?.reason}<Banner tone="error">{form.reason}</Banner>{/if}

	<dl class="ck__facts">
		{#each data.order.items as item, i (i)}
			<div class="ck__row">
				<dt class="ck__label">Item</dt>
				<dd class="ck__value">{item.name} · {item.player}</dd>
			</div>
		{/each}
		<div class="ck__row">
			<dt class="ck__label">Amount</dt>
			<dd class="ck__value ck__mono">{data.order.amount}</dd>
		</div>
		<div class="ck__row">
			<dt class="ck__label">Ref</dt>
			<dd class="ck__value ck__mono">ORDER {data.order.ref}</dd>
		</div>
	</dl>

	{#if data.pending}
		<div class="ck__actions">
			<form method="POST" action="?/pay"><Button type="submit">Pay</Button></form>
			<form method="POST" action="?/abandon">
				<Button variant="ghost" type="submit">Abandon</Button>
			</form>
		</div>
	{:else}
		<div class="ck__done">
			<StatusChip status={data.order.statusLabel} />
			<Button variant="ghost" size="sm" href="/portal/purchases">See purchases</Button>
		</div>
	{/if}
</div>

<style>
	.ck {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}
	.ck__facts {
		margin: 0;
		border: var(--hairline);
		padding: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		max-width: var(--measure);
	}
	.ck__row {
		display: grid;
		grid-template-columns: 8rem 1fr;
		gap: var(--space-3);
		align-items: baseline;
	}
	.ck__label {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}
	.ck__value {
		margin: 0;
		font-size: var(--size-body-sm);
		color: var(--ink);
	}
	.ck__mono {
		font-family: var(--font-mono);
		letter-spacing: 0.07em;
		text-transform: uppercase;
	}
	.ck__actions,
	.ck__done {
		display: flex;
		gap: var(--space-3);
		align-items: center;
	}
	@media (max-width: 760px) {
		.ck__row {
			grid-template-columns: 1fr;
			gap: var(--space-1);
		}
	}
</style>
