<script lang="ts">
	/* One class, play by play: three equal sequential blocks. Weekends run 2h (3×40 min), weekdays
	   1.5h (3×30 min). Wall-clock start times are set by the academy in the admin console, so this
	   shows T+ offsets and never a clock time. The hovered block goes amber = "now".

	   The reference puts each row in the tab order so focus can flip the frame too. It is dropped
	   here: nothing in a row is actionable, every value is already text, and five dead tab stops
	   cost a keyboard user more than the amber gains them. */
	type Block = { title: string; desc?: string };

	const DEFAULT_BLOCKS: Block[] = [
		{
			title: 'Technical skill training',
			desc: 'Footwork, grip, swing shape — one element isolated and repeated until you can see it.'
		},
		{
			title: 'Dynamic drills & skill application',
			desc: 'The same technique under movement and pressure: live feeds, patterns, decision speed.'
		},
		{
			title: 'Gameplay & strategy',
			desc: 'Point construction, scoring, match habits — the skill applied where it counts.'
		}
	];

	let {
		variant = 'weekend',
		showToggle = true,
		blocks = DEFAULT_BLOCKS
	}: {
		/** Initial length: 'weekend' (2h) or 'weekday' (1.5h) */
		variant?: 'weekend' | 'weekday';
		showToggle?: boolean;
		blocks?: Block[];
	} = $props();

	// the prop is the INITIAL length per the contract; the toggle owns it afterwards
	// svelte-ignore state_referenced_locally
	let current = $state(variant);
	const per = $derived(current === 'weekend' ? 40 : 30);
	const offset = (i: number) => {
		const t = i * per;
		return `T+${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
	};
</script>

<div class="mt-clt">
	{#if showToggle}
		<div class="mt-clt__toggle" role="group" aria-label="Class length">
			<button
				type="button"
				class="mt-clt__seg"
				class:mt-clt__seg--on={current === 'weekend'}
				aria-pressed={current === 'weekend'}
				onclick={() => (current = 'weekend')}>Weekend · 2h</button
			>
			<button
				type="button"
				class="mt-clt__seg"
				class:mt-clt__seg--on={current === 'weekday'}
				aria-pressed={current === 'weekday'}
				onclick={() => (current = 'weekday')}>Weekday · 1.5h</button
			>
		</div>
	{/if}

	<ol class="mt-clt__list">
		{#each blocks as b, i (i)}
			<li class="mt-clt__item">
				{#if i < blocks.length - 1}<span class="mt-clt__rule" aria-hidden="true"></span>{/if}
				<span class="mt-clt__offset">{offset(i)}</span>
				<span class="mt-clt__chip mt-clt__chip--{i + 1}" aria-hidden="true"
					>{String(i + 1).padStart(2, '0')}</span
				>
				<div class="mt-clt__body">
					<div class="mt-clt__row">
						<span class="mt-clt__title">{b.title}</span>
						<span class="mt-clt__len">{per} MIN</span>
					</div>
					{#if b.desc}<span class="mt-clt__desc">{b.desc}</span>{/if}
				</div>
			</li>
		{/each}
	</ol>

	<div class="mt-clt__foot">
		3 blocks · {per} min each · {current === 'weekend' ? '2h — weekends' : '1.5h — weekdays'} · times
		set by the academy
	</div>
</div>

<style>
	.mt-clt__toggle {
		display: flex;
		gap: var(--space-2);
		margin-bottom: var(--space-2);
	}
	.mt-clt__seg {
		height: 40px;
		padding: 0 16px;
		border: var(--hairline);
		background: transparent;
		cursor: pointer;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.08em;
		color: var(--ink);
		text-transform: uppercase;
		border-radius: var(--radius-none);
	}
	.mt-clt__seg--on {
		border-color: var(--ink);
		background: var(--court-050);
		font-weight: var(--weight-medium);
	}
	.mt-clt__list {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.mt-clt__item {
		display: grid;
		grid-template-columns: 58px 40px 1fr;
		gap: 0 16px;
		align-items: start;
		position: relative;
		padding: 14px 8px;
		background: transparent;
		transition: background var(--dur-fast) var(--ease-out);
		outline-offset: 2px;
	}
	.mt-clt__item:hover {
		background: var(--surface-tint);
	}
	.mt-clt__rule {
		position: absolute;
		left: 93px;
		top: 54px;
		bottom: -14px;
		width: 1px;
		background: var(--border-hairline);
	}
	.mt-clt__offset {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		color: var(--text-secondary);
		padding-top: 11px;
	}
	.mt-clt__chip {
		width: 40px;
		height: 40px;
		display: grid;
		place-items: center;
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: var(--weight-medium);
		position: relative;
		z-index: 1;
		transition: background var(--dur-fast) var(--ease-out);
	}
	.mt-clt__chip--1 {
		background: var(--court-200);
		color: var(--court-800);
	}
	.mt-clt__chip--2 {
		background: var(--court-400);
		color: var(--line-white);
	}
	.mt-clt__chip--3 {
		background: var(--court-800);
		color: var(--line-white);
	}
	.mt-clt__item:hover .mt-clt__chip {
		background: var(--now);
		color: var(--ink);
	}
	.mt-clt__body {
		display: flex;
		flex-direction: column;
		gap: 3px;
		padding-top: var(--space-2);
	}
	.mt-clt__row {
		display: flex;
		justify-content: space-between;
		gap: var(--space-4);
		align-items: baseline;
	}
	.mt-clt__title {
		font-family: var(--font-sans);
		font-size: var(--size-body);
		font-weight: var(--weight-medium);
		color: var(--ink);
	}
	.mt-clt__len {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: var(--track-label);
		text-transform: uppercase;
		color: var(--court-400);
		white-space: nowrap;
	}
	.mt-clt__item:hover .mt-clt__len {
		color: var(--accent-present-hover);
	}
	.mt-clt__desc {
		font-family: var(--font-sans);
		font-size: var(--size-body-sm);
		line-height: 1.5;
		color: var(--text-secondary);
		max-width: 52ch;
	}
	.mt-clt__foot {
		border-top: var(--hairline);
		margin-top: 4px;
		padding-top: var(--space-3);
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.07em;
		color: var(--text-secondary);
		text-transform: uppercase;
	}
</style>
