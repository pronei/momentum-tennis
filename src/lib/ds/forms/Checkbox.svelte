<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	/* A frame that fills: hairline square, solid ink when checked — the attendance-strip squares
	   are the precedent (fill-state carries the meaning, not color). consent variant: larger frame +
	   body-copy label, for waiver signing. 44px minimum target. */
	type Props = {
		label?: string | Snippet;
		checked?: boolean;
		/** Large 28px frame + body label — waiver/consent rows */
		consent?: boolean;
		/** Renders "ERROR: <message>" + --state-error frame border */
		error?: string;
		id?: string;
	} & Omit<HTMLInputAttributes, 'checked' | 'type' | 'id'>;

	let {
		label,
		checked = $bindable(false),
		consent = false,
		error,
		id,
		disabled = false,
		...rest
	}: Props = $props();

	const uid = $props.id();
	const fieldId = $derived(id ?? `mtc-${uid}`);
</script>

<div class="mt-check" class:mt-check--consent={consent} class:mt-check--disabled={disabled}>
	<label class="mt-check__row" for={fieldId}>
		<span class="mt-check__box">
			<input
				bind:checked
				id={fieldId}
				type="checkbox"
				class="mt-check-input"
				{disabled}
				aria-invalid={error ? true : undefined}
				aria-describedby={error ? `${fieldId}-err` : undefined}
				{...rest}
			/>
			<span
				class="mt-check-frame"
				class:mt-check-frame--on={checked}
				class:mt-check-frame--error={Boolean(error)}
				aria-hidden="true"
			></span>
		</span>
		{#if label}
			<span class="mt-check__label">
				{#if typeof label === 'string'}{label}{:else}{@render label()}{/if}
			</span>
		{/if}
	</label>
	{#if error}<span class="mt-check__error" id="{fieldId}-err" role="alert">ERROR: {error}</span
		>{/if}
</div>

<style>
	.mt-check {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	.mt-check__row {
		display: flex;
		gap: var(--space-3);
		align-items: flex-start;
		min-height: 44px;
		cursor: pointer;
		padding: 2px 0;
	}
	.mt-check--consent .mt-check__row {
		gap: 14px;
	}
	.mt-check--disabled .mt-check__row {
		cursor: default;
		opacity: 0.45;
	}
	.mt-check__box {
		position: relative;
		flex: none;
		width: 20px;
		height: 20px;
		margin-top: 1px;
	}
	.mt-check--consent .mt-check__box {
		width: 28px;
		height: 28px;
		margin-top: 2px;
	}
	.mt-check-input {
		position: absolute;
		opacity: 0;
		margin: 0;
		width: 100%;
		height: 100%;
		cursor: pointer;
	}
	.mt-check-input[disabled] {
		cursor: default;
	}
	.mt-check-input:focus-visible + .mt-check-frame {
		outline: 2px solid var(--focus-on-light);
		outline-offset: 2px;
	}
	.mt-check-frame {
		position: absolute;
		inset: 0;
		box-sizing: border-box;
		border: 1px solid rgba(27, 27, 27, 0.4);
		background: var(--white);
		transition: background var(--dur-fast) var(--ease-out);
	}
	.mt-check-frame--on {
		border-color: var(--ink);
		background: var(--ink);
	}
	.mt-check-frame--error {
		border-color: var(--state-error);
	}
	.mt-check__label {
		font-family: var(--font-sans);
		font-size: var(--size-body-sm);
		line-height: 1.5;
		color: var(--ink);
		align-self: center;
	}
	.mt-check--consent .mt-check__label {
		line-height: var(--leading-body);
		align-self: auto;
	}
	.mt-check__error {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		line-height: 1.5;
		letter-spacing: 0.04em;
		color: var(--state-error);
		text-transform: uppercase;
	}
</style>
