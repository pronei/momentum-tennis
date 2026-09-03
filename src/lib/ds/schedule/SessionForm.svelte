<script lang="ts">
	import type { Snippet } from 'svelte';
	import Banner from '../feedback/Banner.svelte';
	import Button from '../core/Button.svelte';
	import DateField from '../forms/DateField.svelte';
	import SegmentedControl from '../forms/SegmentedControl.svelte';
	import Select from '../forms/Select.svelte';
	import TextArea from '../forms/TextArea.svelte';
	import TimeField from '../forms/TimeField.svelte';

	/* Create/edit a session with the Group-1 controls, in the reference layout: type row, court +
	   coach, date + start + end, notes. The conflict prop renders the inline rejection — the
	   database refuses double-booking; this form shows the refusal, and the submit goes dead.

	   The <form> element itself belongs to the route, not here: every form in this app is a
	   superforms form, and `use:enhance` has to be applied where the action is declared. This
	   component is the fields and the actions; `extra` takes the per-type fields (the class, camp
	   or team the session belongs to) without disturbing the layout. */
	let {
		type = $bindable('class'),
		courtId = $bindable(''),
		coachId = $bindable(''),
		date = $bindable(''),
		start = $bindable(''),
		end = $bindable(''),
		notes = $bindable(''),
		courts = [],
		coaches = [],
		errors = {},
		conflict,
		submitLabel = 'Save session',
		cancelHref,
		submitting = false,
		extra
	}: {
		type?: string;
		courtId?: string;
		coachId?: string;
		date?: string;
		start?: string;
		end?: string;
		notes?: string;
		courts?: { id: string; label: string }[];
		coaches?: { id: string; label: string }[];
		/** Field errors, keyed as the schema names them */
		errors?: Record<string, string | undefined>;
		/** Mono conflict message, e.g. "COURT 2 BOOKED 16:00–17:30 — PICK ANOTHER SLOT" */
		conflict?: string;
		submitLabel?: string;
		cancelHref?: string;
		submitting?: boolean;
		/** The parent picker and any type-specific fields */
		extra?: Snippet;
	} = $props();

	const options = (list: { id: string; label: string }[]) =>
		list.map((c) => ({ value: c.id, label: c.label }));
</script>

<div class="mt-sf">
	<SegmentedControl
		label="Type"
		name="type"
		fullWidth
		options={[
			{ value: 'class', label: 'Class' },
			{ value: 'camp', label: 'Camp' },
			{ value: 'team', label: 'Team' },
			{ value: 'private', label: 'Private' }
		]}
		bind:value={type}
		error={errors.type}
	/>

	{#if extra}{@render extra()}{/if}

	<div class="mt-sf__pair">
		<Select
			label="Court"
			name="courtId"
			placeholder="No court"
			options={options(courts)}
			bind:value={courtId}
			error={errors.courtId}
		/>
		<Select
			label="Coach"
			name="coachId"
			placeholder="No coach"
			options={options(coaches)}
			bind:value={coachId}
			error={errors.coachId}
		/>
	</div>

	<div class="mt-sf__trio">
		<DateField label="Date" name="date" bind:value={date} error={errors.date} />
		<TimeField label="Start" name="start" bind:value={start} error={errors.start} />
		<TimeField label="End" name="end" bind:value={end} error={errors.end} />
	</div>

	<TextArea label="Notes" name="notes" rows={2} bind:value={notes} placeholder="Optional" />

	{#if conflict}<Banner tone="error">{conflict}</Banner>{/if}

	<div class="mt-sf__actions">
		{#if cancelHref}<Button variant="ghost" href={cancelHref}>Cancel</Button>{/if}
		<Button type="submit" disabled={!!conflict || submitting}>{submitLabel}</Button>
	</div>
</div>

<style>
	.mt-sf {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
	.mt-sf__pair {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: var(--space-4);
	}
	.mt-sf__trio {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: var(--space-4);
	}
	.mt-sf__actions {
		display: flex;
		gap: var(--space-3);
		justify-content: flex-end;
		flex-wrap: wrap;
	}
</style>
