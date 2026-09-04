<script lang="ts">
	import { resolve } from '$app/paths';
	import { Banner, EmptyState, Eyebrow } from '$lib/ds';

	let { data } = $props();
</script>

<svelte:head><title>Sessions · Momentum Tennis</title></svelte:head>

<div class="cs">
	<div class="cs__bar">
		<Eyebrow ticks>{data.heading}</Eyebrow>
		<nav class="cs__days" aria-label="Day">
			<a
				class="cs__step"
				href="{resolve('/coach/sessions')}?date={data.prevDate}"
				aria-label="Previous day">&#x2190;</a
			>
			<a class="cs__step" href="{resolve('/coach/sessions')}?date={data.today}">TODAY</a>
			<a
				class="cs__step"
				href="{resolve('/coach/sessions')}?date={data.nextDate}"
				aria-label="Next day">&#x2192;</a
			>
		</nav>
	</div>

	{#if data.loadError}<Banner tone="error">{data.loadError}</Banner>{/if}

	{#if data.sessions.length === 0}
		<EmptyState ticks>Nothing scheduled on this day</EmptyState>
	{:else}
		<ul class="cs__list">
			{#each data.sessions as s (s.id)}
				<li class="cs__row">
					<span class="cs__hours">{s.hours}</span>
					<a class="cs__title" href={resolve('/coach/sessions/[id]', { id: s.id })}>{s.title}</a>
					<span class="cs__where">{s.where}</span>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.cs {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}
	.cs__bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		flex-wrap: wrap;
	}
	.cs__days {
		display: flex;
		gap: var(--space-2);
	}
	.cs__step {
		min-height: 44px; /* ds-allow the system's minimum hit target */
		min-width: 44px; /* ds-allow the system's minimum hit target */
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0 var(--space-4);
		border: var(--hairline);
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--ink);
		text-decoration: none;
	}
	.cs__list {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.cs__row {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: var(--space-4);
		align-items: center;
		padding: var(--space-4) 0;
		border-bottom: var(--hairline);
	}
	.cs__hours,
	.cs__where {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}
	.cs__title {
		font-size: var(--size-body);
		color: var(--link);
	}
	@media (max-width: 760px) {
		.cs__row {
			grid-template-columns: 1fr;
			gap: var(--space-1);
		}
	}
</style>
