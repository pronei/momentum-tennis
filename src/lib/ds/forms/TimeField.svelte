<script lang="ts">
	import FieldShell from './FieldShell.svelte';

	/* Time input: mono 24h value (16:00). Arrow keys step ±step minutes; ▾ opens a slot list (court hours). */
	let {
		label,
		help,
		error,
		value = $bindable(''),
		onchange,
		step = 15,
		listStep = 30,
		from = '07:00',
		to = '21:00',
		disabled = false,
		name,
		id
	}: {
		label?: string;
		help?: string;
		error?: string;
		/** HH:MM 24h */
		value?: string;
		onchange?: (hhmm: string) => void;
		/** Arrow-key step in minutes */
		step?: number;
		/** Slot-list step in minutes */
		listStep?: number;
		/** Slot-list bounds */
		from?: string;
		to?: string;
		disabled?: boolean;
		name?: string;
		id?: string;
	} = $props();

	const pad = (n: number) => String(n).padStart(2, '0');
	const toMin = (s: string) => {
		const m = /^(\d{1,2}):(\d{2})$/.exec(s ?? '');
		return m ? Number(m[1]) * 60 + Number(m[2]) : null;
	};
	const toStr = (mi: number) => {
		const t = ((mi % 1440) + 1440) % 1440;
		return `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;
	};

	const uid = $props.id();
	const fieldId = $derived(id ?? `mtt-${uid}`);
	let open = $state(false);
	let wrap: HTMLDivElement | undefined = $state();
	let input: HTMLInputElement | undefined = $state();
	const slots = $derived.by(() => {
		const a = toMin(from) ?? 0;
		const b = toMin(to) ?? 0;
		const out: string[] = [];
		for (let t = a; t <= b; t += listStep) out.push(toStr(t));
		return out;
	});

	function commit(v: string) {
		value = v;
		onchange?.(v);
	}
	function onKey(e: KeyboardEvent) {
		if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
		const m = toMin(value);
		if (m === null) return;
		e.preventDefault();
		commit(toStr(m + (e.key === 'ArrowUp' ? step : -step)));
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

<div class="mt-time" bind:this={wrap}>
	<FieldShell id={fieldId} {label} {help} {error}>
		{#snippet children({ describedBy, invalid })}
			<span class="mt-time__wrap">
				<input
					bind:this={input}
					id={fieldId}
					type="text"
					{name}
					placeholder="HH:MM"
					maxlength="5"
					{disabled}
					autocomplete="off"
					class="mt-time__input"
					class:mt-time__input--error={invalid}
					value={value ?? ''}
					oninput={(e) => commit(e.currentTarget.value)}
					onkeydown={onKey}
					aria-invalid={invalid || undefined}
					aria-describedby={describedBy}
				/>
				<button
					type="button"
					class="mt-time__toggle"
					aria-label="Choose time"
					aria-expanded={open}
					{disabled}
					onclick={() => (open = !open)}>{open ? '▴' : '▾'}</button
				>
			</span>
			{#if open}
				<div class="mt-time__list" role="listbox" aria-label="Times">
					{#each slots as t (t)}
						<button
							type="button"
							role="option"
							class="mt-time__slot"
							class:mt-time__slot--sel={t === value}
							aria-selected={t === value}
							onclick={() => {
								commit(t);
								open = false;
								input?.focus();
							}}>{t}</button
						>
					{/each}
				</div>
			{/if}
		{/snippet}
	</FieldShell>
</div>

<style>
	.mt-time {
		position: relative;
	}
	.mt-time__wrap {
		position: relative;
		display: block;
	}
	.mt-time__input {
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
	.mt-time__input--error {
		border-color: var(--state-error);
	}
	.mt-time__input:focus {
		outline: none;
		border-color: var(--court-500);
	}
	.mt-time__toggle {
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
	.mt-time__list {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		z-index: 30;
		background: var(--white);
		border: 1px solid var(--ink);
		max-height: 216px;
		overflow-y: auto;
	}
	.mt-time__slot {
		display: block;
		width: 100%;
		text-align: left;
		padding: 11px 14px;
		background: transparent;
		color: var(--ink);
		border: none;
		cursor: pointer;
		font-family: var(--font-mono);
		font-size: var(--size-label);
		border-radius: var(--radius-none);
	}
	.mt-time__slot:hover {
		background: var(--court-050);
	}
	.mt-time__slot--sel,
	.mt-time__slot--sel:hover {
		background: var(--ink);
		color: var(--line-white);
	}
</style>
