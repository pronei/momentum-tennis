<script lang="ts">
	import { FieldShell } from '$lib/ds';

	/* A typed name with the roster as suggestions: a native datalist, so a match-day substitute
	   who is not on the roster can still be entered, and nothing needs JavaScript. The shared
	   anatomy comes from FieldShell; the box matches TextField's without the ball caret.
	   A composite until the design system exports a NameField (docs/design-handoffs). */
	let {
		label,
		help,
		error,
		name,
		value = '',
		suggestions = [],
		disabled = false,
		id
	}: {
		label: string;
		help?: string;
		error?: string;
		name: string;
		value?: string;
		suggestions?: string[];
		disabled?: boolean;
		id?: string;
	} = $props();
	const uid = $props.id();
	const fieldId = $derived(id ?? `mtn-${uid}`);
	const listId = $derived(`${fieldId}-list`);
</script>

<FieldShell id={fieldId} {label} {help} {error}>
	{#snippet children({ describedBy, invalid })}
		<input
			id={fieldId}
			{name}
			{value}
			{disabled}
			type="text"
			class="nf__input"
			class:nf__input--error={invalid}
			autocomplete="off"
			list={suggestions.length ? listId : undefined}
			aria-invalid={invalid || undefined}
			aria-describedby={describedBy}
		/>
		{#if suggestions.length}
			<datalist id={listId}>
				{#each suggestions as s (s)}<option value={s}></option>{/each}
			</datalist>
		{/if}
	{/snippet}
</FieldShell>

<style>
	.nf__input {
		width: 100%;
		box-sizing: border-box;
		height: var(--size-action);
		padding: 0 var(--space-3);
		background: var(--white);
		border: var(--hairline);
		border-radius: var(--radius-none);
		font-family: var(--font-sans);
		font-size: var(--size-body);
		color: var(--ink);
	}
	.nf__input:focus {
		outline: none;
		border-color: var(--court-500);
	}
	.nf__input--error {
		border-color: var(--state-error);
	}
	.nf__input[disabled] {
		opacity: 0.45;
	}
</style>
