<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Banner, Button, DateField, Dialog, FormSection, TextField, Toast } from '$lib/ds';

	let { data, form: actionData } = $props();
	// superforms takes the initial form value by design
	// svelte-ignore state_referenced_locally
	const { form, errors, message, enhance, submitting } = superForm(data.form, { resetForm: false });
	let toast = $state(false);
	let confirmArchive = $state(false);
	$effect(() => {
		if ($message) toast = true;
	});
</script>

<svelte:head><title>{data.player.fullName} · Momentum Tennis</title></svelte:head>

{#if actionData?.archiveError}
	<Banner tone="error">{actionData.archiveError}</Banner>
{/if}

<form method="POST" use:enhance class="edit">
	<FormSection
		eyebrow="Player profile"
		description="Correct anything you typed. Ask us to change the ball level."
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
			bind:value={$form.birthdate}
			error={$errors.birthdate?.[0]}
		/>
		<TextField
			label="Ball level"
			value={data.player.levelLabel ?? 'Not set yet'}
			disabled
			help="Set by the academy — coaches move players between levels"
		/>
		<div class="edit__actions">
			<Button type="submit" variant="secondary" size="sm" disabled={$submitting}
				>Save changes</Button
			>
			<Button variant="ghost" size="sm" href="/portal/players">Back to players</Button>
		</div>
	</FormSection>
</form>

<div class="edit__danger">
	<p class="mt-mono edit__danger-note">
		Added {data.player.fullName} by mistake? Removing takes them off your account. We keep their record.
	</p>
	<Button variant="ghost" size="sm" onclick={() => (confirmArchive = true)}>Remove player</Button>
</div>

<Dialog
	bind:open={confirmArchive}
	title="Remove {data.player.fullName}"
	consequence="This only removes them from your account. The academy keeps their record."
>
	<p class="edit__body">
		You will stop seeing {data.player.fullName} in your portal. Anyone with bookings or credits has to
		be removed by the academy.
	</p>
	{#snippet actions()}
		<Button variant="ghost" onclick={() => (confirmArchive = false)}>Keep player</Button>
		<form method="POST" action="?/archive">
			<Button type="submit" variant="secondary">Remove player</Button>
		</form>
	{/snippet}
</Dialog>

<Toast bind:open={toast}>{$message}</Toast>

<style>
	.edit {
		max-width: 52ch;
	}
	.edit__actions {
		display: flex;
		gap: var(--space-3);
		align-items: center;
		flex-wrap: wrap;
	}
	.edit__danger {
		max-width: 52ch;
		border-top: var(--hairline);
		padding-top: var(--space-5);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		align-items: flex-start;
	}
	.edit__danger-note {
		color: var(--text-secondary);
		margin: 0;
	}
	.edit__body {
		margin: 0;
		font-size: var(--size-body-sm);
		line-height: var(--leading-body);
	}
</style>
