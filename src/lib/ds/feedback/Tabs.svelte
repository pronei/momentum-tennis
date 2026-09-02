<script lang="ts">
	/* The portal's tab pair as one component: desktop = underline tab row on a hairline;
	   ≤760px = fixed bottom bar with the amber top border marking "now" (or a scrollable top row
	   for admin-density tab sets via mobileMode="scroll"). Items with hrefs render as links —
	   in SvelteKit, tabs are routes. */
	type Item = string | { id: string; label: string; href?: string };
	let {
		items = [],
		active,
		onchange,
		mobileMode = 'bottom',
		ariaLabel = 'Sections'
	}: {
		items?: Item[];
		/** id of the current tab */
		active?: string;
		onchange?: (id: string) => void;
		/** ≤760px behavior: 'bottom' bar (default) or 'scroll' top row */
		mobileMode?: 'bottom' | 'scroll';
		ariaLabel?: string;
	} = $props();
	const list = $derived(items.map((t) => (typeof t === 'object' ? t : { id: t, label: t })));
</script>

<nav class="mt-tabs" class:mt-tabs--bottom={mobileMode === 'bottom'} aria-label={ariaLabel}>
	{#each list as t (t.id)}
		{#if t.href}
			<a
				href={t.href}
				class="mt-tab"
				class:mt-tab--on={active === t.id}
				aria-current={active === t.id ? 'page' : undefined}>{t.label}</a
			>
		{:else}
			<button
				type="button"
				class="mt-tab"
				class:mt-tab--on={active === t.id}
				aria-current={active === t.id ? 'page' : undefined}
				onclick={() => onchange?.(t.id)}>{t.label}</button
			>
		{/if}
	{/each}
</nav>

<style>
	.mt-tabs {
		display: flex;
		gap: 26px;
		border-bottom: var(--hairline);
	}
	.mt-tab {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0 2px 12px;
		white-space: nowrap;
		text-decoration: none;
		font-family: var(--font-sans);
		font-size: var(--size-label);
		font-weight: var(--weight-bold);
		letter-spacing: var(--track-label);
		text-transform: uppercase;
		color: var(--ink-secondary);
		border-bottom: 2px solid transparent;
		margin-bottom: -1px;
	}
	.mt-tab--on {
		color: var(--ink);
		border-bottom-color: var(--ink);
	}
	@media (max-width: 760px) {
		.mt-tabs {
			gap: 20px;
			overflow-x: auto;
			-webkit-overflow-scrolling: touch;
		}
		/* bottom bar: fixed, 56px + safe area, mono labels, amber TOP border = "now" */
		.mt-tabs--bottom {
			position: fixed;
			left: 0;
			right: 0;
			bottom: 0;
			z-index: 30;
			gap: 0;
			overflow: visible;
			background: color-mix(in srgb, var(--line-white) 96%, transparent);
			backdrop-filter: blur(8px);
			border-bottom: none;
			border-top: var(--hairline);
			padding-bottom: env(safe-area-inset-bottom);
		}
		.mt-tabs--bottom .mt-tab {
			flex: 1;
			min-height: 56px;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			margin: 0;
			padding: 0 2px;
			border-bottom: none;
			border-top: 2px solid transparent;
			font-family: var(--font-mono);
			font-size: 0.625rem;
			letter-spacing: 0.07em;
			font-weight: var(--weight-regular);
		}
		.mt-tabs--bottom .mt-tab--on {
			border-top-color: var(--now);
			font-weight: 600;
		}
	}
</style>
