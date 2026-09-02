<script lang="ts">
	import FieldShell from './FieldShell.svelte';

	/* Mutually exclusive choice as a frame row — the ClassTimeline weekend/weekday toggle, generalized.
	   Replaces circular radios entirely (circles violate the shape law) and iOS switches (on/off rows
	   are two-option SegmentedControls: ON / OFF, VISIBLE TO FAMILY / INTERNAL). */
	type Option = string | { value: string; label: string };
	let {
		label,
		help,
		error,
		options = [],
		value = $bindable(),
		onchange,
		disabled = false,
		fullWidth = false,
		compact = false,
		name,
		id
	}: {
		label?: string;
		help?: string;
		error?: string;
		/** string[] or {value, label}[] — 2–5 short options */
		options?: Option[];
		value?: string;
		/** Called with the option value */
		onchange?: (value: string) => void;
		disabled?: boolean;
		/** Options stretch to fill the row */
		fullWidth?: boolean;
		/** 40px frames (inside dense cards) instead of 48px */
		compact?: boolean;
		/** When set, a hidden input submits the value with native forms */
		name?: string;
		id?: string;
	} = $props();

	const uid = $props.id();
	const fieldId = $derived(id ?? `mtsg-${uid}`);
	const opts = $derived(options.map((o) => (typeof o === 'object' ? o : { value: o, label: o })));

	function set(v: string) {
		if (disabled) return;
		value = v;
		onchange?.(v);
	}
	function onKey(e: KeyboardEvent) {
		const i = opts.findIndex((o) => o.value === value);
		if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
			e.preventDefault();
			set(opts[(i + 1) % opts.length].value);
		}
		if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
			e.preventDefault();
			set(opts[(i - 1 + opts.length) % opts.length].value);
		}
	}
</script>

<FieldShell id={fieldId} {label} {help} {error} labelAs="span">
	{#snippet children({ describedBy, invalid, labelId })}
		<div
			class="mt-seg"
			class:mt-seg--disabled={disabled}
			role="radiogroup"
			tabindex="-1"
			aria-labelledby={label ? labelId : undefined}
			aria-describedby={describedBy}
			onkeydown={onKey}
		>
			{#each opts as o, i (o.value)}
				{@const on = o.value === value}
				<button
					type="button"
					role="radio"
					aria-checked={on}
					tabindex={on || (value === undefined && i === 0) ? 0 : -1}
					class="mt-seg__opt"
					class:mt-seg__opt--on={on}
					class:mt-seg__opt--error={invalid && !on}
					class:mt-seg__opt--full={fullWidth}
					class:mt-seg__opt--compact={compact}
					{disabled}
					onclick={() => set(o.value)}>{o.label}</button
				>
			{/each}
		</div>
		{#if name}<input type="hidden" {name} value={value ?? ''} />{/if}
	{/snippet}
</FieldShell>

<style>
	.mt-seg {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}
	.mt-seg--disabled {
		opacity: 0.45;
	}
	.mt-seg__opt {
		height: var(--size-action);
		padding: 0 16px;
		flex: none;
		border: 1px solid var(--border-hairline);
		background: transparent;
		cursor: pointer;
		border-radius: var(--radius-none);
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.08em;
		font-weight: var(--weight-regular);
		color: var(--ink);
		text-transform: uppercase;
		transition: background var(--dur-fast) var(--ease-out);
	}
	.mt-seg__opt--on {
		border-color: var(--ink);
		background: var(--court-050);
		font-weight: 600;
	}
	.mt-seg__opt--error {
		border-color: var(--state-error);
	}
	.mt-seg__opt--full {
		flex: 1;
	}
	.mt-seg__opt--compact {
		height: 40px;
	}
	.mt-seg--disabled .mt-seg__opt {
		cursor: default;
	}
</style>
