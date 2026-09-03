<script lang="ts">
	import type { Snippet } from 'svelte';
	import EmptyState from '../feedback/EmptyState.svelte';

	/* Admin table: tracked-caps header, hairline row rules, court-050 hover, mono right-aligned
	   numerics, typographic sort with aria-sort, empty state. ≤760px the rows collapse to stacked
	   hairline cards — both are in the markup and CSS chooses, so the collapse survives SSR.
	   Sorting and paging are LINKS: an admin list has to work with JavaScript off. */
	type Row = Record<string, unknown>;
	export type Column = {
		key: string;
		label: string;
		/** Right-aligned mono */
		numeric?: boolean;
		/** Mono without right alignment (dates, refs) */
		mono?: boolean;
		sortable?: boolean;
	};

	let {
		columns = [],
		rows = [],
		sort,
		sortHref,
		page = 1,
		pages = 1,
		pageHref,
		empty = 'NO ROWS',
		mobileTitleKey,
		rowHref,
		cell
	}: {
		columns?: Column[];
		rows?: Row[];
		sort?: { key: string; dir: 'asc' | 'desc' };
		/** Header link target for a sortable column */
		sortHref?: (key: string, dir: 'asc' | 'desc') => string;
		page?: number;
		pages?: number;
		pageHref?: (page: number) => string;
		/** Mono empty-state line */
		empty?: string;
		/** Column key used as the card title in the ≤760px collapse (default: first column) */
		mobileTitleKey?: string;
		rowHref?: (row: Row) => string;
		/** Custom cell body; falls back to the raw value */
		cell?: Snippet<[Row, Column]>;
	} = $props();

	const titleKey = $derived(mobileTitleKey ?? columns[0]?.key);
	const nextDir = (key: string): 'asc' | 'desc' =>
		sort?.key === key && sort.dir === 'asc' ? 'desc' : 'asc';
	const ariaSort = (key: string) =>
		sort?.key === key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined;
	const value = (row: Row, column: Column) => String(row[column.key] ?? '');
	const pad = (n: number) => String(n).padStart(2, '0');
</script>

<div class="mt-dt">
	<table class="mt-dt__table">
		<thead>
			<tr>
				{#each columns as c (c.key)}
					<th class="mt-dt__th" class:mt-dt__th--num={c.numeric} aria-sort={ariaSort(c.key)}>
						{#if c.sortable && sortHref}
							<a class="mt-dt__sort" href={sortHref(c.key, nextDir(c.key))}
								>{c.label}<span class="mt-dt__caret" class:mt-dt__caret--on={sort?.key === c.key}
									>{sort?.key === c.key ? (sort.dir === 'asc' ? '▲' : '▼') : '▲▼'}</span
								></a
							>
						{:else}
							<span class="mt-dt__label">{c.label}</span>
						{/if}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each rows as row, i (i)}
				<tr class="mt-dt__row">
					{#each columns as c (c.key)}
						<td
							class="mt-dt__cell"
							class:mt-dt__cell--num={c.numeric}
							class:mt-dt__cell--mono={c.mono}
						>
							{#if cell}{@render cell(row, c)}{:else if rowHref && c.key === titleKey}
								<a class="mt-dt__link" href={rowHref(row)}>{value(row, c)}</a>
							{:else}{value(row, c)}{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>

	<div class="mt-dt__cards">
		{#each rows as row, i (i)}
			<div class="mt-dt__card">
				<div class="mt-dt__card-title">
					{#if rowHref}<a class="mt-dt__link" href={rowHref(row)}>{String(row[titleKey] ?? '')}</a
						>{:else}{String(row[titleKey] ?? '')}{/if}
				</div>
				<div class="mt-dt__card-grid">
					{#each columns.filter((c) => c.key !== titleKey) as c (c.key)}
						<span class="mt-dt__card-label">{c.label}</span>
						<span class="mt-dt__card-value" class:mt-dt__cell--mono={c.numeric || c.mono}>
							{#if cell}{@render cell(row, c)}{:else}{value(row, c)}{/if}
						</span>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	{#if rows.length === 0}
		<EmptyState>{empty}</EmptyState>
	{/if}

	{#if pages > 1 && pageHref}
		<nav class="mt-dt__pager" aria-label="Pagination">
			{#if page > 1}<a class="mt-dt__pager-btn" href={pageHref(page - 1)} aria-label="Previous page"
					>&#x2190;</a
				>{:else}<span class="mt-dt__pager-btn mt-dt__pager-btn--off" aria-hidden="true"
					>&#x2190;</span
				>{/if}
			<span class="mt-dt__pager-count">{pad(page)} / {pad(pages)}</span>
			{#if page < pages}<a class="mt-dt__pager-btn" href={pageHref(page + 1)} aria-label="Next page"
					>&#x2192;</a
				>{:else}<span class="mt-dt__pager-btn mt-dt__pager-btn--off" aria-hidden="true"
					>&#x2192;</span
				>{/if}
		</nav>
	{/if}
</div>

<style>
	.mt-dt__table {
		width: 100%;
		border-collapse: collapse;
	}
	.mt-dt__th {
		text-align: left;
		padding: 10px 12px;
		border-bottom: var(--hairline);
		white-space: nowrap;
	}
	.mt-dt__th--num {
		text-align: right;
	}
	.mt-dt__label,
	.mt-dt__sort {
		font-family: var(--font-sans);
		font-size: var(--size-label-sm);
		font-weight: var(--weight-bold);
		letter-spacing: var(--track-label);
		text-transform: uppercase;
		color: var(--text-secondary);
		text-decoration: none;
		white-space: nowrap;
	}
	.mt-dt__caret {
		font-family: var(--font-mono);
		font-size: 0.5625rem;
		margin-left: 6px;
		opacity: 0.35;
	}
	.mt-dt__caret--on {
		opacity: 1;
	}
	.mt-dt__row {
		border-bottom: var(--hairline);
		transition: background var(--dur-fast) var(--ease-out);
	}
	.mt-dt__row:hover {
		background: var(--court-050);
	}
	.mt-dt__cell {
		padding: 12px 12px;
		font-family: var(--font-sans);
		font-size: var(--size-body-sm);
		color: var(--ink);
		white-space: nowrap;
	}
	.mt-dt__cell--num {
		text-align: right;
		font-family: var(--font-mono);
		font-size: 0.8125rem;
	}
	.mt-dt__cell--mono {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
	}
	.mt-dt__link {
		color: var(--link);
	}
	.mt-dt__cards {
		display: none;
		flex-direction: column;
		gap: var(--space-3);
	}
	.mt-dt__card {
		background: var(--surface-card);
		border: var(--hairline);
		padding: 14px 16px;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	.mt-dt__card-title {
		font-family: var(--font-sans);
		font-size: var(--size-body-sm);
		font-weight: var(--weight-medium);
		color: var(--ink);
	}
	.mt-dt__card-grid {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 4px 16px;
	}
	.mt-dt__card-label {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--text-secondary);
		padding-top: 2px;
	}
	.mt-dt__card-value {
		font-family: var(--font-sans);
		font-size: 0.8125rem;
		color: var(--ink);
	}
	.mt-dt__pager {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: var(--space-2);
		padding-top: var(--space-2);
	}
	.mt-dt__pager-btn {
		width: 44px;
		height: 44px;
		display: grid;
		place-items: center;
		font-family: var(--font-mono);
		font-size: 0.9375rem;
		color: var(--ink);
		text-decoration: none;
	}
	.mt-dt__pager-btn--off {
		opacity: 0.35;
	}
	.mt-dt__pager-count {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		color: var(--text-secondary);
	}
	@media (max-width: 760px) {
		.mt-dt__table {
			display: none;
		}
		.mt-dt__cards {
			display: flex;
		}
	}
</style>
