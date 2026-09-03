<script lang="ts">
	import { resolve } from '$app/paths';
	import { superForm } from 'sveltekit-superforms';
	import {
		Banner,
		Button,
		Checkbox,
		Dialog,
		Eyebrow,
		FormSection,
		SessionForm,
		StatusChip,
		TextField,
		Toast
	} from '$lib/ds';

	let { data, form: action } = $props();
	// superforms takes the initial form value by design
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, submitting, message } = superForm(data.form, {
		resetForm: false
	});

	let confirming = $state(false);
	let toast = $state(false);
	$effect(() => {
		if ($message) toast = true;
	});

	const backHref = $derived(
		`${resolve('/admin/schedule')}?location=${data.locationId}&date=${data.localDate}`
	);
	const fieldErrors = $derived({
		courtId: $errors.courtId?.[0],
		coachId: $errors.coachId?.[0],
		date: $errors.date?.[0],
		start: $errors.start?.[0],
		end: $errors.end?.[0]
	});
</script>

<svelte:head><title>{data.session.title} · Momentum Tennis</title></svelte:head>

<div class="edit">
	<div class="edit__head">
		<div>
			<Eyebrow ticks>{data.session.type}</Eyebrow>
			<h2 class="edit__title">{data.session.title}</h2>
		</div>
		<StatusChip status={data.session.cancelled ? 'cancelled' : 'active'} />
	</div>

	{#if data.session.cancelled}
		<Banner>This session is cancelled. Every booked player was made whole.</Banner>
	{/if}

	<form method="POST" action="?/save" use:enhance>
		<SessionForm
			bind:type={$form.type}
			bind:courtId={$form.courtId}
			bind:coachId={$form.coachId}
			bind:date={$form.date}
			bind:start={$form.start}
			bind:end={$form.end}
			bind:notes={$form.notes}
			courts={data.courts}
			coaches={data.coaches}
			errors={fieldErrors}
			conflict={$errors._errors?.[0]}
			submitting={$submitting}
			cancelHref={backHref}
			submitLabel="Save session"
		>
			{#snippet extra()}
				<input type="hidden" name="parentId" value={$form.parentId} />
			{/snippet}
		</SessionForm>
	</form>

	<form method="POST" action="?/levels">
		<FormSection
			eyebrow="Ball levels"
			description="Which levels this slot offers. None ticked means every level may book it."
		>
			{#if action?.levelsError}<Banner tone="error">{action.levelsError}</Banner>{/if}
			{#if action?.tagged !== undefined}
				<Banner>TAGS SAVED · {action.tagged} LEVEL(S)</Banner>
			{/if}
			<div class="edit__levels">
				{#each data.levels as l (l.value)}
					<Checkbox
						name="levels"
						value={l.value}
						label={l.label}
						checked={data.session.levelKeys.includes(l.value)}
					/>
				{/each}
			</div>
			<div><Button type="submit" variant="secondary" size="sm">Save levels</Button></div>
		</FormSection>
	</form>

	{#if !data.session.cancelled}
		<div class="edit__danger">
			{#if action?.cancelError}<Banner tone="error">{action.cancelError}</Banner>{/if}
			<Button variant="secondary" size="sm" onclick={() => (confirming = true)}
				>Cancel this session</Button
			>
		</div>
	{/if}
</div>

<Dialog
	bind:open={confirming}
	title="Cancel this session"
	consequence="Every booked player is made whole — credits return and the weekly cap frees up"
>
	<form method="POST" action="?/cancel" class="edit__confirm">
		<input type="hidden" name="back" value={backHref} />
		<TextField label="Reason" name="reason" help="Shown on the session record" />
		<div class="edit__confirm-actions">
			<Button variant="ghost" onclick={() => (confirming = false)}>Keep it</Button>
			<Button type="submit" variant="secondary">Cancel session</Button>
		</div>
	</form>
</Dialog>
<Toast bind:open={toast}>{$message}</Toast>

<style>
	.edit {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		max-width: 760px;
	}
	.edit__head {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--space-4);
	}
	.edit__title {
		margin: var(--space-2) 0 0;
		font-size: var(--size-h4);
	}
	.edit__levels {
		display: grid;
		grid-template-columns: repeat(
			auto-fit,
			minmax(220px, 1fr) /* ds-allow grid track floor for the level checkboxes */
		);
		gap: var(--space-3);
	}
	.edit__danger {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		border-top: var(--hairline);
		padding-top: var(--space-5);
	}
	.edit__confirm {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
	.edit__confirm-actions {
		display: flex;
		gap: var(--space-3);
		justify-content: flex-end;
	}
</style>
