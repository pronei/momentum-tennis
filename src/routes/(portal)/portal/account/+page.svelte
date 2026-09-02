<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Banner, Button, FormSection, TextField, Toast } from '$lib/ds';

	let { data } = $props();
	// superforms takes the initial form value by design
	// svelte-ignore state_referenced_locally
	const { form, errors, message, enhance, submitting } = superForm(data.form, {
		resetForm: false
	});
	let toast = $state(false);
	$effect(() => {
		if ($message) toast = true;
	});
</script>

<svelte:head><title>Account · Momentum Tennis</title></svelte:head>

<form method="POST" use:enhance class="account">
	<FormSection
		eyebrow="Parent — account owner"
		description="How receipts, reminders and re-consent requests reach you."
	>
		{#if $errors._errors?.length}<Banner tone="error">{$errors._errors[0]}</Banner>{/if}
		<TextField
			label="Name"
			name="fullName"
			autocomplete="name"
			bind:value={$form.fullName}
			error={$errors.fullName?.[0]}
		/>
		<TextField
			label="Email"
			value={data.account.email}
			disabled
			help="Change your email from the login settings (phase 1)"
		/>
		<TextField
			label="Phone"
			name="phone"
			type="tel"
			autocomplete="tel"
			bind:value={$form.phone}
			error={$errors.phone?.[0]}
		/>
		<div>
			<Button type="submit" variant="secondary" size="sm" disabled={$submitting}
				>Save changes</Button
			>
		</div>
	</FormSection>
</form>
<Toast bind:open={toast}>{$message}</Toast>

<style>
	.account {
		max-width: 52ch;
	}
</style>
