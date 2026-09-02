<script lang="ts">
	/* Mono 01 / 04 with typographic ghost prev/next. 44px targets, ends disabled. */
	let {
		page = 1,
		pages = 1,
		onchange
	}: { page?: number; pages?: number; onchange?: (page: number) => void } = $props();
	const pad = (n: number) => String(n).padStart(2, '0');
</script>

<nav class="mt-pager" aria-label="Pagination">
	<button
		type="button"
		class="mt-pager__btn"
		aria-label="Previous page"
		disabled={page <= 1}
		onclick={() => onchange?.(page - 1)}>&#x2190;</button
	>
	<span class="mt-pager__count" aria-live="polite">{pad(page)} / {pad(pages)}</span>
	<button
		type="button"
		class="mt-pager__btn"
		aria-label="Next page"
		disabled={page >= pages}
		onclick={() => onchange?.(page + 1)}>&#x2192;</button
	>
</nav>

<style>
	.mt-pager {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}
	.mt-pager__btn {
		width: 44px;
		height: 44px;
		background: none;
		border: none;
		cursor: pointer;
		font-family: var(--font-mono);
		font-size: 0.9375rem;
		color: var(--ink);
		border-radius: var(--radius-none);
	}
	.mt-pager__btn[disabled] {
		cursor: default;
		opacity: 0.35;
	}
	.mt-pager__count {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		color: var(--text-secondary);
	}
</style>
