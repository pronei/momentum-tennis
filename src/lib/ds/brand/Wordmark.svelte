<script lang="ts">
	/* The wordmark: MOMENTUM in Chivo Black; the full stop is the ball — two cool ghost frames settle
	   into the warm present. 'word' sets MOMENTUM TENNIS on one line (the site header's use);
	   'lockup' adds the justified TENNIS line; 'mark' is the three-ball settle alone. */
	let {
		variant = 'lockup',
		height = 44,
		onField = false
	}: {
		variant?: 'lockup' | 'word' | 'mark';
		/** Cap height of MOMENTUM in px (mark: total width). Ghost frames hide below 30px */
		height?: number;
		/** True on court-blue fields — flips ink to line white */
		onField?: boolean;
	} = $props();

	const ghosts = $derived(height >= 30);
</script>

{#snippet word(label: string)}
	<span class="mt-wm__word" class:mt-wm--field={onField} style:font-size="{height}px"
		>{label}<span class="mt-wm__trail" aria-hidden="true"
			>{#if ghosts}<span class="mt-wm__ball mt-wm__ball--ghost mt-wm__ball--g2"></span><span
					class="mt-wm__ball mt-wm__ball--ghost mt-wm__ball--g3"
				></span>{/if}<span class="mt-wm__ball mt-wm__ball--now"></span></span
		></span
	>
{/snippet}

{#if variant === 'mark'}
	<span
		class="mt-wm-mark"
		role="img"
		aria-label="Momentum Tennis"
		style:width="{height}px"
		style:height="{height * 0.72}px"
	>
		<span class="mt-wm-mark__ball mt-wm-mark__ball--1"></span>
		<span class="mt-wm-mark__ball mt-wm-mark__ball--2"></span>
		<span class="mt-wm-mark__ball mt-wm-mark__ball--3"></span>
	</span>
{:else if variant === 'word'}
	<span class="mt-wm">{@render word('MOMENTUM TENNIS')}</span>
{:else}
	<span class="mt-wm-lockup" style:gap="{Math.max(3, height * 0.14)}px">
		<span aria-hidden="true">{@render word('MOMENTUM')}</span>
		<span
			class="mt-wm__tennis"
			class:mt-wm__tennis--field={onField}
			style:font-size="{Math.max(9, height * 0.252)}px"
			aria-hidden="true"
			>{#each 'TENNIS' as c, i (i)}<span>{c}</span>{/each}</span
		>
		<span class="mt-wm__sr">Momentum Tennis</span>
	</span>
{/if}

<style>
	.mt-wm {
		display: inline-block;
	}
	.mt-wm-lockup {
		position: relative;
		display: inline-flex;
		flex-direction: column;
	}
	.mt-wm__word {
		display: inline-flex;
		align-items: baseline;
		font-family: var(--font-display);
		font-weight: 900;
		line-height: 1;
		letter-spacing: 0.01em;
		color: var(--ink);
		text-transform: uppercase;
		white-space: nowrap;
	}
	.mt-wm--field {
		color: var(--line-white);
	}
	.mt-wm__trail {
		position: relative;
		display: inline-block;
		width: 0.62em;
		height: 0.72em;
		flex: none;
	}
	.mt-wm__ball {
		position: absolute;
		border-radius: 50%;
	}
	.mt-wm__ball--g2 {
		left: 0;
		bottom: 0.4em;
		width: 0.13em;
		height: 0.13em;
		background: var(--ghost-2);
	}
	.mt-wm__ball--g3 {
		left: 0.19em;
		bottom: 0.16em;
		width: 0.13em;
		height: 0.13em;
		background: var(--ghost-3);
	}
	.mt-wm__ball--now {
		left: 0.42em;
		bottom: 0;
		width: 0.15em;
		height: 0.15em;
		background: var(--now);
	}
	.mt-wm__tennis {
		display: flex;
		justify-content: space-between;
		font-family: var(--font-sans);
		font-weight: 700;
		line-height: 1;
		color: var(--ink-secondary);
		text-transform: uppercase;
	}
	.mt-wm__tennis--field {
		color: var(--text-on-field-dim);
	}
	.mt-wm__sr {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
	}
	.mt-wm-mark {
		position: relative;
		display: inline-block;
	}
	.mt-wm-mark__ball {
		position: absolute;
		border-radius: 50%;
	}
	.mt-wm-mark__ball--1 {
		left: 0;
		bottom: 56%;
		width: 22%;
		height: 30.5%;
		background: var(--ghost-2);
	}
	.mt-wm-mark__ball--2 {
		left: 31%;
		bottom: 22%;
		width: 22%;
		height: 30.5%;
		background: var(--ghost-3);
	}
	.mt-wm-mark__ball--3 {
		left: 66%;
		bottom: 0;
		width: 24.5%;
		height: 34%;
		background: var(--now);
	}
</style>
