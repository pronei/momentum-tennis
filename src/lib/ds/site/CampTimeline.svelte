<script lang="ts">
	/* The camp day as a strobe sequence: numbered frames — the one place numbers are allowed —
	   deepen from mist to court-800 as the day advances, and the frame under the cursor or focus
	   becomes the warm "now". Default items are the real 2026 camp schedule.

	   As in ClassTimeline, the rows are not in the tab order: nothing in one is actionable and the
	   amber frame is decoration over text that is already there. */
	type Item = { time: string; title: string; desc?: string; phase?: string };

	const DEFAULT_ITEMS: Item[] = [
		{
			time: '09:00',
			title: 'On-court training & technique',
			desc: 'Footwork, grip, swing shape — small groups by ball level.',
			phase: 'On court'
		},
		{ time: '09:45', title: 'Rallies & games', phase: 'On court' },
		{
			time: '10:45',
			title: 'Match play & strategy',
			desc: 'USTA team-tennis formats, point construction, scoring.',
			phase: 'On court'
		},
		{ time: '13:00', title: 'Chess & mental development', phase: 'Mind' },
		{
			time: '14:30',
			title: 'Music production, photography, art & crafts',
			desc: 'Creative studios at De Anza College, to 17:00.',
			phase: 'Studio'
		}
	];

	let { items = DEFAULT_ITEMS }: { items?: Item[] } = $props();

	/** Seven cool steps; the frame's place in the day picks one, so the day visibly deepens. */
	const STEPS = 7;
	const step = (i: number) =>
		items.length < 2 ? 0 : Math.round((i / (items.length - 1)) * (STEPS - 1));
	const light = (i: number) => (items.length < 2 ? true : i / (items.length - 1) < 0.45);
</script>

<ol class="mt-cat">
	{#each items as it, i (i)}
		<li class="mt-cat__item">
			{#if i < items.length - 1}<span class="mt-cat__rule" aria-hidden="true"></span>{/if}
			<span class="mt-cat__time">{it.time}</span>
			<span
				class="mt-cat__chip mt-cat__chip--{step(i)}"
				class:mt-cat__chip--light={light(i)}
				aria-hidden="true">{String(i + 1).padStart(2, '0')}</span
			>
			<div class="mt-cat__body">
				<div class="mt-cat__row">
					<span class="mt-cat__title">{it.title}</span>
					{#if it.phase}<span class="mt-cat__phase">{it.phase}</span>{/if}
				</div>
				{#if it.desc}<span class="mt-cat__desc">{it.desc}</span>{/if}
			</div>
		</li>
	{/each}
</ol>

<style>
	.mt-cat {
		list-style: none;
		margin: 0;
		padding: 0;
		position: relative;
	}
	.mt-cat__item {
		display: grid;
		grid-template-columns: 56px 40px 1fr;
		gap: 0 18px;
		align-items: start;
		position: relative;
		padding: 14px 8px;
		cursor: default;
		outline-offset: 2px;
		background: transparent;
		transition: background var(--dur-fast) var(--ease-out);
	}
	.mt-cat__item:hover {
		background: var(--surface-tint);
	}
	.mt-cat__rule {
		position: absolute;
		left: 93px;
		top: 54px;
		bottom: -14px;
		width: 1px;
		background: var(--border-hairline);
	}
	.mt-cat__time {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		color: var(--text-secondary);
		padding-top: 11px;
	}
	.mt-cat__chip {
		width: 40px;
		height: 40px;
		display: grid;
		place-items: center;
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: var(--weight-medium);
		position: relative;
		z-index: 1;
		color: var(--line-white);
		transition: background var(--dur-fast) var(--ease-out);
	}
	.mt-cat__chip--light {
		color: var(--court-800);
	}
	.mt-cat__chip--0 {
		background: var(--court-100);
	}
	.mt-cat__chip--1 {
		background: var(--court-200);
	}
	.mt-cat__chip--2 {
		background: var(--court-300);
	}
	.mt-cat__chip--3 {
		background: var(--court-400);
	}
	.mt-cat__chip--4 {
		background: var(--court-500);
	}
	.mt-cat__chip--5 {
		background: var(--court-700);
	}
	.mt-cat__chip--6 {
		background: var(--court-800);
	}
	.mt-cat__item:hover .mt-cat__chip {
		background: var(--now);
		color: var(--ink);
	}
	.mt-cat__body {
		display: flex;
		flex-direction: column;
		gap: 3px;
		padding-top: var(--space-2);
	}
	.mt-cat__row {
		display: flex;
		justify-content: space-between;
		gap: var(--space-4);
		align-items: baseline;
	}
	.mt-cat__title {
		font-family: var(--font-sans);
		font-size: var(--size-body);
		font-weight: var(--weight-medium);
		color: var(--ink);
	}
	.mt-cat__phase {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: var(--track-label);
		text-transform: uppercase;
		color: var(--court-400);
		white-space: nowrap;
		transition: color var(--dur-fast) var(--ease-out);
	}
	.mt-cat__item:hover .mt-cat__phase {
		color: var(--accent-present-hover);
	}
	.mt-cat__desc {
		font-family: var(--font-sans);
		font-size: var(--size-body-sm);
		line-height: 1.5;
		color: var(--text-secondary);
		max-width: 52ch;
	}
</style>
