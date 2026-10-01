<script lang="ts">
	/* The signature: a stroboscopic bounce — motion as frozen instants. Ghost frames cool, the
	   present frame warm. One per view (readme removal pass: on the home page, the camp-day band). */
	let {
		frames = 8,
		tone = 'light',
		showPath = true,
		annotate = false,
		ballRadius = 7,
		width = '100%',
		height
	}: {
		/** Number of frozen instants (min 3) */
		frames?: number;
		/** Surface it sits on: 'light' | 'field' (dark court blue) */
		tone?: 'light' | 'field';
		/** Faint dashed trajectory + ground line */
		showPath?: boolean;
		/** Mono frame labels t−n … t0 under each ball */
		annotate?: boolean;
		/** Ball radius in viewBox units */
		ballRadius?: number;
		width?: number | string;
		height?: number | string;
	} = $props();

	const W = 640;
	const H = 200;
	const pad = 16;
	const ground = H - 16;
	const bounces = [
		{ x0: 0, x1: 0.46, peak: 0.8 },
		{ x0: 0.46, x1: 0.78, peak: 0.44 },
		{ x0: 0.78, x1: 1.001, peak: 0.21 }
	];
	const yAt = (t: number) => {
		const b = bounces.find((b) => t >= b.x0 && t < b.x1) ?? bounces[2];
		const u = (t - b.x0) / (b.x1 - b.x0);
		return ground - 4 * u * (1 - u) * b.peak * (ground - 14);
	};
	const xAt = (t: number) => pad + t * (W - 2 * pad);

	// Cool ramps from the reference, by token where one matches (#5B84AC has none — as in FrameTicks).
	const COOL = {
		light: [
			'var(--ghost-1)',
			'var(--ghost-2)',
			'var(--ghost-3)',
			'var(--ghost-4)',
			'var(--court-500)'
		],
		field: [
			'var(--court-400)',
			'#5B84AC',
			'var(--court-300)',
			'var(--court-200)',
			'var(--court-100)'
		]
	};

	const n = $derived(Math.max(3, frames));
	const pts = $derived(
		Array.from({ length: n }, (_, i) => {
			const t = i / (n - 1);
			return { x: xAt(t), y: yAt(t) };
		})
	);
	const cool = $derived(COOL[tone]);
	const colorAt = (i: number) =>
		i === n - 1
			? 'var(--now)'
			: cool[Math.min(cool.length - 1, Math.floor((i / (n - 1)) * cool.length))];
	const dense = Array.from({ length: 81 }, (_, i) => {
		const t = i / 80;
		return `${xAt(t).toFixed(1)},${yAt(t).toFixed(1)}`;
	}).join(' ');
	const lineCol = $derived(tone === 'field' ? 'rgba(247,247,247,0.28)' : 'rgba(27,27,27,0.22)');
	const labelCol = $derived(
		tone === 'field' ? 'var(--text-on-field-dim)' : 'var(--text-secondary)'
	);
</script>

<svg
	class="mt-strobe"
	viewBox="0 0 {W} {H}"
	{width}
	{height}
	role="img"
	aria-label="Ball trajectory rendered as a stroboscopic sequence: past frames cool blue, the present frame warm amber"
>
	{#if showPath}
		<polyline
			points={dense}
			fill="none"
			stroke-width="1"
			stroke-dasharray="1 5"
			style:stroke={lineCol}
		/>
		<line
			x1={pad}
			y1={ground + ballRadius + 2}
			x2={W - pad}
			y2={ground + ballRadius + 2}
			stroke-width="1"
			style:stroke={lineCol}
		/>
	{/if}
	{#each pts as p, i (i)}
		<circle
			cx={p.x}
			cy={p.y}
			r={i === n - 1 ? ballRadius + 1 : ballRadius}
			style:fill={colorAt(i)}
		/>
	{/each}
	{#if annotate}
		{#each pts as p, i (i)}
			<text
				x={p.x}
				y={ground + ballRadius + 16}
				text-anchor="middle"
				class="mt-strobe__t"
				style:fill={labelCol}>{i === n - 1 ? 't0' : `t−${n - 1 - i}`}</text
			>
		{/each}
	{/if}
</svg>

<style>
	/* the reference sets the t-labels below its 200-unit viewBox, and inline SVG clips by default */
	.mt-strobe {
		display: block;
		overflow: visible;
	}
	.mt-strobe__t {
		font-family: var(--font-mono);
		font-size: 10px;
	}
</style>
