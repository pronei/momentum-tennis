<script lang="ts">
	import type { Snippet } from 'svelte';

	/* Bottom toast: square ink strip, mono message, auto-dismiss. Entry is one short settle;
	   the global reduced-motion rule makes it instant. For confirmations use the existing
	   vocabulary: "MARKED · 8 / 10", "SAVED · 16:04". */
	let {
		open = $bindable(false),
		ondismiss,
		duration = 4000,
		children
	}: {
		open?: boolean;
		ondismiss?: () => void;
		/** ms; 0 disables auto-dismiss */
		duration?: number;
		children?: Snippet;
	} = $props();

	function dismiss() {
		open = false;
		ondismiss?.();
	}
	$effect(() => {
		if (!open || !duration) return;
		const t = setTimeout(dismiss, duration);
		return () => clearTimeout(t);
	});
</script>

{#if open}
	<div class="mt-toast" role="status">
		<span>{@render children?.()}</span>
		<button type="button" class="mt-toast__x" aria-label="Dismiss" onclick={dismiss}>&#xD7;</button>
	</div>
{/if}

<style>
	.mt-toast {
		position: fixed;
		left: 50%;
		bottom: var(--space-5);
		transform: translate(-50%, 0);
		z-index: 60;
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: 14px 18px;
		max-width: min(560px, calc(100vw - 32px));
		box-sizing: border-box;
		background: var(--ink);
		color: var(--line-white);
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		line-height: 1.5;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		animation: mt-toast-in var(--dur-base) var(--ease-out);
	}
	.mt-toast__x {
		width: 32px;
		height: 32px;
		margin: -8px -10px -8px 0;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--line-white);
		font-family: var(--font-mono);
		font-size: var(--size-body);
	}
	@keyframes mt-toast-in {
		from {
			opacity: 0;
			transform: translate(-50%, 8px);
		}
		to {
			opacity: 1;
			transform: translate(-50%, 0);
		}
	}
</style>
