<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import FieldShell from './FieldShell.svelte';

	/* Multi-line input with the shared form anatomy. Native caret (the ball caret is inputs-only). */
	type Props = {
		label?: string;
		help?: string;
		error?: string;
		value?: string;
		id?: string;
	} & Omit<HTMLTextareaAttributes, 'value' | 'id'>;

	let {
		label,
		help,
		error,
		value = $bindable(''),
		id,
		rows = 4,
		disabled = false,
		...rest
	}: Props = $props();

	const uid = $props.id();
	const fieldId = $derived(id ?? `mta-${uid}`);
</script>

<FieldShell id={fieldId} {label} {help} {error}>
	{#snippet children({ describedBy, invalid })}
		<textarea
			bind:value
			id={fieldId}
			class="mt-ta"
			class:mt-ta--error={invalid}
			{rows}
			{disabled}
			aria-invalid={invalid || undefined}
			aria-describedby={describedBy}
			{...rest}></textarea>
	{/snippet}
</FieldShell>

<style>
	.mt-ta {
		width: 100%;
		box-sizing: border-box;
		min-height: 96px;
		padding: 12px 14px;
		background: var(--white);
		border: 1px solid var(--border-hairline);
		border-radius: var(--radius-none);
		font-family: var(--font-sans);
		font-size: var(--size-body);
		line-height: var(--leading-body);
		color: var(--ink);
		resize: vertical;
		transition: border-color var(--dur-fast) var(--ease-out);
	}
	.mt-ta::placeholder {
		color: var(--court-300);
	}
	.mt-ta:hover {
		border-color: var(--court-300);
	}
	.mt-ta:focus {
		outline: none;
		border-color: var(--court-500);
	}
	.mt-ta--error {
		border-color: var(--state-error);
	}
	.mt-ta[disabled] {
		opacity: 0.45;
	}
</style>
