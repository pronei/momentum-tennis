<script lang="ts">
	import { resolve } from '$app/paths';
	import { Banner, Button, EmptyState, ResourceDayView } from '$lib/ds';

	let { data } = $props();
	const query = $derived(`location=${data.locationId ?? ''}`);
	const newHref = $derived(`${resolve('/admin/schedule/new')}?${query}&date=${data.localDate}`);
</script>

<svelte:head><title>Schedule · Momentum Tennis</title></svelte:head>

<div class="sched">
	<div class="sched__bar">
		{#if data.locations.length > 1}
			<nav class="sched__venues" aria-label="Location">
				{#each data.locations as l (l.value)}
					<a
						class="sched__venue"
						class:sched__venue--on={l.value === data.locationId}
						aria-current={l.value === data.locationId ? 'page' : undefined}
						href="{resolve('/admin/schedule')}?location={l.value}&date={data.localDate}"
						>{l.label}</a
					>
				{/each}
			</nav>
		{/if}
		<nav class="sched__days" aria-label="Day">
			<a
				class="sched__step"
				href="{resolve('/admin/schedule')}?{query}&date={data.prevDate}"
				aria-label="Previous day">&#x2190;</a
			>
			<a class="sched__step" href="{resolve('/admin/schedule')}?{query}&date={data.today}">TODAY</a>
			<a
				class="sched__step"
				href="{resolve('/admin/schedule')}?{query}&date={data.nextDate}"
				aria-label="Next day">&#x2192;</a
			>
		</nav>
		{#if data.locationId}
			<Button size="sm" href={newHref}>New session</Button>
		{/if}
	</div>

	{#if data.loadError}<Banner tone="error">{data.loadError}</Banner>{/if}

	{#if !data.locationId}
		<EmptyState ticks>
			No locations yet — a court has to exist before anything can be scheduled
			{#snippet action()}<Button href="/admin/availability">Set up courts</Button>{/snippet}
		</EmptyState>
	{:else if data.courts.length === 0}
		<EmptyState ticks>
			No active courts at this location
			{#snippet action()}<Button href="/admin/availability">Add a court</Button>{/snippet}
		</EmptyState>
	{:else}
		<ResourceDayView
			date={data.heading}
			courts={data.courts}
			sessions={data.sessions}
			nowTime={data.nowTime}
			sessionHref={(s) =>
				`${resolve('/admin/schedule/[id]', { id: s.id })}?location=${data.locationId}&date=${data.localDate}`}
		/>
	{/if}
</div>

<style>
	.sched {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}
	.sched__bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		flex-wrap: wrap;
	}
	.sched__venues,
	.sched__days {
		display: flex;
		gap: var(--space-2);
	}
	.sched__venue,
	.sched__step {
		min-height: 44px; /* ds-allow the system's minimum hit target; no token below --size-action */
		display: inline-flex;
		align-items: center;
		padding: 0 var(--space-4);
		border: var(--hairline);
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--ink);
		text-decoration: none;
	}
	.sched__venue--on {
		border-color: var(--ink);
		background: var(--court-050);
		font-weight: var(--weight-medium);
	}
	.sched__step {
		justify-content: center;
		min-width: 44px; /* ds-allow the system's minimum hit target */
	}
</style>
