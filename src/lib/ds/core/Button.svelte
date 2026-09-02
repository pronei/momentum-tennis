<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	/* Action pill — the path a circle sweeps through time. Amber primary appears ONCE per view. */
	type Props = {
		/** 'primary' (amber — ONE per view) | 'secondary' (outlined) | 'ghost' (bare label) */
		variant?: 'primary' | 'secondary' | 'ghost';
		/** 'md' 48px | 'sm' 36px (compact contexts: nav, cards) */
		size?: 'md' | 'sm';
		/** True on court-blue fields */
		onField?: boolean;
		/** Renders an <a> when set */
		href?: string;
		disabled?: boolean;
		type?: 'button' | 'submit';
		children: Snippet;
	} & HTMLAttributes<HTMLElement>;

	let {
		variant = 'primary',
		size = 'md',
		onField = false,
		href,
		disabled = false,
		type = 'button',
		children,
		...rest
	}: Props = $props();
</script>

{#if href}
	<a
		{href}
		class="mt-btn"
		class:mt-btn--primary={variant === 'primary'}
		class:mt-btn--secondary={variant === 'secondary'}
		class:mt-btn--ghost={variant === 'ghost'}
		class:mt-btn--sm={size === 'sm'}
		class:mt-btn--field={onField}
		class:mt-btn--disabled={disabled}
		aria-disabled={disabled || undefined}
		{...rest}>{@render children()}</a
	>
{:else}
	<button
		{type}
		class="mt-btn"
		class:mt-btn--primary={variant === 'primary'}
		class:mt-btn--secondary={variant === 'secondary'}
		class:mt-btn--ghost={variant === 'ghost'}
		class:mt-btn--sm={size === 'sm'}
		class:mt-btn--field={onField}
		{disabled}
		{...rest}>{@render children()}</button
	>
{/if}

<style>
	.mt-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		height: var(--size-action);
		padding: 0 28px;
		border-radius: var(--radius-action);
		font-family: var(--font-sans);
		font-size: var(--size-label);
		font-weight: var(--weight-bold);
		letter-spacing: var(--track-label);
		text-transform: uppercase;
		text-decoration: none;
		cursor: pointer;
		border: 1.5px solid transparent;
		transition:
			background var(--dur-fast) var(--ease-out),
			color var(--dur-fast) var(--ease-out),
			border-color var(--dur-fast) var(--ease-out),
			transform var(--dur-fast) var(--ease-out);
		-webkit-tap-highlight-color: transparent;
		box-sizing: border-box;
	}
	.mt-btn:active {
		transform: translateY(1px);
	}
	.mt-btn--sm {
		height: var(--size-action-sm);
		padding: 0 20px;
		font-size: var(--size-label-sm);
	}
	.mt-btn--primary {
		background: var(--accent-present);
		color: var(--ink);
		border-color: var(--accent-present);
	}
	.mt-btn--primary:hover {
		background: var(--accent-present-hover);
		border-color: var(--accent-present-hover);
	}
	.mt-btn--secondary {
		background: transparent;
		color: var(--ink);
		border-color: var(--ink);
	}
	.mt-btn--secondary:hover {
		background: var(--ink);
		color: var(--line-white);
	}
	.mt-btn--secondary.mt-btn--field {
		color: var(--line-white);
		border-color: var(--line-white);
	}
	.mt-btn--secondary.mt-btn--field:hover {
		background: var(--line-white);
		color: var(--court-800);
	}
	.mt-btn--ghost {
		background: transparent;
		color: var(--ink);
		border-color: transparent;
		padding: 0 8px;
	}
	.mt-btn--ghost:hover {
		text-decoration: underline;
		text-underline-offset: 6px;
		text-decoration-thickness: 2px;
		text-decoration-color: var(--court-500);
	}
	.mt-btn--ghost.mt-btn--field {
		color: var(--line-white);
	}
	.mt-btn--ghost.mt-btn--field:hover {
		text-decoration-color: var(--now);
	}
	.mt-btn--field:focus-visible {
		outline-color: var(--focus-on-dark);
	}
	.mt-btn[disabled],
	.mt-btn--disabled {
		opacity: 0.45;
		pointer-events: none;
	}
</style>
