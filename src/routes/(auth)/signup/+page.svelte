<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Banner, Button, Eyebrow, TextField } from '$lib/ds';

	let { data } = $props();
	// superforms takes the initial form value by design
	// svelte-ignore state_referenced_locally
	const { form, errors, message, enhance, submitting } = superForm(data.form);
</script>

<svelte:head><title>Create an account · Momentum Tennis</title></svelte:head>

<main class="auth">
	<Eyebrow ticks>Account</Eyebrow>
	<h1 class="mt-display auth__title">Create an account</h1>
	<p class="auth__lede">
		One account per family. You add each player after — birthdate and ball level — and you sign for
		them.
	</p>
	{#if $message}<Banner tone={$message.startsWith('Check') ? 'note' : 'error'}>{$message}</Banner
		>{/if}
	<form method="POST" use:enhance class="auth__form">
		<TextField
			label="Your name"
			name="fullName"
			autocomplete="name"
			bind:value={$form.fullName}
			error={$errors.fullName?.[0]}
		/>
		<TextField
			label="Email"
			name="email"
			type="email"
			autocomplete="email"
			bind:value={$form.email}
			error={$errors.email?.[0]}
		/>
		<TextField
			label="Password"
			name="password"
			type="password"
			autocomplete="new-password"
			help="At least 8 characters"
			bind:value={$form.password}
			error={$errors.password?.[0]}
		/>
		<div class="auth__actions">
			<Button type="submit" disabled={$submitting}>Create account</Button>
			<Button variant="ghost" href="/login">Log in instead</Button>
		</div>
	</form>
</main>

<style>
	.auth {
		max-width: 44ch;
		margin: 0 auto;
		padding: var(--space-9) var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}
	.auth__title {
		margin: 0;
		font-size: var(--size-h2);
	}
	.auth__lede {
		margin: 0;
		color: var(--text-secondary);
		font-size: var(--size-body-sm);
	}
	.auth__form {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
	.auth__actions {
		display: flex;
		gap: var(--space-3);
		align-items: center;
		flex-wrap: wrap;
		margin-top: var(--space-2);
	}
</style>
