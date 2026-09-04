<script lang="ts">
	import { resolve } from '$app/paths';
	import { Banner, Button, EmptyState, Eyebrow, StatusChip } from '$lib/ds';

	let { data, form } = $props();
	const player = $derived(data.currentPlayer);
	const classCredits = $derived(
		data.balances
			.filter((b) => b.creditKind !== 'private_lesson')
			.reduce((n, b) => n + b.balance, 0)
	);
	const label = (kind: string) =>
		kind === 'class_weekday' ? 'WEEKDAY' : kind === 'class_weekend' ? 'WEEKEND' : 'LESSONS';
</script>

<svelte:head><title>Book · Momentum Tennis</title></svelte:head>

<div class="bk">
	<Eyebrow ticks>Book a class</Eyebrow>

	{#if !player}
		<EmptyState ticks>
			Add a player first — a class is booked for a named player
			{#snippet action()}<Button href="/portal/players/new">Add a player</Button>{/snippet}
		</EmptyState>
	{:else}
		<div class="bk__wallet">
			{#each data.balances as b (b.creditKind)}
				<span class="bk__credit">{label(b.creditKind)} {b.balance}</span>
			{/each}
			<a class="bk__link" href={resolve('/(portal)/portal/credits')}>See credits</a>
		</div>

		{#if data.loadError}<Banner tone="error">{data.loadError}</Banner>{/if}
		{#if form?.bookError}<Banner tone="error">{form.bookError}</Banner>{/if}
		{#if form?.booked}<Banner>BOOKED — a confirmation is on its way</Banner>{/if}

		{#if classCredits === 0}
			<Banner>
				No class credits yet. The academy grants them, and from the next phase you will be able to
				buy a package.
			</Banner>
		{/if}

		{#if data.days.length === 0}
			<EmptyState ticks>Nothing bookable for {player.fullName} in the next three weeks</EmptyState>
		{:else}
			{#each data.days as day (day.date)}
				<section class="bk__day">
					<h2 class="bk__date">{day.date}</h2>
					<ul class="bk__list">
						{#each day.sessions as s (s.id)}
							<li class="bk__session">
								<span class="bk__hours">{s.hours}</span>
								<span class="bk__title">{s.title}</span>
								<span class="bk__where">{s.where}</span>
								<span class="bk__action">
									{#if s.alreadyBooked}
										<StatusChip status="active" />
									{:else if s.weekBlocked}
										<span class="bk__note"
											>{s.scope === 'weekend' ? 'WEEKEND' : 'WEEKDAY'} CLASS ALREADY BOOKED THIS WEEK</span
										>
									{:else}
										<form method="POST">
											<input type="hidden" name="sessionId" value={s.id} />
											<input type="hidden" name="playerId" value={player.id} />
											<Button
												size="sm"
												variant={s.seatsLeft > 0 ? 'secondary' : 'ghost'}
												type="submit"
											>
												{s.seatsLeft > 0 ? `Book · ${s.seatsLeft} left` : 'Join waitlist'}
											</Button>
										</form>
									{/if}
								</span>
							</li>
						{/each}
					</ul>
				</section>
			{/each}
		{/if}
	{/if}
</div>

<style>
	.bk {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}
	.bk__wallet {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		flex-wrap: wrap;
	}
	.bk__credit,
	.bk__hours,
	.bk__where,
	.bk__note {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}
	.bk__credit {
		color: var(--ink);
		border: var(--hairline);
		padding: var(--space-2) var(--space-3);
	}
	.bk__link {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--link);
	}
	.bk__day {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	.bk__date {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		color: var(--text-secondary);
		border-bottom: var(--hairline);
		padding-bottom: var(--space-2);
	}
	.bk__list {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.bk__session {
		display: grid;
		grid-template-columns: auto 1fr auto auto;
		gap: var(--space-4);
		align-items: center;
		padding: var(--space-3) 0;
		border-bottom: var(--hairline);
	}
	.bk__title {
		font-size: var(--size-body-sm);
		color: var(--ink);
	}
	.bk__action {
		display: flex;
		justify-content: flex-end;
	}
	@media (max-width: 760px) {
		.bk__session {
			grid-template-columns: 1fr;
			gap: var(--space-2);
		}
		.bk__action {
			justify-content: flex-start;
		}
	}
</style>
