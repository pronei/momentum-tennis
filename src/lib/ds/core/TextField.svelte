<script lang="ts">
	import { onMount } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import FieldShell from '../forms/FieldShell.svelte';

	/* Text input whose caret is a tennis ball bouncing on the baseline — the blink, replayed as
	   motion. Native caret under prefers-reduced-motion. Square, hairline, 48px. */
	type Props = {
		label?: string;
		help?: string;
		/** Renders "ERROR: <message>" + --state-error border; sets aria-invalid */
		error?: string;
		/** The bouncing-ball caret (default true; auto-disabled under reduced motion) */
		ballCaret?: boolean;
		value?: string;
		id?: string;
	} & Omit<HTMLInputAttributes, 'value' | 'id'>;

	let {
		label,
		help,
		error,
		ballCaret = true,
		value = $bindable(''),
		id,
		type = 'text',
		disabled = false,
		...rest
	}: Props = $props();

	const uid = $props.id();
	const fieldId = $derived(id ?? `mtf-${uid}`);

	let input: HTMLInputElement | undefined = $state();
	let focused = $state(false);
	let caretX = $state(14);
	let reducedMotion = $state(false);
	let canvas: HTMLCanvasElement | undefined;
	onMount(() => {
		reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
	});
	const useBall = $derived(ballCaret && !reducedMotion);

	function measure() {
		if (!input) return;
		const cs = getComputedStyle(input);
		canvas ??= document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
		const pos =
			input.selectionDirection === 'backward'
				? (input.selectionStart ?? 0)
				: (input.selectionEnd ?? input.value.length);
		const w = ctx.measureText(input.value.slice(0, pos)).width;
		const x = parseFloat(cs.paddingLeft) + w - input.scrollLeft;
		caretX = Math.max(6, Math.min(x, input.clientWidth - 8));
	}
</script>

<FieldShell id={fieldId} {label} {help} {error}>
	{#snippet children({ describedBy, invalid })}
		<span class="mt-field-wrap">
			<input
				bind:this={input}
				bind:value
				id={fieldId}
				{type}
				{disabled}
				class="mt-field-input"
				class:mt-ball={useBall}
				class:mt-field-input--error={invalid}
				aria-invalid={invalid || undefined}
				aria-describedby={describedBy}
				onfocus={() => {
					focused = true;
					requestAnimationFrame(measure);
				}}
				onblur={() => (focused = false)}
				oninput={measure}
				onselect={measure}
				onkeyup={measure}
				onclick={measure}
				{...rest}
			/>
			{#if useBall && focused && !disabled}
				<span class="mt-ball-caret" aria-hidden="true" style:left="{caretX}px"></span>
			{/if}
		</span>
	{/snippet}
</FieldShell>

<style>
	.mt-field-wrap {
		position: relative;
		display: block;
	}
	.mt-field-input {
		width: 100%;
		box-sizing: border-box;
		height: var(--size-action);
		padding: 0 14px;
		background: var(--white);
		border: 1px solid var(--border-hairline);
		border-radius: var(--radius-none);
		font-family: var(--font-sans);
		font-size: var(--size-body);
		color: var(--ink);
		transition: border-color var(--dur-fast) var(--ease-out);
	}
	.mt-field-input::placeholder {
		color: var(--court-300);
	}
	.mt-field-input:hover {
		border-color: var(--court-300);
	}
	.mt-field-input:focus {
		outline: none;
		border-color: var(--court-500);
	}
	.mt-field-input--error {
		border-color: var(--state-error);
	}
	.mt-field-input[disabled] {
		opacity: 0.45;
	}
	.mt-field-input.mt-ball {
		caret-color: transparent;
	}
	.mt-ball-caret {
		position: absolute;
		bottom: 14px;
		width: 2px;
		height: 18px;
		border-radius: 1px;
		background: var(--ink);
		pointer-events: none;
		transform: translate(-50%, 0);
		animation: mt-ball-bounce 1.3s infinite;
	}
	@keyframes mt-ball-bounce {
		0% {
			width: 2px;
			height: 18px;
			border-radius: 1px;
			background: var(--ink);
			transform: translate(-50%, 0);
			animation-timing-function: cubic-bezier(0.2, 0, 0.4, 1);
		}
		30% {
			width: 2px;
			height: 16px;
			border-radius: 1px;
			background: var(--ink);
			transform: translate(-50%, -12px);
			animation-timing-function: linear;
		}
		44% {
			width: 7px;
			height: 7px;
			border-radius: 50%;
			background: var(--now);
			transform: translate(-50%, -14px);
			animation-timing-function: cubic-bezier(0.55, 0, 1, 0.7);
		}
		70% {
			width: 7px;
			height: 7px;
			border-radius: 50%;
			background: var(--now);
			transform: translate(-50%, 0);
			animation-timing-function: ease-out;
		}
		76% {
			width: 9px;
			height: 6px;
			border-radius: 50%;
			background: var(--now);
			transform: translate(-50%, 1px);
			animation-timing-function: cubic-bezier(0.2, 0, 0.3, 1);
		}
		90%,
		100% {
			width: 2px;
			height: 18px;
			border-radius: 1px;
			background: var(--ink);
			transform: translate(-50%, 0);
		}
	}
</style>
