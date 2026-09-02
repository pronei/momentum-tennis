<script lang="ts">
	import type { Snippet } from 'svelte';

	/* Inline square hairline strip with a mono prefix (ERROR: / NOTE:) — form-level and page-level
	   states. Errors are dual-channel by construction: the color AND the prefix. */
	let {
		tone = 'note',
		onField = false,
		action,
		children
	}: {
		tone?: 'note' | 'error';
		/** On court-navy fields */
		onField?: boolean;
		/** Optional right-aligned action (a Button) */
		action?: Snippet;
		children?: Snippet;
	} = $props();
	const err = $derived(tone === 'error');
</script>

<div
	class="mt-banner"
	class:mt-banner--error={err}
	class:mt-banner--field={onField}
	role={err ? 'alert' : 'status'}
>
	<span class="mt-banner__text"><b>{err ? 'ERROR: ' : 'NOTE: '}</b>{@render children?.()}</span>
	{#if action}<span class="mt-banner__action">{@render action()}</span>{/if}
</div>

<style>
	.mt-banner {
		display: flex;
		gap: var(--space-4);
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		padding: 12px 16px;
		background: var(--white);
		border: 1px solid var(--border-hairline);
	}
	.mt-banner--field {
		background: transparent;
		border-color: var(--border-on-field);
	}
	.mt-banner--error {
		border-color: var(--state-error);
	}
	.mt-banner__text {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		line-height: 1.6;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}
	.mt-banner--field .mt-banner__text {
		color: var(--text-on-field-dim);
	}
	.mt-banner--error .mt-banner__text {
		color: var(--state-error);
	}
	.mt-banner__text b {
		font-weight: 600;
	}
	.mt-banner__action {
		flex: none;
	}
</style>
