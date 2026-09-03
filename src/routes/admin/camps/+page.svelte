<script lang="ts">
	import { resolve } from '$app/paths';
	import { superForm } from 'sveltekit-superforms';
	import { Banner, Button, DataTable, Eyebrow, FormSection, TextArea, TextField } from '$lib/ds';

	let { data } = $props();
	// superforms takes the initial form value by design
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form, { resetForm: true });

	const columns = [
		{ key: 'name', label: 'Camp' },
		{ key: 'startsOn', label: 'Starts', mono: true, sortable: false },
		{ key: 'endsOn', label: 'Ends', mono: true },
		{ key: 'capacity', label: 'Places', numeric: true }
	];
</script>

<svelte:head><title>Camps · Momentum Tennis</title></svelte:head>

<div class="camps">
	<Eyebrow ticks>Camps</Eyebrow>
	<p class="camps__lead">
		Camps are a seasonal event and the database refuses one outside the configured summer window.
		Registration arrives with payments; this schedules the days.
	</p>

	{#if data.loadError}<Banner tone="error">{data.loadError}</Banner>{/if}

	<DataTable
		{columns}
		rows={data.camps}
		empty="NO CAMPS YET"
		rowHref={(row) => resolve('/admin/camps/[id]', { id: String(row.id) })}
	/>

	<form method="POST" use:enhance>
		<FormSection eyebrow="Add a camp" description="A dated event with a fixed number of places.">
			{#if $message}<Banner>{$message}</Banner>{/if}
			{#if $errors._errors?.length}<Banner tone="error">{$errors._errors[0]}</Banner>{/if}
			<TextField label="Name" name="name" bind:value={$form.name} error={$errors.name?.[0]} />
			<div class="camps__grid">
				<TextField
					label="Starts"
					name="startsOn"
					bind:value={$form.startsOn}
					error={$errors.startsOn?.[0]}
					help="YYYY-MM-DD"
				/>
				<TextField
					label="Ends"
					name="endsOn"
					bind:value={$form.endsOn}
					error={$errors.endsOn?.[0]}
					help="YYYY-MM-DD"
				/>
				<TextField
					label="Places"
					name="capacity"
					bind:value={$form.capacity as unknown as string}
					error={$errors.capacity?.[0]}
				/>
			</div>
			<TextArea label="Description" name="description" rows={3} bind:value={$form.description} />
			<div><Button type="submit" variant="secondary" size="sm">Add camp</Button></div>
		</FormSection>
	</form>
</div>

<style>
	.camps {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}
	.camps__lead {
		margin: 0;
		max-width: var(--measure);
		font-size: var(--size-body-sm);
		color: var(--text-secondary);
	}
	.camps__grid {
		display: grid;
		grid-template-columns: repeat(
			auto-fit,
			minmax(160px, 1fr) /* ds-allow field column floor, as SessionForm's own */
		);
		gap: var(--space-4);
	}
</style>
