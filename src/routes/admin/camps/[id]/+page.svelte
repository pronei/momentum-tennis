<script lang="ts">
	import { resolve } from '$app/paths';
	import { superForm } from 'sveltekit-superforms';
	import {
		Banner,
		Button,
		DataTable,
		Eyebrow,
		FormSection,
		Select,
		TextArea,
		TextField,
		TimeField
	} from '$lib/ds';

	let { data } = $props();
	// superforms takes the initial form value by design
	// svelte-ignore state_referenced_locally
	const {
		form: camp,
		errors: campErrors,
		enhance: campEnhance,
		message: campMessage
	} = superForm(data.campForm, { id: 'camp', resetForm: false });
	// svelte-ignore state_referenced_locally
	const {
		form: day,
		errors: dayErrors,
		enhance: dayEnhance,
		message: dayMessage
	} = superForm(data.dayForm, { id: 'day', resetForm: false });

	const columns = [
		{ key: 'date', label: 'Date', mono: true },
		{ key: 'hours', label: 'Hours', mono: true },
		{ key: 'court', label: 'Court', mono: true },
		{ key: 'state', label: 'State', mono: true }
	];
	const rows = $derived(
		data.days.map((d) => ({ ...d, state: d.cancelled ? 'CANCELLED' : 'SCHEDULED' }))
	);
</script>

<svelte:head><title>{data.camp.name} · Camps</title></svelte:head>

<div class="camp">
	<div>
		<Eyebrow ticks>Camp</Eyebrow>
		<h2 class="camp__title">{data.camp.name}</h2>
		<a class="camp__back" href={resolve('/admin/camps')}>All camps</a>
	</div>

	{#if data.loadError}<Banner tone="error">{data.loadError}</Banner>{/if}

	<section>
		<Eyebrow>Camp days</Eyebrow>
		<DataTable
			{columns}
			{rows}
			empty="NO DAYS SCHEDULED"
			rowHref={(row) => resolve('/admin/schedule/[id]', { id: String(row.id) })}
			mobileTitleKey="date"
		/>
	</section>

	<form method="POST" action="?/day" use:dayEnhance>
		<FormSection
			eyebrow="Add a day"
			description="Each day is an ordinary session, so the court must be reserved for it."
		>
			{#if $dayMessage}<Banner>{$dayMessage}</Banner>{/if}
			{#if $dayErrors._errors?.length}<Banner tone="error">{$dayErrors._errors[0]}</Banner>{/if}
			<div class="camp__grid">
				<TextField
					label="Date"
					name="date"
					bind:value={$day.date}
					error={$dayErrors.date?.[0]}
					help="YYYY-MM-DD"
				/>
				<TimeField
					label="Starts"
					name="start"
					bind:value={$day.start}
					error={$dayErrors.start?.[0]}
				/>
				<TimeField label="Ends" name="end" bind:value={$day.end} error={$dayErrors.end?.[0]} />
				<Select
					label="Court"
					name="courtId"
					placeholder="Choose one"
					options={data.courts}
					bind:value={$day.courtId}
					error={$dayErrors.courtId?.[0]}
				/>
			</div>
			<div><Button type="submit" variant="secondary" size="sm">Add day</Button></div>
		</FormSection>
	</form>

	<form method="POST" action="?/save" use:campEnhance>
		<FormSection eyebrow="Camp details">
			{#if $campMessage}<Banner>{$campMessage}</Banner>{/if}
			{#if $campErrors._errors?.length}<Banner tone="error">{$campErrors._errors[0]}</Banner>{/if}
			<TextField label="Name" name="name" bind:value={$camp.name} error={$campErrors.name?.[0]} />
			<div class="camp__grid">
				<TextField
					label="Starts"
					name="startsOn"
					bind:value={$camp.startsOn}
					error={$campErrors.startsOn?.[0]}
					help="YYYY-MM-DD"
				/>
				<TextField
					label="Ends"
					name="endsOn"
					bind:value={$camp.endsOn}
					error={$campErrors.endsOn?.[0]}
					help="YYYY-MM-DD"
				/>
				<TextField
					label="Places"
					name="capacity"
					bind:value={$camp.capacity as unknown as string}
					error={$campErrors.capacity?.[0]}
				/>
			</div>
			<TextArea label="Description" name="description" rows={3} bind:value={$camp.description} />
			<div><Button type="submit" variant="secondary" size="sm">Save camp</Button></div>
		</FormSection>
	</form>
</div>

<style>
	.camp {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}
	.camp__title {
		margin: var(--space-2) 0;
		font-size: var(--size-h4);
	}
	.camp__back {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--link);
	}
	.camp__grid {
		display: grid;
		grid-template-columns: repeat(
			auto-fit,
			minmax(160px, 1fr) /* ds-allow field column floor, as SessionForm's own */
		);
		gap: var(--space-4);
	}
</style>
