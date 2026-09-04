<script lang="ts">
	import { Banner, Button, Dialog, EmptyState, Eyebrow, StatusChip } from '$lib/ds';

	let { data, form } = $props();
	const player = $derived(data.currentPlayer);
	let confirming = $state<string | null>(null);
	const pending = $derived(data.upcoming.find((b) => b.id === confirming) ?? null);
</script>

<svelte:head><title>Bookings · Momentum Tennis</title></svelte:head>

<div class="bg">
	<Eyebrow ticks>Bookings</Eyebrow>

	{#if form?.cancelError}<Banner tone="error">{form.cancelError}</Banner>{/if}
	{#if form?.cancelled}
		<Banner>
			{form.cancelled === 'cancelled_late'
				? 'CANCELLED LATE — the credit was forfeited'
				: 'CANCELLED — the credit is back'}{form.forgiven
				? ' · this package’s one forgiven skip was used'
				: ''}{form.promoted ? ` · ${form.promoted} player promoted from the waitlist` : ''}
		</Banner>
	{/if}
	{#if data.loadError}<Banner tone="error">{data.loadError}</Banner>{/if}

	{#if !player}
		<EmptyState ticks>Add a player to see their bookings</EmptyState>
	{:else}
		<section>
			<h2 class="bg__head">Upcoming</h2>
			{#if data.upcoming.length === 0}
				<EmptyState
					>NOTHING BOOKED
					{#snippet action()}<Button href="/portal/book">Book a class</Button>{/snippet}
				</EmptyState>
			{:else}
				<ul class="bg__list">
					{#each data.upcoming as b (b.id)}
						<li class="bg__row">
							<span class="bg__when">{b.date} · {b.hours}</span>
							<StatusChip status={b.status === 'waitlisted' ? 'waitlisted' : 'active'} />
							{#if b.waitlistPosition}
								<span class="bg__note">POSITION {b.waitlistPosition}</span>
							{:else}
								<span class="bg__note"
									>{b.notice === 'free'
										? 'CANCEL NOW AND THE CREDIT RETURNS'
										: 'INSIDE THE NOTICE WINDOW — THE CREDIT IS FORFEITED'}</span
								>
							{/if}
							<Button variant="ghost" size="sm" onclick={() => (confirming = b.id)}>Cancel</Button>
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		<section>
			<h2 class="bg__head">Past</h2>
			{#if data.past.length === 0}
				<EmptyState>NOTHING YET</EmptyState>
			{:else}
				<ul class="bg__list">
					{#each data.past as b (b.id)}
						<li class="bg__row">
							<span class="bg__when">{b.date} · {b.hours}</span>
							<StatusChip status={b.status} />
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	{/if}
</div>

<Dialog
	open={confirming !== null}
	title="Cancel this booking"
	consequence={pending?.notice === 'free'
		? 'The credit returns and the week frees up'
		: 'Inside the notice window the credit is forfeited — the first skip on a package is forgiven'}
>
	<form method="POST" action="?/cancel" class="bg__confirm">
		<input type="hidden" name="bookingId" value={confirming ?? ''} />
		<p class="bg__body">{pending ? `${pending.date} · ${pending.hours}` : ''}</p>
		<div class="bg__confirm-actions">
			<Button variant="ghost" onclick={() => (confirming = null)}>Keep it</Button>
			<Button type="submit" variant="secondary">Cancel booking</Button>
		</div>
	</form>
</Dialog>

<style>
	.bg {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}
	.bg__head {
		margin: 0 0 var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--text-secondary);
		border-bottom: var(--hairline);
		padding-bottom: var(--space-2);
	}
	.bg__list {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.bg__row {
		display: grid;
		grid-template-columns: auto auto 1fr auto;
		gap: var(--space-4);
		align-items: center;
		padding: var(--space-3) 0;
		border-bottom: var(--hairline);
	}
	.bg__when,
	.bg__note {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
	}
	.bg__when {
		color: var(--ink);
	}
	.bg__note {
		color: var(--text-secondary);
	}
	.bg__body {
		margin: 0;
		font-size: var(--size-body-sm);
	}
	.bg__confirm {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
	.bg__confirm-actions {
		display: flex;
		gap: var(--space-3);
		justify-content: flex-end;
	}
	@media (max-width: 760px) {
		.bg__row {
			grid-template-columns: 1fr;
			gap: var(--space-2);
		}
	}
</style>
