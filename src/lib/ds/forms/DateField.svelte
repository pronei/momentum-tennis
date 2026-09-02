<script lang="ts">
	import FieldShell from './FieldShell.svelte';

	/* Date input with mono ISO value (2026-09-12) + a popover month grid (the portal calendar pattern).
	   Typing a full ISO date is the primary keyboard path; the grid is arrow-key navigable. */
	let {
		label,
		help,
		error,
		value = $bindable(''),
		onchange,
		disabled = false,
		name,
		id
	}: {
		label?: string;
		help?: string;
		error?: string;
		/** ISO date string YYYY-MM-DD */
		value?: string;
		/** Called with the ISO string on typing or grid pick */
		onchange?: (iso: string) => void;
		disabled?: boolean;
		name?: string;
		id?: string;
	} = $props();

	const MONTHS = [
		'JANUARY',
		'FEBRUARY',
		'MARCH',
		'APRIL',
		'MAY',
		'JUNE',
		'JULY',
		'AUGUST',
		'SEPTEMBER',
		'OCTOBER',
		'NOVEMBER',
		'DECEMBER'
	];
	const iso = (y: number, m: number, d: number) =>
		`${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

	const uid = $props.id();
	const fieldId = $derived(id ?? `mtd-${uid}`);
	let open = $state(false);
	let wrap: HTMLDivElement | undefined = $state();
	let grid: HTMLDivElement | undefined = $state();
	let input: HTMLInputElement | undefined = $state();
	const seed = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(value + 'T12:00:00') : new Date();
	let view = $state({ y: seed.getFullYear(), m: seed.getMonth() });

	const first = $derived(new Date(view.y, view.m, 1).getDay());
	const days = $derived(new Date(view.y, view.m + 1, 0).getDate());
	const cells = $derived([
		...Array<null>(first).fill(null),
		...Array.from({ length: days }, (_, i) => i + 1)
	]);

	function commit(v: string) {
		value = v;
		onchange?.(v);
	}
	function nav(dir: number) {
		const m = view.m + dir;
		view = { y: view.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 };
	}
	function onGridKey(e: KeyboardEvent) {
		const d = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
		if (d === undefined || !grid) return;
		e.preventDefault();
		const btns = [...grid.querySelectorAll<HTMLButtonElement>('button[data-d]')];
		const i = btns.indexOf(document.activeElement as HTMLButtonElement);
		(btns[i + d] ?? btns[i])?.focus();
	}
	$effect(() => {
		if (!open) return;
		const away = (e: MouseEvent) => {
			if (wrap && !wrap.contains(e.target as Node)) open = false;
		};
		const esc = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				open = false;
				input?.focus();
			}
		};
		document.addEventListener('mousedown', away);
		document.addEventListener('keydown', esc);
		return () => {
			document.removeEventListener('mousedown', away);
			document.removeEventListener('keydown', esc);
		};
	});
</script>

<div class="mt-date" bind:this={wrap}>
	<FieldShell id={fieldId} {label} {help} {error}>
		{#snippet children({ describedBy, invalid })}
			<span class="mt-date__wrap">
				<input
					bind:this={input}
					id={fieldId}
					type="text"
					{name}
					placeholder="YYYY-MM-DD"
					maxlength="10"
					{disabled}
					autocomplete="off"
					class="mt-date__input"
					class:mt-date__input--error={invalid}
					value={value ?? ''}
					oninput={(e) => commit(e.currentTarget.value)}
					aria-invalid={invalid || undefined}
					aria-describedby={describedBy}
				/>
				<button
					type="button"
					class="mt-date__toggle"
					aria-label="Choose date"
					aria-expanded={open}
					{disabled}
					onclick={() => (open = !open)}>{open ? '▴' : '▾'}</button
				>
			</span>
			{#if open}
				<div class="mt-date__pop">
					<div class="mt-date__nav">
						<button
							type="button"
							class="mt-date__navbtn"
							aria-label="Previous month"
							onclick={() => nav(-1)}>&#x2190;</button
						>
						<span class="mt-date__month">{MONTHS[view.m]} {view.y}</span>
						<button
							type="button"
							class="mt-date__navbtn"
							aria-label="Next month"
							onclick={() => nav(1)}>&#x2192;</button
						>
					</div>
					<div
						class="mt-date__grid"
						role="grid"
						tabindex="-1"
						bind:this={grid}
						onkeydown={onGridKey}
					>
						{#each ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'] as d (d)}
							<span class="mt-date__dow">{d}</span>
						{/each}
						{#each cells as d, i (i)}
							{#if d === null}
								<span></span>
							{:else}
								{@const v = iso(view.y, view.m, d)}
								<button
									type="button"
									class="mt-date__day"
									class:mt-date__day--sel={v === value}
									data-d={d}
									aria-label={v}
									aria-pressed={v === value}
									onclick={() => {
										commit(v);
										open = false;
										input?.focus();
									}}>{d}</button
								>
							{/if}
						{/each}
					</div>
				</div>
			{/if}
		{/snippet}
	</FieldShell>
</div>

<style>
	.mt-date {
		position: relative;
	}
	.mt-date__wrap {
		position: relative;
		display: block;
	}
	.mt-date__input {
		width: 100%;
		box-sizing: border-box;
		height: var(--size-action);
		padding: 0 58px 0 14px;
		background: var(--white);
		border: 1px solid var(--border-hairline);
		border-radius: var(--radius-none);
		font-family: var(--font-mono);
		font-size: 0.9375rem;
		letter-spacing: 0.04em;
		color: var(--ink);
	}
	.mt-date__input--error {
		border-color: var(--state-error);
	}
	.mt-date__input:focus {
		outline: none;
		border-color: var(--court-500);
	}
	.mt-date__toggle {
		position: absolute;
		right: 1px;
		top: 1px;
		bottom: 1px;
		width: 46px;
		background: var(--court-050);
		border: none;
		border-left: 1px solid var(--border-hairline);
		cursor: pointer;
		font-family: var(--font-mono);
		font-size: 0.625rem;
		color: var(--ink);
	}
	.mt-date__pop {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		z-index: 30;
		background: var(--white);
		border: 1px solid var(--ink);
		padding: var(--space-3);
		width: 308px;
		box-sizing: border-box;
	}
	.mt-date__nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
	}
	.mt-date__navbtn {
		width: 40px;
		height: 36px;
		background: none;
		border: 1px solid var(--border-hairline);
		cursor: pointer;
		font-family: var(--font-mono);
		font-size: var(--size-label);
		color: var(--ink);
		border-radius: var(--radius-none);
	}
	.mt-date__month {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		color: var(--ink);
	}
	.mt-date__grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 2px;
	}
	.mt-date__dow {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		color: var(--text-secondary);
		text-align: center;
		padding: 4px 0;
	}
	.mt-date__day {
		height: 38px;
		background: transparent;
		color: var(--ink);
		border: 1px solid transparent;
		cursor: pointer;
		border-radius: var(--radius-none);
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
	}
	.mt-date__day:hover {
		background: var(--court-050);
	}
	.mt-date__day--sel,
	.mt-date__day--sel:hover {
		background: var(--ink);
		color: var(--line-white);
		border-color: var(--ink);
	}
</style>
