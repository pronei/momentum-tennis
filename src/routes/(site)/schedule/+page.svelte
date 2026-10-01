<script lang="ts">
	import { Banner, Button, CampTimeline, ClassTimeline, EmptyState, Eyebrow } from '$lib/ds';

	let { data } = $props();
</script>

<svelte:head><title>Schedule · Momentum Tennis</title></svelte:head>

<main class="pub">
	<header class="pub__head">
		<Eyebrow ticks>Cupertino · De Anza College · Murdock Park</Eyebrow>
		<h1 class="mt-display pub__title">Schedule</h1>
		<p class="pub__lede">
			Classes by ball level, team practices and matches. Times are set each season and shown in
			academy time.
		</p>
	</header>

	<section class="pub__section">
		<Eyebrow>Play by play of your time on court</Eyebrow>
		<ClassTimeline />
	</section>

	<section class="pub__section">
		<Eyebrow>Next two weeks</Eyebrow>
		{#if data.loadError}<Banner tone="error">{data.loadError}</Banner>{/if}
		{#if data.days.length === 0}
			<EmptyState ticks>Nothing published for the next two weeks</EmptyState>
		{:else}
			{#each data.days as day (day.date)}
				<div class="pub__day">
					<h2 class="pub__date">{day.date}</h2>
					<ul class="pub__list">
						{#each day.sessions as s (s.id)}
							<li class="pub__session">
								<span class="pub__hours">{s.hours}</span>
								<span class="pub__name">{s.title}</span>
								<span class="pub__where">{s.where}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		{/if}
	</section>

	<section class="pub__section">
		<Eyebrow>The camp day</Eyebrow>
		<CampTimeline />
	</section>

	<div class="pub__cta">
		<Button href="/login?next=/portal">Book a free trial class</Button>
	</div>
</main>

<style>
	.pub {
		max-width: var(--container);
		margin: 0 auto;
		padding: var(--space-8) var(--space-6) var(--space-9);
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}
	.pub__head {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
	.pub__title {
		margin: 0;
		font-size: var(--size-h2);
	}
	.pub__lede {
		margin: 0;
		max-width: var(--measure);
		font-size: var(--size-body-lg);
		color: var(--text-secondary);
	}
	.pub__section {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
	.pub__day {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	.pub__date {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		color: var(--text-secondary);
		border-bottom: var(--hairline);
		padding-bottom: var(--space-2);
	}
	.pub__list {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.pub__session {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: var(--space-4);
		align-items: baseline;
		padding: var(--space-3) 0;
		border-bottom: var(--hairline);
	}
	.pub__hours,
	.pub__where {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}
	.pub__name {
		font-size: var(--size-body-sm);
		color: var(--ink);
	}
	.pub__cta {
		display: flex;
	}
	@media (max-width: 760px) {
		.pub {
			padding: var(--space-7) var(--space-4) var(--space-8);
		}
		.pub__session {
			grid-template-columns: 1fr;
			gap: var(--space-1);
		}
	}
</style>
