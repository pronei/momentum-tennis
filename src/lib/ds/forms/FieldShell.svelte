<script lang="ts">
	import type { Snippet } from 'svelte';

	/* Internal: the shared form anatomy — tracked-caps label, mono help, dual-channel error
	   (--state-error + mono ERROR: line, role=alert) — with aria-describedby wiring handed to
	   the control via the snippet parameter. Not exported from the barrel. */
	let {
		id,
		label,
		help,
		error,
		labelAs = 'label',
		children
	}: {
		id: string;
		label?: string;
		help?: string;
		error?: string;
		/** 'span' for grouped controls that use aria-labelledby (SegmentedControl) */
		labelAs?: 'label' | 'span';
		children: Snippet<[{ describedBy: string | undefined; invalid: boolean; labelId: string }]>;
	} = $props();

	const labelId = $derived(`${id}-lbl`);
	const describedBy = $derived(
		[help ? `${id}-help` : null, error ? `${id}-err` : null].filter(Boolean).join(' ') || undefined
	);
</script>

<div class="mt-field">
	{#if label}
		{#if labelAs === 'label'}
			<label class="mt-field__label" for={id} id={labelId}>{label}</label>
		{:else}
			<span class="mt-field__label" id={labelId}>{label}</span>
		{/if}
	{/if}
	{@render children({ describedBy, invalid: Boolean(error), labelId })}
	{#if help}<span class="mt-field__help" id="{id}-help">{help}</span>{/if}
	{#if error}<span class="mt-field__error" id="{id}-err" role="alert">ERROR: {error}</span>{/if}
</div>

<style>
	.mt-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	.mt-field__label {
		font-family: var(--font-sans);
		font-size: var(--size-label);
		font-weight: var(--weight-bold);
		letter-spacing: var(--track-label);
		text-transform: uppercase;
		color: var(--text-secondary);
	}
	.mt-field__help,
	.mt-field__error {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		line-height: 1.5;
		letter-spacing: 0.04em;
	}
	.mt-field__help {
		color: var(--text-secondary);
	}
	.mt-field__error {
		color: var(--state-error);
		text-transform: uppercase;
	}
</style>
