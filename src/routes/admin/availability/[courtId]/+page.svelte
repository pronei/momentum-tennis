<script lang="ts">
	import { resolve } from '$app/paths';
	import { superForm } from 'sveltekit-superforms';
	import {
		Banner,
		Button,
		Checkbox,
		DataTable,
		EmptyState,
		Eyebrow,
		FormSection,
		Select,
		TextField,
		TimeField
	} from '$lib/ds';

	let { data, form: action } = $props();
	// superforms takes the initial form value by design
	// svelte-ignore state_referenced_locally
	const {
		form: win,
		errors: winErrors,
		enhance: winEnhance,
		message: winMessage
	} = superForm(data.windowForm, { id: 'window', resetForm: false });
	// svelte-ignore state_referenced_locally
	const {
		form: exc,
		errors: excErrors,
		enhance: excEnhance,
		message: excMessage
	} = superForm(data.exceptionForm, { id: 'exception', resetForm: false });

	const WEEKDAYS = [
		{ value: '1', label: 'Monday' },
		{ value: '2', label: 'Tuesday' },
		{ value: '3', label: 'Wednesday' },
		{ value: '4', label: 'Thursday' },
		{ value: '5', label: 'Friday' },
		{ value: '6', label: 'Saturday' },
		{ value: '7', label: 'Sunday' }
	];
	const SLOTS = [30, 45, 60, 90, 120].map((m) => ({ value: String(m), label: `${m} min` }));

	const windowColumns = [
		{ key: 'day', label: 'Day', mono: true },
		{ key: 'hours', label: 'Hours', mono: true },
		{ key: 'from', label: 'From', mono: true },
		{ key: 'until', label: 'Until', mono: true },
		{ key: 'lessons', label: 'Lessons', mono: true },
		{ key: 'ref', label: 'Reference', mono: true },
		{ key: 'end', label: '' }
	];
	const windowRows = $derived(
		data.windows.map((w) => ({
			id: w.id,
			day: WEEKDAYS[w.weekday - 1].label.slice(0, 3).toUpperCase(),
			hours: `${w.openLocal}–${w.closeLocal}`,
			from: w.effectiveFrom,
			until: w.effectiveTo ?? 'OPEN',
			lessons: w.lessonBookable ? 'YES' : 'NO',
			ref: w.reservationRef ?? '—',
			end: ''
		}))
	);
</script>

<svelte:head><title>{data.court.name} · Availability</title></svelte:head>

<div class="cav">
	<div>
		<Eyebrow ticks>{data.location.name}</Eyebrow>
		<h2 class="cav__title">{data.court.name}</h2>
		<a class="cav__back" href={resolve('/admin/availability')}>All courts</a>
	</div>

	{#if data.loadError}<Banner tone="error">{data.loadError}</Banner>{/if}
	{#if action?.windowError}<Banner tone="error">{action.windowError}</Banner>{/if}
	{#if action?.exceptionError}<Banner tone="error">{action.exceptionError}</Banner>{/if}

	<section>
		<Eyebrow>Recurring windows</Eyebrow>
		{#if data.windows.length === 0}
			<EmptyState>NO RESERVATIONS DECLARED — NOTHING CAN BE SCHEDULED HERE YET</EmptyState>
		{:else}
			<DataTable columns={windowColumns} rows={windowRows} mobileTitleKey="day">
				{#snippet cell(row, column)}
					{#if column.key === 'end'}
						<form method="POST" action="?/end">
							<input type="hidden" name="windowId" value={row.id} />
							<input type="hidden" name="on" value={data.today} />
							<Button variant="ghost" size="sm" type="submit">End today</Button>
						</form>
					{:else}{String(row[column.key] ?? '')}{/if}
				{/snippet}
			</DataTable>
		{/if}
	</section>

	<form method="POST" action="?/window" use:winEnhance>
		<FormSection
			eyebrow="Declare a reservation"
			description="The hours the academy holds this court, week after week."
		>
			{#if $winMessage}<Banner>{$winMessage}</Banner>{/if}
			{#if $winErrors._errors?.length}<Banner tone="error">{$winErrors._errors[0]}</Banner>{/if}
			<input type="hidden" name="courtId" value={$win.courtId} />
			<div class="cav__grid">
				<Select
					label="Weekday"
					name="weekday"
					options={WEEKDAYS}
					bind:value={$win.weekday as unknown as string}
					error={$winErrors.weekday?.[0]}
				/>
				<TimeField
					label="Opens"
					name="openLocal"
					bind:value={$win.openLocal}
					error={$winErrors.openLocal?.[0]}
				/>
				<TimeField
					label="Closes"
					name="closeLocal"
					bind:value={$win.closeLocal}
					error={$winErrors.closeLocal?.[0]}
				/>
				<TextField
					label="From"
					name="effectiveFrom"
					bind:value={$win.effectiveFrom}
					error={$winErrors.effectiveFrom?.[0]}
					help="YYYY-MM-DD"
				/>
				<TextField
					label="Until"
					name="effectiveTo"
					bind:value={$win.effectiveTo}
					error={$winErrors.effectiveTo?.[0]}
					help="Blank = open-ended"
				/>
				<Select
					label="Slot length"
					name="slotMinutes"
					options={SLOTS}
					bind:value={$win.slotMinutes as unknown as string}
					error={$winErrors.slotMinutes?.[0]}
				/>
				<TextField
					label="Venue reference"
					name="reservationRef"
					bind:value={$win.reservationRef}
					error={$winErrors.reservationRef?.[0]}
					help="Permit or booking number"
				/>
			</div>
			<Checkbox
				label="Families may book private lessons in this window"
				name="lessonBookable"
				bind:checked={$win.lessonBookable}
			/>
			<div><Button type="submit" variant="secondary" size="sm">Declare window</Button></div>
		</FormSection>
	</form>

	<section>
		<Eyebrow>Dated exceptions</Eyebrow>
		{#if data.exceptions.length === 0}
			<EmptyState>NO CLOSURES OR EXTRA OPENINGS</EmptyState>
		{:else}
			<ul class="cav__exceptions">
				{#each data.exceptions as e (e.id)}
					<li class="cav__exception">
						<span class="cav__mono">{e.onDate}</span>
						<span class="cav__mono">{e.kind.toUpperCase()}</span>
						<span class="cav__mono"
							>{e.openLocal && e.closeLocal ? `${e.openLocal}–${e.closeLocal}` : 'ALL DAY'}</span
						>
						<span class="cav__reason">{e.reason ?? ''}</span>
						<form method="POST" action="?/dropException">
							<input type="hidden" name="exceptionId" value={e.id} />
							<Button variant="ghost" size="sm" type="submit">Remove</Button>
						</form>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<form method="POST" action="?/exception" use:excEnhance>
		<FormSection
			eyebrow="Add an exception"
			description="A closure the venue imposed, or an extra opening it granted."
		>
			{#if $excMessage}<Banner>{$excMessage}</Banner>{/if}
			{#if $excErrors._errors?.length}<Banner tone="error">{$excErrors._errors[0]}</Banner>{/if}
			<input type="hidden" name="courtId" value={$exc.courtId} />
			<div class="cav__grid">
				<Select
					label="Kind"
					name="kind"
					options={[
						{ value: 'closed', label: 'Closed' },
						{ value: 'open', label: 'Extra opening' }
					]}
					bind:value={$exc.kind}
				/>
				<TextField
					label="Date"
					name="onDate"
					bind:value={$exc.onDate}
					error={$excErrors.onDate?.[0]}
					help="YYYY-MM-DD"
				/>
				<TimeField
					label="From"
					name="openLocal"
					bind:value={$exc.openLocal}
					error={$excErrors.openLocal?.[0]}
				/>
				<TimeField
					label="To"
					name="closeLocal"
					bind:value={$exc.closeLocal}
					error={$excErrors.closeLocal?.[0]}
				/>
				<TextField
					label="Reason"
					name="reason"
					bind:value={$exc.reason}
					error={$excErrors.reason?.[0]}
				/>
			</div>
			<div><Button type="submit" variant="secondary" size="sm">Add exception</Button></div>
		</FormSection>
	</form>
</div>

<style>
	.cav {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}
	.cav__title {
		margin: var(--space-2) 0;
		font-size: var(--size-h4);
	}
	.cav__back {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--link);
	}
	.cav__grid {
		display: grid;
		grid-template-columns: repeat(
			auto-fit,
			minmax(160px, 1fr) /* ds-allow field column floor, as SessionForm's own */
		);
		gap: var(--space-4);
	}
	.cav__exceptions {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.cav__exception {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-3) 0;
		border-bottom: var(--hairline);
		flex-wrap: wrap;
	}
	.cav__mono {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		color: var(--ink);
	}
	.cav__reason {
		flex: 1;
		font-size: var(--size-body-sm);
		color: var(--text-secondary);
	}
</style>
