<script lang="ts">
	import type { Snippet } from 'svelte';

	/* Modal on the native <dialog> (focus trap, Esc, top layer, focus restore for free):
	   desktop = centered square card on the court-navy 55% backdrop; ≤760px = the bottom-sheet pattern.
	   Confirm rule: max ONE amber action per dialog; destructive confirms use a secondary outlined
	   button with --state-error text + the mono consequence line — amber never confirms deletion. */
	let {
		open = $bindable(false),
		onclose,
		title,
		label,
		consequence,
		width = 520,
		actions,
		children
	}: {
		open?: boolean;
		onclose?: () => void;
		title?: string;
		/** aria-label when there is no title */
		label?: string;
		/** Mono uppercase consequence line in --state-error, for destructive confirms */
		consequence?: string;
		/** Desktop panel width */
		width?: number;
		/** Action buttons row (right-aligned) */
		actions?: Snippet;
		children?: Snippet;
	} = $props();

	let el: HTMLDialogElement | undefined = $state();
	$effect(() => {
		if (!el) return;
		if (open && !el.open) el.showModal();
		if (!open && el.open) el.close();
	});
	function close() {
		open = false;
		onclose?.();
	}
</script>

<dialog
	bind:this={el}
	class="mt-dialog"
	style:--mt-dialog-w="{width}px"
	aria-label={title ? undefined : label}
	oncancel={(e) => {
		e.preventDefault();
		close();
	}}
	onclick={(e) => {
		if (e.target === el) close();
	}}
>
	{#if open}
		<div class="mt-dialog__head">
			{#if title}<h2 class="mt-dialog__title">{title}</h2>{:else}<span></span>{/if}
			<button type="button" class="mt-dialog__close" aria-label="Close" onclick={close}
				>&#xD7;</button
			>
		</div>
		{@render children?.()}
		{#if consequence}<div class="mt-dialog__consequence">{consequence}</div>{/if}
		{#if actions}<div class="mt-dialog__actions">{@render actions()}</div>{/if}
	{/if}
</dialog>

<style>
	.mt-dialog {
		background: var(--white);
		color: var(--ink);
		border: 1px solid var(--border-hairline);
		border-radius: var(--radius-none);
		width: min(var(--mt-dialog-w), calc(100vw - 48px));
		max-height: 80vh;
		overflow-y: auto;
		padding: var(--space-5);
		box-sizing: border-box;
		outline: none;
	}
	.mt-dialog::backdrop {
		background: color-mix(in srgb, var(--court-900) 55%, transparent);
	}
	:global(html:has(dialog.mt-dialog[open])) {
		overflow: hidden;
	}
	.mt-dialog__head {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--space-4);
		margin-bottom: 14px;
	}
	.mt-dialog__title {
		margin: 0;
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--size-h4);
		line-height: 1.1;
		letter-spacing: var(--track-display);
		text-transform: uppercase;
	}
	.mt-dialog__close {
		width: 44px;
		height: 44px;
		margin: -10px -12px 0 0;
		background: none;
		border: none;
		cursor: pointer;
		font-family: var(--font-mono);
		font-size: 1.25rem;
		color: var(--ink);
	}
	.mt-dialog__consequence {
		margin-top: var(--space-4);
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		line-height: 1.6;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--state-error);
	}
	.mt-dialog__actions {
		display: flex;
		gap: var(--space-3);
		justify-content: flex-end;
		flex-wrap: wrap;
		margin-top: 20px;
	}
	@media (max-width: 760px) {
		/* the bottom sheet: 2px ink top rule, 72vh max, safe-area padding */
		.mt-dialog {
			position: fixed;
			inset: auto 0 0 0;
			margin: 0;
			width: 100%;
			max-width: none;
			max-height: 72vh;
			border: none;
			border-top: 2px solid var(--ink);
			padding: 16px 16px calc(24px + env(safe-area-inset-bottom));
		}
	}
</style>
