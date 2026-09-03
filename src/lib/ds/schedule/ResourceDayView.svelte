<script lang="ts">
	import SegmentedControl from '../forms/SegmentedControl.svelte';

	/* The admin day grid: one column per court, hour rows, session blocks colored by type from the
	   cool ramp with ink text. Amber is reserved for the current-time line and NOTHING else.
	   States: cancelled (dimmed + struck mono label), draft ghost frame (the drag-to-create
	   stand-in: click an empty slot) and the conflict rejection — a mono ERROR line. The database
	   enforces conflicts; this shows the refusal well.

	   ≤760px the reference switches to a single court with a Select. This port scrolls the whole
	   grid horizontally instead: an admin standing courtside keeps every column, and it needs no
	   JavaScript to see them. */
	type SessionBlock = {
		id: string;
		court: string;
		location?: string;
		start: string;
		end: string;
		type: 'camp' | 'class' | 'team' | 'private';
		title: string;
		coach?: string;
		cancelled?: boolean;
	};
	type Option = string | { value: string; label: string };

	let {
		date = '',
		location,
		locations = [],
		onLocationChange,
		courts = [],
		sessions = [],
		draft,
		nowTime,
		onSessionClick,
		sessionHref,
		onSlotClick,
		startHour = 7,
		endHour = 21,
		rowH = 44
	}: {
		/** Mono date heading, e.g. "2026-09-12 · SATURDAY" */
		date?: string;
		location?: string;
		locations?: Option[];
		onLocationChange?: (location: string) => void;
		courts?: { id: string; label: string; location?: string }[];
		sessions?: SessionBlock[];
		/** Ghost frame; a conflict message turns it into the rejection state */
		draft?: { court: string; start: string; end: string; conflict?: string };
		/** HH:MM — draws the amber now line */
		nowTime?: string;
		onSessionClick?: (session: SessionBlock) => void;
		/** Renders each block as a link instead of a button — the no-JavaScript path */
		sessionHref?: (session: SessionBlock) => string;
		/** Click empty grid space → (courtId, "HH:MM" rounded to 30) */
		onSlotClick?: (courtId: string, start: string) => void;
		startHour?: number;
		endHour?: number;
		/** Pixels per hour */
		rowH?: number;
	} = $props();

	const toMin = (s: string | undefined): number | null => {
		const m = /^(\d{1,2}):(\d{2})$/.exec(s ?? '');
		return m ? Number(m[1]) * 60 + Number(m[2]) : null;
	};
	const y = (t: string) => {
		const mi = toMin(t);
		return mi === null ? 0 : ((mi - startHour * 60) / 60) * rowH;
	};
	const height = (start: string, end: string) => Math.max(20, y(end) - y(start) - 2);

	const shown = $derived(courts.filter((c) => !c.location || c.location === location));
	const hours = $derived(Array.from({ length: endHour - startHour }, (_, i) => i));
	const gridHeight = $derived((endHour - startHour) * rowH);
	const nowMin = $derived(toMin(nowTime));
	const showNow = $derived(
		nowMin !== null && nowMin >= startHour * 60 && nowMin <= endHour * 60 && nowTime
	);
	const pad = (n: number) => String(n).padStart(2, '0');

	function slotClick(courtId: string, event: MouseEvent) {
		if (!onSlotClick || event.target !== event.currentTarget) return;
		const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const mins = startHour * 60 + Math.floor((((event.clientY - box.top) / rowH) * 60) / 30) * 30;
		onSlotClick(courtId, `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`);
	}

	const LEGEND = [
		['camp', 'CAMP'],
		['class', 'CLASS'],
		['team', 'TEAM'],
		['private', 'PRIVATE']
	] as const;
</script>

<div class="mt-rdv">
	<div class="mt-rdv__head">
		<span class="mt-rdv__date">{date}</span>
		{#if locations.length > 1}
			<SegmentedControl
				compact
				options={locations}
				value={location}
				onchange={(v) => onLocationChange?.(v)}
			/>
		{/if}
	</div>

	<div class="mt-rdv__scroll">
		<div
			class="mt-rdv__grid"
			style="--cols:{shown.length}; --row-h:{rowH}px; --grid-h:{gridHeight}px"
		>
			<div></div>
			{#each shown as c (c.id)}
				<div class="mt-rdv__court">{c.label}</div>
			{/each}

			<div class="mt-rdv__hours">
				{#each hours as i (i)}
					{#if i > 0}
						<span class="mt-rdv__hour" style="--top:{i * rowH}px">{pad(startHour + i)}:00</span>
					{/if}
				{/each}
			</div>

			{#each shown as c, ci (c.id)}
				<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
				<div
					class="mt-rdv__col"
					class:mt-rdv__col--placing={onSlotClick}
					data-court={c.id}
					onclick={(e) => slotClick(c.id, e)}
				>
					{#each sessions.filter((s) => s.court === c.id && (!s.location || s.location === location)) as s (s.id)}
						<svelte:element
							this={sessionHref ? 'a' : 'button'}
							href={sessionHref?.(s)}
							type={sessionHref ? undefined : 'button'}
							class="mt-rdv__block mt-rdv__block--{s.type}"
							class:mt-rdv__block--cancelled={s.cancelled}
							data-session={s.id}
							style="--top:{y(s.start)}px; --height:{height(s.start, s.end)}px"
							aria-label="{s.cancelled ? 'Cancelled: ' : ''}{s.title} {s.start}–{s.end}"
							onclick={() => onSessionClick?.(s)}
						>
							<span class="mt-rdv__time">{s.start}–{s.end}{s.cancelled ? ' · CANCELLED' : ''}</span>
							<span class="mt-rdv__title">{s.title}</span>
							{#if s.coach && height(s.start, s.end) > 52}
								<span class="mt-rdv__coach">{s.coach}</span>
							{/if}
						</svelte:element>
					{/each}

					{#if draft && draft.court === c.id}
						<div
							class="mt-rdv__ghost"
							class:mt-rdv__ghost--conflict={draft.conflict}
							style="--top:{y(draft.start)}px; --height:{height(draft.start, draft.end)}px"
						>
							<span class="mt-rdv__time">NEW · {draft.start}–{draft.end}</span>
							{#if draft.conflict}
								<span class="mt-rdv__error" role="alert">ERROR: {draft.conflict}</span>
							{/if}
						</div>
					{/if}

					{#if showNow}
						<div class="mt-rdv__now" style="--top:{y(nowTime!)}px" aria-hidden="true">
							{#if ci === shown.length - 1}
								<span class="mt-rdv__now-label">NOW {nowTime}</span>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<div class="mt-rdv__legend">
		{#each LEGEND as [key, label] (key)}
			<span class="mt-rdv__key"
				><span class="mt-rdv__swatch mt-rdv__block--{key}"></span>{label}</span
			>
		{/each}
		<span class="mt-rdv__key"><span class="mt-rdv__swatch mt-rdv__swatch--now"></span>NOW</span>
	</div>
</div>

<style>
	.mt-rdv__head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-4);
		flex-wrap: wrap;
		margin-bottom: 14px;
	}
	.mt-rdv__date {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--ink);
	}
	.mt-rdv__scroll {
		overflow-x: auto;
	}
	.mt-rdv__grid {
		display: grid;
		grid-template-columns: 56px repeat(var(--cols), minmax(120px, 1fr));
		border: var(--hairline);
		background: var(--surface-card);
	}
	.mt-rdv__court {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--ink);
		text-align: center;
		padding: 10px 4px;
		border-left: var(--hairline);
		border-bottom: var(--hairline);
	}
	.mt-rdv__hours {
		position: relative;
		height: var(--grid-h);
	}
	.mt-rdv__hour {
		position: absolute;
		top: var(--top);
		right: 6px;
		transform: translateY(-6px);
		font-family: var(--font-mono);
		font-size: 0.625rem;
		letter-spacing: 0.05em;
		color: var(--text-secondary);
	}
	.mt-rdv__col {
		position: relative;
		height: var(--grid-h);
		border-left: var(--hairline);
		background-image: repeating-linear-gradient(
			to bottom,
			transparent 0,
			transparent calc(var(--row-h) - 1px),
			var(--border-hairline) calc(var(--row-h) - 1px),
			var(--border-hairline) var(--row-h)
		);
	}
	.mt-rdv__col--placing {
		cursor: copy;
	}
	.mt-rdv__block,
	.mt-rdv__ghost {
		position: absolute;
		left: 3px;
		right: 3px;
		top: var(--top);
		height: var(--height);
		box-sizing: border-box;
		text-align: left;
		overflow: hidden;
		border-radius: var(--radius-none);
		padding: 5px 8px;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.mt-rdv__block {
		border: 1px solid rgba(27, 27, 27, 0.22);
		cursor: pointer;
		text-decoration: none;
	}
	.mt-rdv__block--camp {
		background: var(--court-050);
	}
	.mt-rdv__block--class {
		background: var(--court-100);
	}
	.mt-rdv__block--team {
		background: var(--court-200);
	}
	.mt-rdv__block--private {
		background: var(--court-300);
	}
	.mt-rdv__block--cancelled {
		background: transparent;
		border: var(--hairline);
		opacity: 0.6;
	}
	.mt-rdv__block--cancelled .mt-rdv__time,
	.mt-rdv__block--cancelled .mt-rdv__title {
		text-decoration: line-through;
		color: var(--text-secondary);
	}
	.mt-rdv__ghost {
		border: 1px solid var(--ink);
		background: transparent;
		z-index: 2;
	}
	.mt-rdv__ghost--conflict {
		border-color: var(--state-error);
	}
	.mt-rdv__time,
	.mt-rdv__coach,
	.mt-rdv__error {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}
	.mt-rdv__time {
		color: var(--ink);
	}
	.mt-rdv__coach {
		color: var(--text-secondary);
	}
	.mt-rdv__error {
		color: var(--state-error);
		line-height: 1.4;
	}
	.mt-rdv__title {
		font-family: var(--font-sans);
		font-size: 0.78rem;
		font-weight: var(--weight-medium);
		color: var(--ink);
		line-height: 1.2;
	}
	.mt-rdv__now {
		position: absolute;
		left: 0;
		right: 0;
		top: var(--top);
		height: 2px;
		background: var(--now);
		z-index: 3;
	}
	.mt-rdv__now-label {
		position: absolute;
		right: 2px;
		top: -14px;
		font-family: var(--font-mono);
		font-size: 0.5625rem;
		letter-spacing: 0.05em;
		color: var(--accent-present-hover);
	}
	.mt-rdv__legend {
		display: flex;
		gap: 18px;
		flex-wrap: wrap;
		margin-top: 10px;
	}
	.mt-rdv__key {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: 0.625rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}
	.mt-rdv__swatch {
		width: 8px;
		height: 8px;
		border: 1px solid rgba(27, 27, 27, 0.22);
	}
	.mt-rdv__swatch--now {
		height: 2px;
		background: var(--now);
		border: none;
	}
</style>
