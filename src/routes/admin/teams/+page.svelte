<script lang="ts">
	import { resolve } from '$app/paths';
	import { superForm } from 'sveltekit-superforms';
	import { Banner, Button, DataTable, Eyebrow, FormSection, TextArea, TextField } from '$lib/ds';

	let { data } = $props();
	// superforms takes the initial form value by design
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form, { resetForm: true });

	const columns = [
		{ key: 'name', label: 'Team' },
		{ key: 'season', label: 'Season', mono: true }
	];
</script>

<svelte:head><title>Teams · Momentum Tennis</title></svelte:head>

<div class="teams">
	<Eyebrow ticks>USTA Junior Team Tennis</Eyebrow>

	{#if data.loadError}<Banner tone="error">{data.loadError}</Banner>{/if}

	<DataTable
		{columns}
		rows={data.teams}
		empty="NO TEAMS YET"
		rowHref={(row) => resolve('/admin/teams/[id]', { id: String(row.id) })}
	/>

	<form method="POST" use:enhance>
		<FormSection eyebrow="Add a team" description="A team belongs to one season.">
			{#if $message}<Banner>{$message}</Banner>{/if}
			<TextField label="Name" name="name" bind:value={$form.name} error={$errors.name?.[0]} />
			<TextField
				label="Season"
				name="season"
				bind:value={$form.season}
				error={$errors.season?.[0]}
				help="e.g. Fall 2026"
			/>
			<TextArea label="Description" name="description" rows={2} bind:value={$form.description} />
			<div><Button type="submit" variant="secondary" size="sm">Add team</Button></div>
		</FormSection>
	</form>
</div>

<style>
	.teams {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}
</style>
