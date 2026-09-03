<script lang="ts">
	import type { Snippet } from 'svelte';

	/* The portal card treatment from design-system/ui_kits: white surface, hairline frame,
	   square. The reference's padding sits between two steps of the spacing scale; --space-5
	   is the on-scale value the system actually offers. */
	let { children }: { children: Snippet } = $props();
</script>

<div class="mt-card">{@render children()}</div>

<style>
	.mt-card {
		background: var(--surface-card);
		border: var(--hairline);
		padding: var(--space-5);
	}
</style>
