<script lang="ts">
	import { FieldShell } from '$lib/ds';

	/* One games box of a score line: a square mono digit, 0–7, the numeric keypad on a phone.
	   A composite until the design system exports a ScoreBox (docs/design-handoffs). */
	let {
		label,
		error,
		name,
		value = '',
		disabled = false,
		id
	}: {
		label: string;
		error?: string;
		name: string;
		value?: string;
		disabled?: boolean;
		id?: string;
	} = $props();
	const uid = $props.id();
	const fieldId = $derived(id ?? `mtsc-${uid}`);
</script>

<FieldShell id={fieldId} {label} {error}>
	{#snippet children({ describedBy, invalid })}
		<input
			id={fieldId}
			{name}
			{value}
			{disabled}
			type="text"
			inputmode="numeric"
			pattern="[0-7]"
			maxlength={1}
			class="sf__input"
			class:sf__input--error={invalid}
			autocomplete="off"
			aria-invalid={invalid || undefined}
			aria-describedby={describedBy}
		/>
	{/snippet}
</FieldShell>

<style>
	.sf__input {
		width: var(--size-action);
		height: var(--size-action);
		box-sizing: border-box;
		padding: 0;
		text-align: center;
		background: var(--white);
		border: var(--hairline);
		border-radius: var(--radius-none);
		font-family: var(--font-mono);
		font-size: var(--size-body-lg);
		color: var(--ink);
	}
	.sf__input:focus {
		outline: none;
		border-color: var(--court-500);
	}
	.sf__input--error {
		border-color: var(--state-error);
	}
	.sf__input[disabled] {
		opacity: 0.45;
	}
</style>
