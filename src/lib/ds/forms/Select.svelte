<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import FieldShell from './FieldShell.svelte';

	/* Styled native select. Square, hairline, mono ▾ affordance matching the nav dropdown. */
	type Option = string | { value: string; label: string };
	type Props = {
		label?: string;
		help?: string;
		error?: string;
		options?: Option[];
		/** Disabled empty first option */
		placeholder?: string;
		value?: string;
		id?: string;
	} & Omit<HTMLSelectAttributes, 'value' | 'id'>;

	let {
		label,
		help,
		error,
		options = [],
		placeholder,
		value = $bindable(''),
		id,
		disabled = false,
		...rest
	}: Props = $props();

	const uid = $props.id();
	const fieldId = $derived(id ?? `mts-${uid}`);
	const opts = $derived(options.map((o) => (typeof o === 'object' ? o : { value: o, label: o })));
</script>

<FieldShell id={fieldId} {label} {help} {error}>
	{#snippet children({ describedBy, invalid })}
		<span class="mt-select-wrap">
			<select
				bind:value
				id={fieldId}
				class="mt-select"
				class:mt-select--error={invalid}
				{disabled}
				aria-invalid={invalid || undefined}
				aria-describedby={describedBy}
				{...rest}
			>
				{#if placeholder}<option value="" disabled>{placeholder}</option>{/if}
				{#each opts as o (o.value)}
					<option value={o.value}>{o.label}</option>
				{/each}
			</select>
			<span class="mt-select__caret" class:mt-select__caret--disabled={disabled} aria-hidden="true"
				>&#x25BE;</span
			>
		</span>
	{/snippet}
</FieldShell>

<style>
	.mt-select-wrap {
		position: relative;
		display: block;
	}
	.mt-select {
		appearance: none;
		-webkit-appearance: none;
		width: 100%;
		box-sizing: border-box;
		height: var(--size-action);
		padding: 0 40px 0 14px;
		background: var(--white);
		border: 1px solid var(--border-hairline);
		border-radius: var(--radius-none);
		font-family: var(--font-sans);
		font-size: var(--size-body);
		color: var(--ink);
		cursor: pointer;
		transition: border-color var(--dur-fast) var(--ease-out);
	}
	.mt-select:hover {
		border-color: var(--court-300);
	}
	.mt-select:focus {
		outline: none;
		border-color: var(--court-500);
	}
	.mt-select--error {
		border-color: var(--state-error);
	}
	.mt-select[disabled] {
		opacity: 0.45;
		cursor: default;
	}
	.mt-select__caret {
		position: absolute;
		right: 14px;
		top: 50%;
		transform: translateY(-50%);
		font-family: var(--font-mono);
		font-size: 0.625rem;
		color: var(--ink);
		pointer-events: none;
	}
	.mt-select__caret--disabled {
		color: var(--text-secondary);
	}
</style>
