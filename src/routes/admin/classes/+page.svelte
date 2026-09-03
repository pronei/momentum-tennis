<script lang="ts">
	import { resolve } from '$app/paths';
	import { superForm } from 'sveltekit-superforms';
	import {
		Banner,
		Button,
		DataTable,
		EmptyState,
		Eyebrow,
		FormSection,
		Select,
		TextField,
		TimeField
	} from '$lib/ds';

	let { data } = $props();
	// superforms takes the initial form value by design
	// svelte-ignore state_referenced_locally
	const {
		form: term,
		errors: termErrors,
		enhance: termEnhance,
		message: termMessage
	} = superForm(data.termForm, { id: 'term', resetForm: true });
	// svelte-ignore state_referenced_locally
	const {
		form: cls,
		errors: clsErrors,
		enhance: clsEnhance,
		message: clsMessage
	} = superForm(data.classForm, { id: 'class', resetForm: false });

	const WEEKDAYS = [
		{ value: '1', label: 'Monday' },
		{ value: '2', label: 'Tuesday' },
		{ value: '3', label: 'Wednesday' },
		{ value: '4', label: 'Thursday' },
		{ value: '5', label: 'Friday' },
		{ value: '6', label: 'Saturday' },
		{ value: '7', label: 'Sunday' }
	];
	const columns = [
		{ key: 'name', label: 'Class' },
		{ key: 'day', label: 'Day', mono: true },
		{ key: 'time', label: 'Start', mono: true },
		{ key: 'length', label: 'Minutes', numeric: true },
		{ key: 'capacity', label: 'Seats', numeric: true },
		{ key: 'court', label: 'Court', mono: true },
		{ key: 'levels', label: 'Levels', mono: true }
	];
	const rows = $derived(
		data.classes.map((c) => ({
			id: c.id,
			name: c.name,
			day: WEEKDAYS[c.weekday - 1].label.slice(0, 3).toUpperCase(),
			time: c.startTimeLocal,
			length: c.durationMinutes,
			capacity: c.capacity,
			court: c.courtName ?? '—',
			levels: c.levelKeys.length ? c.levelKeys.length : 'ALL'
		}))
	);
</script>

<svelte:head><title>Classes · Momentum Tennis</title></svelte:head>

<div class="cls">
	<Eyebrow ticks>Terms and class templates</Eyebrow>

	{#if data.loadError}<Banner tone="error">{data.loadError}</Banner>{/if}

	{#if data.terms.length === 0}
		<EmptyState ticks>No terms yet — a class template belongs to a term</EmptyState>
	{:else}
		<nav class="cls__terms" aria-label="Term">
			{#each data.terms as t (t.id)}
				<a
					class="cls__term"
					class:cls__term--on={t.id === data.termId}
					aria-current={t.id === data.termId ? 'page' : undefined}
					href="{resolve('/admin/classes')}?term={t.id}">{t.name}</a
				>
			{/each}
		</nav>

		<DataTable
			{columns}
			{rows}
			empty="NO CLASSES IN THIS TERM"
			rowHref={(row) => resolve('/admin/classes/[id]', { id: String(row.id) })}
		/>
	{/if}

	<div class="cls__forms">
		<form method="POST" action="?/term" use:termEnhance>
			<FormSection eyebrow="Add a term" description="The season a class template runs in.">
				{#if $termMessage}<Banner>{$termMessage}</Banner>{/if}
				<TextField label="Name" name="name" bind:value={$term.name} error={$termErrors.name?.[0]} />
				<TextField
					label="Starts"
					name="startsOn"
					bind:value={$term.startsOn}
					error={$termErrors.startsOn?.[0]}
					help="YYYY-MM-DD"
				/>
				<TextField
					label="Ends"
					name="endsOn"
					bind:value={$term.endsOn}
					error={$termErrors.endsOn?.[0]}
					help="YYYY-MM-DD"
				/>
				<div><Button type="submit" variant="secondary" size="sm">Add term</Button></div>
			</FormSection>
		</form>

		{#if data.termId}
			<form method="POST" action="?/class" use:clsEnhance>
				<FormSection
					eyebrow="Add a class"
					description="Wall-clock times. Occurrences are generated per date, so DST never moves a class."
				>
					{#if $clsMessage}<Banner>{$clsMessage}</Banner>{/if}
					{#if $clsErrors._errors?.length}<Banner tone="error">{$clsErrors._errors[0]}</Banner>{/if}
					<input type="hidden" name="termId" value={data.termId} />
					<TextField label="Name" name="name" bind:value={$cls.name} error={$clsErrors.name?.[0]} />
					<div class="cls__grid">
						<Select
							label="Weekday"
							name="weekday"
							options={WEEKDAYS}
							bind:value={$cls.weekday as unknown as string}
							error={$clsErrors.weekday?.[0]}
						/>
						<TimeField
							label="Starts"
							name="startTimeLocal"
							bind:value={$cls.startTimeLocal}
							error={$clsErrors.startTimeLocal?.[0]}
						/>
						<Select
							label="Length"
							name="durationMinutes"
							options={[
								{ value: '90', label: '90 min · weekday' },
								{ value: '120', label: '120 min · weekend' }
							]}
							bind:value={$cls.durationMinutes as unknown as string}
							error={$clsErrors.durationMinutes?.[0]}
						/>
						<TextField
							label="Seats"
							name="capacity"
							bind:value={$cls.capacity as unknown as string}
							error={$clsErrors.capacity?.[0]}
						/>
						<Select
							label="Default court"
							name="defaultCourtId"
							placeholder="None"
							options={data.courts}
							bind:value={$cls.defaultCourtId}
							error={$clsErrors.defaultCourtId?.[0]}
						/>
						<Select
							label="Default coach"
							name="defaultCoachId"
							placeholder="None"
							options={data.coaches}
							bind:value={$cls.defaultCoachId}
							error={$clsErrors.defaultCoachId?.[0]}
						/>
					</div>
					<div><Button type="submit" variant="secondary" size="sm">Add class</Button></div>
				</FormSection>
			</form>
		{/if}
	</div>
</div>

<style>
	.cls {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}
	.cls__terms {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}
	.cls__term {
		min-height: 44px; /* ds-allow the system's minimum hit target */
		display: inline-flex;
		align-items: center;
		padding: 0 var(--space-4);
		border: var(--hairline);
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--ink);
		text-decoration: none;
	}
	.cls__term--on {
		border-color: var(--ink);
		background: var(--court-050);
		font-weight: var(--weight-medium);
	}
	.cls__grid {
		display: grid;
		grid-template-columns: repeat(
			auto-fit,
			minmax(160px, 1fr) /* ds-allow field column floor, as SessionForm's own */
		);
		gap: var(--space-4);
	}
	.cls__forms {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr) /* ds-allow form column floor */);
		gap: var(--space-6);
		border-top: var(--hairline);
		padding-top: var(--space-5);
	}
</style>
