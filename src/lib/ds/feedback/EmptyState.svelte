<script lang="ts">
	import type { Snippet } from 'svelte';
	import FrameTicks from '../core/FrameTicks.svelte';

	/* The mono-line empty convention codified (NO SESSIONS — COURTS REST ON WED & FRI).
	   All-cool ticks: nothing is "now". */
	let {
		ticks = false,
		action,
		children
	}: { ticks?: boolean; action?: Snippet; children?: Snippet } = $props();
</script>

<div class="mt-empty">
	{#if ticks}<FrameTicks active="none" />{/if}
	<p class="mt-empty__line">{@render children?.()}</p>
	{#if action}<div>{@render action()}</div>{/if}
</div>

<style>
	.mt-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;
		padding: 40px 24px;
		text-align: center;
	}
	.mt-empty__line {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		line-height: 1.7;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--text-secondary);
		max-width: 44ch;
	}
</style>
