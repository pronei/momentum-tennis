<script lang="ts">
	import type { Snippet } from 'svelte';
	import Eyebrow from '../core/Eyebrow.svelte';

	/* Groups fields under an eyebrow + hairline rule. The building block of every settings/admin form. */
	let {
		eyebrow,
		ticks = false,
		description,
		children
	}: { eyebrow?: string; ticks?: boolean; description?: string; children: Snippet } = $props();
</script>

<section class="mt-section">
	<div class="mt-section__head">
		{#if eyebrow}<Eyebrow {ticks}>{eyebrow}</Eyebrow>{/if}
		{#if description}<p class="mt-section__desc">{description}</p>{/if}
	</div>
	<div class="mt-section__fields">{@render children()}</div>
</section>

<style>
	.mt-section {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	.mt-section__head {
		border-bottom: var(--hairline);
		padding-bottom: var(--space-3);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	.mt-section__desc {
		margin: 0;
		font-family: var(--font-sans);
		font-size: var(--size-body-sm);
		line-height: var(--leading-body);
		color: var(--text-secondary);
		max-width: 52ch;
	}
	.mt-section__fields {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
</style>
