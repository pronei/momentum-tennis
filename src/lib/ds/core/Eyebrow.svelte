<script lang="ts">
	import type { Snippet } from 'svelte';
	import FrameTicks from './FrameTicks.svelte';

	/* The speaking voice: uppercase, 13px, 0.107em. Optionally led by frame ticks. */
	let {
		onField = false,
		ticks = false,
		children
	}: { onField?: boolean; ticks?: boolean; children: Snippet } = $props();
</script>

<div class="mt-eyebrow mt-eyebrow-row" class:mt-eyebrow-row--field={onField}>
	{#if ticks}<FrameTicks size={7} tone={onField ? 'field' : 'light'} />{/if}
	<span>{@render children()}</span>
</div>

<style>
	.mt-eyebrow-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		color: var(--court-500);
	}
	.mt-eyebrow-row--field {
		color: var(--text-on-field-dim);
	}
</style>
