<script lang="ts">
	import { resolve } from '$app/paths';
	import { Banner, Button, EmptyState, Eyebrow, StatusChip } from '$lib/ds';

	let { data, form } = $props();
	const marked = $derived(data.roster.filter((r) => r.present !== null).length);
</script>

<svelte:head><title>{data.session.title} · Sessions</title></svelte:head>

<div class="at">
	<div>
		<Eyebrow ticks>{data.session.date} · {data.session.hours}</Eyebrow>
		<h2 class="at__title">{data.session.title}</h2>
		<span class="at__where">{data.session.where}</span>
		<a class="at__back" href={resolve('/coach/sessions')}>All sessions</a>
	</div>

	{#if data.loadError}<Banner tone="error">{data.loadError}</Banner>{/if}
	{#if form?.markError}<Banner tone="error">{form.markError}</Banner>{/if}
	{#if form?.settleError}<Banner tone="error">{form.settleError}</Banner>{/if}
	{#if form?.settled !== undefined}<Banner>SETTLED · {form.settled} BOOKING(S)</Banner>{/if}
	{#if data.session.cancelled}<Banner>This session is cancelled.</Banner>{/if}

	{#if data.roster.length === 0}
		<EmptyState ticks>Nobody is booked on this session</EmptyState>
	{:else}
		<p class="at__count">MARKED {marked} OF {data.roster.length}</p>
		<ul class="at__list">
			{#each data.roster as r (r.playerId)}
				<li class="at__row">
					<span class="at__name">{r.fullName}</span>
					<StatusChip status={r.status} />
					<span class="at__state"
						>{r.present === null ? 'NOT MARKED' : r.present ? 'PRESENT' : 'ABSENT'}</span
					>
					<span class="at__actions">
						<form method="POST" action="?/mark">
							<input type="hidden" name="playerId" value={r.playerId} />
							<input type="hidden" name="present" value="true" />
							<Button size="sm" variant={r.present === true ? 'secondary' : 'ghost'} type="submit"
								>Present</Button
							>
						</form>
						<form method="POST" action="?/mark">
							<input type="hidden" name="playerId" value={r.playerId} />
							<input type="hidden" name="present" value="false" />
							<Button size="sm" variant={r.present === false ? 'secondary' : 'ghost'} type="submit"
								>Absent</Button
							>
						</form>
					</span>
				</li>
			{/each}
		</ul>

		{#if data.session.ended}
			<form method="POST" action="?/settle" class="at__settle">
				<p class="at__note">
					Settling closes every booking that has ended: an absence becomes a no-show, and the first
					skip on a package is forgiven.
				</p>
				<Button variant="secondary" size="sm" type="submit">Settle ended sessions</Button>
			</form>
		{/if}
	{/if}
</div>

<style>
	.at {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		max-width: 760px;
	}
	.at__title {
		margin: var(--space-2) 0;
		font-size: var(--size-h4);
	}
	.at__where,
	.at__state,
	.at__count,
	.at__back {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
	}
	.at__where,
	.at__state,
	.at__count {
		color: var(--text-secondary);
	}
	.at__back {
		color: var(--link);
		display: block;
		margin-top: var(--space-2);
	}
	.at__count {
		margin: 0;
	}
	.at__list {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.at__row {
		display: grid;
		grid-template-columns: 1fr auto auto auto;
		gap: var(--space-4);
		align-items: center;
		padding: var(--space-3) 0;
		border-bottom: var(--hairline);
	}
	.at__name {
		font-size: var(--size-body-sm);
		color: var(--ink);
	}
	.at__actions {
		display: flex;
		gap: var(--space-2);
	}
	.at__settle {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		border-top: var(--hairline);
		padding-top: var(--space-4);
	}
	.at__note {
		margin: 0;
		max-width: var(--measure);
		font-size: var(--size-body-sm);
		color: var(--text-secondary);
	}
	@media (max-width: 760px) {
		.at__row {
			grid-template-columns: 1fr;
			gap: var(--space-2);
		}
	}
</style>
