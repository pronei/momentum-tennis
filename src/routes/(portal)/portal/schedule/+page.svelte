<script lang="ts">
	import { Banner, EmptyState, Eyebrow } from '$lib/ds';

	let { data } = $props();
	const player = $derived(data.currentPlayer);
</script>

<svelte:head><title>Schedule · Momentum Tennis</title></svelte:head>

<div class="ps">
	<Eyebrow ticks>Next two weeks</Eyebrow>
	{#if player}
		<p class="ps__lead">
			What {player.fullName} can attend{player.levelKey
				? ' at their ball level'
				: ' — sessions open to every level, until the academy sets a ball level'}.
		</p>
	{/if}

	{#if data.loadError}<Banner tone="error">{data.loadError}</Banner>{/if}

	{#if data.days.length === 0}
		<EmptyState ticks>Nothing scheduled in the next two weeks</EmptyState>
	{:else}
		{#each data.days as day (day.date)}
			<section class="ps__day">
				<h2 class="ps__date">{day.date}</h2>
				<ul class="ps__list">
					{#each day.sessions as s (s.id)}
						<li class="ps__session">
							<span class="ps__hours">{s.hours}</span>
							<span class="ps__title">{s.title}</span>
							<span class="ps__where">{s.where}</span>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	{/if}

	<p class="ps__note">BOOKING OPENS IN THE NEXT PHASE</p>
</div>

<style>
	.ps {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}
	.ps__lead {
		margin: 0;
		max-width: var(--measure);
		font-size: var(--size-body-sm);
		color: var(--text-secondary);
	}
	.ps__day {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	.ps__date {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		color: var(--text-secondary);
		border-bottom: var(--hairline);
		padding-bottom: var(--space-2);
	}
	.ps__list {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.ps__session {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: var(--space-4);
		align-items: baseline;
		padding: var(--space-3) 0;
		border-bottom: var(--hairline);
	}
	.ps__hours,
	.ps__where {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}
	.ps__title {
		font-size: var(--size-body-sm);
		color: var(--ink);
	}
	.ps__note {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		color: var(--text-secondary);
	}
	@media (max-width: 760px) {
		.ps__session {
			grid-template-columns: 1fr;
			gap: var(--space-1);
		}
	}
</style>
