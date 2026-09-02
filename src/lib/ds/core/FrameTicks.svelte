<script lang="ts">
	/* Micro-device derived from the strobe: a row of frames, the active one warm.
	   List marker, divider, loading state. */
	let {
		count = 5,
		size = 8,
		gap = 5,
		tone = 'light',
		active = 'last',
		loading = false
	}: {
		count?: number;
		size?: number;
		gap?: number;
		tone?: 'light' | 'field';
		/** Which frame is "now": 'last' | 'none' | index */
		active?: 'last' | 'none' | number;
		/** Animates the warm frame cycling through — loading indicator */
		loading?: boolean;
	} = $props();

	// Cool ramps from the reference (#5B84AC in the field ramp is a reference value without a token).
	const cool = $derived(
		tone === 'field'
			? ['var(--court-400)', '#5B84AC', 'var(--court-300)', 'var(--court-200)']
			: ['var(--ghost-1)', 'var(--ghost-2)', 'var(--ghost-3)', 'var(--ghost-4)']
	);
	const activeIdx = $derived(active === 'none' ? -1 : active === 'last' ? count - 1 : active);
	const frames = $derived(Array.from({ length: count }, (_, i) => i));
</script>

<span
	class="mt-ticks"
	style:gap="{gap}px"
	aria-hidden={loading ? undefined : true}
	role={loading ? 'status' : undefined}
	aria-label={loading ? 'Loading' : undefined}
>
	{#each frames as i (i)}
		<span
			class="mt-tick"
			style:width="{size}px"
			style:height="{size}px"
			style:background={i === activeIdx && !loading
				? 'var(--now)'
				: cool[Math.min(cool.length - 1, Math.floor((i / count) * cool.length))]}
			style:animation={loading ? `mt-tick-cycle ${count * 0.32}s ${i * 0.32}s infinite` : undefined}
		></span>
	{/each}
</span>

<style>
	.mt-ticks {
		display: inline-flex;
		align-items: center;
	}
	.mt-tick {
		display: inline-block;
	}
	@keyframes mt-tick-cycle {
		0%,
		25% {
			background: var(--now);
		}
		30%,
		100% {
			background: var(--court-200);
		}
	}
</style>
