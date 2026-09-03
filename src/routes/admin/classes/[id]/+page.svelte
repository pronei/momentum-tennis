<script lang="ts">
	import { resolve } from '$app/paths';
	import { superForm } from 'sveltekit-superforms';
	import {
		Banner,
		Button,
		Checkbox,
		Eyebrow,
		FormSection,
		Select,
		TextField,
		TimeField,
		Toast
	} from '$lib/ds';

	let { data, form: action } = $props();
	// superforms takes the initial form value by design
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, submitting, message } = superForm(data.form, {
		resetForm: false
	});
	let toast = $state(false);
	$effect(() => {
		if ($message) toast = true;
	});

	const WEEKDAYS = [
		{ value: '1', label: 'Monday' },
		{ value: '2', label: 'Tuesday' },
		{ value: '3', label: 'Wednesday' },
		{ value: '4', label: 'Thursday' },
		{ value: '5', label: 'Friday' },
		{ value: '6', label: 'Saturday' },
		{ value: '7', label: 'Sunday' }
	];
</script>

<svelte:head><title>{data.template.name} · Classes</title></svelte:head>

<div class="cd">
	<div>
		<Eyebrow ticks>{data.term?.name ?? 'Class'}</Eyebrow>
		<h2 class="cd__title">{data.template.name}</h2>
		<a class="cd__back" href={resolve('/admin/classes')}>All classes</a>
	</div>

	<form method="POST" action="?/save" use:enhance>
		<FormSection eyebrow="Template" description="Wall-clock values, expanded per date.">
			{#if $errors._errors?.length}<Banner tone="error">{$errors._errors[0]}</Banner>{/if}
			<input type="hidden" name="termId" value={$form.termId} />
			<TextField label="Name" name="name" bind:value={$form.name} error={$errors.name?.[0]} />
			<div class="cd__grid">
				<Select
					label="Weekday"
					name="weekday"
					options={WEEKDAYS}
					bind:value={$form.weekday as unknown as string}
					error={$errors.weekday?.[0]}
				/>
				<TimeField
					label="Starts"
					name="startTimeLocal"
					bind:value={$form.startTimeLocal}
					error={$errors.startTimeLocal?.[0]}
				/>
				<Select
					label="Length"
					name="durationMinutes"
					options={[
						{ value: '90', label: '90 min · weekday' },
						{ value: '120', label: '120 min · weekend' }
					]}
					bind:value={$form.durationMinutes as unknown as string}
					error={$errors.durationMinutes?.[0]}
				/>
				<TextField
					label="Seats"
					name="capacity"
					bind:value={$form.capacity as unknown as string}
					error={$errors.capacity?.[0]}
				/>
				<Select
					label="Default court"
					name="defaultCourtId"
					placeholder="None"
					options={data.courts}
					bind:value={$form.defaultCourtId}
					error={$errors.defaultCourtId?.[0]}
				/>
				<Select
					label="Default coach"
					name="defaultCoachId"
					placeholder="None"
					options={data.coaches}
					bind:value={$form.defaultCoachId}
					error={$errors.defaultCoachId?.[0]}
				/>
			</div>
			<div>
				<Button type="submit" variant="secondary" size="sm" disabled={$submitting}
					>Save template</Button
				>
			</div>
		</FormSection>
	</form>

	<form method="POST" action="?/levels">
		<FormSection
			eyebrow="Ball levels"
			description="Copied onto every occurrence generated from now on. None ticked means every level."
		>
			{#if action?.levelsError}<Banner tone="error">{action.levelsError}</Banner>{/if}
			{#if action?.tagged !== undefined}<Banner>TAGS SAVED · {action.tagged} LEVEL(S)</Banner>{/if}
			<div class="cd__levels">
				{#each data.levels as l (l.value)}
					<Checkbox
						name="levels"
						value={l.value}
						label={l.label}
						checked={data.template.levelKeys.includes(l.value)}
					/>
				{/each}
			</div>
			<div><Button type="submit" variant="secondary" size="sm">Save levels</Button></div>
		</FormSection>
	</form>

	<form method="POST" action="?/generate">
		<FormSection
			eyebrow="Generate occurrences"
			description="Materialize the template into sessions. Re-runnable: dates already scheduled, or whose court is not reserved, are skipped and reported."
		>
			{#if action?.generateError}<Banner tone="error">{action.generateError}</Banner>{/if}
			{#if action?.generated}
				<Banner>
					CREATED {action.generated.created} · SKIPPED {action.generated.skipped.length}{action
						.generated.skipped.length
						? ` · ${action.generated.skipped.join(' ')}`
						: ''}
				</Banner>
			{/if}
			<div class="cd__grid">
				<TextField label="From" name="from" value={data.term?.startsOn ?? ''} help="YYYY-MM-DD" />
				<TextField label="To" name="to" value={data.term?.endsOn ?? ''} help="YYYY-MM-DD" />
			</div>
			<div><Button type="submit" variant="secondary" size="sm">Generate</Button></div>
		</FormSection>
	</form>
</div>
<Toast bind:open={toast}>{$message}</Toast>

<style>
	.cd {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		max-width: 760px;
	}
	.cd__title {
		margin: var(--space-2) 0;
		font-size: var(--size-h4);
	}
	.cd__back {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--link);
	}
	.cd__grid {
		display: grid;
		grid-template-columns: repeat(
			auto-fit,
			minmax(160px, 1fr) /* ds-allow field column floor, as SessionForm's own */
		);
		gap: var(--space-4);
	}
	.cd__levels {
		display: grid;
		grid-template-columns: repeat(
			auto-fit,
			minmax(220px, 1fr) /* ds-allow grid track floor for the level checkboxes */
		);
		gap: var(--space-3);
	}
</style>
