<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import {
		Banner,
		Button,
		DateField,
		FormSection,
		SegmentedControl,
		Select,
		TextField
	} from '$lib/ds';

	let { data } = $props();
	// superforms takes the initial form value by design
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, submitting } = superForm(data.form);
</script>

<svelte:head><title>Add a player · Momentum Tennis</title></svelte:head>

<form method="POST" use:enhance class="add">
	<FormSection
		eyebrow="Add a player"
		ticks
		description="Everyone who trains with us has their own profile. Add one for each person — you stay the account owner."
	>
		{#if $errors._errors?.length}<Banner tone="error">{$errors._errors[0]}</Banner>{/if}
		<TextField
			label="Player name"
			name="fullName"
			autocomplete="off"
			bind:value={$form.fullName}
			error={$errors.fullName?.[0]}
		/>
		<DateField
			label="Date of birth"
			name="birthdate"
			help="We use it to know who signs the waiver"
			bind:value={$form.birthdate}
			error={$errors.birthdate?.[0]}
		/>
		<SegmentedControl
			label="Who is this"
			name="relationship"
			options={[
				{ value: 'parent', label: 'My child' },
				{ value: 'legal_guardian', label: 'I am their guardian' },
				{ value: 'self', label: 'Myself' }
			]}
			bind:value={$form.relationship}
			error={$errors.relationship?.[0]}
		/>
		<Select
			label="Ball level"
			name="skillLevelKey"
			placeholder="Not sure yet"
			options={data.levels}
			help="The academy sets and changes this after the first session"
			bind:value={$form.skillLevelKey}
			error={$errors.skillLevelKey?.[0]}
		/>
		<div class="add__actions">
			<Button type="submit" disabled={$submitting}>Add player</Button>
			<Button variant="ghost" size="sm" href="/portal/players">Cancel</Button>
		</div>
	</FormSection>
</form>

<style>
	.add {
		max-width: 52ch;
	}
	.add__actions {
		display: flex;
		gap: var(--space-3);
		align-items: center;
		flex-wrap: wrap;
	}
</style>
