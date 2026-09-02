<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Banner, Button, Eyebrow, TextField } from '$lib/ds';

	let { data } = $props();
	// superforms takes the initial form value by design
	// svelte-ignore state_referenced_locally
	const { form, errors, message, enhance, submitting } = superForm(data.form);
</script>

<svelte:head><title>Log in · Momentum Tennis</title></svelte:head>

<main class="auth">
	<Eyebrow ticks>Account</Eyebrow>
	<h1 class="mt-display auth__title">Log in</h1>
	{#if $message}<Banner tone="error">{$message}</Banner>{/if}
	<form method="POST" use:enhance class="auth__form">
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
			autocomplete="current-password"
			bind:value={$form.password}
			error={$errors.password?.[0]}
		/>
		<div class="auth__actions">
			<Button type="submit" disabled={$submitting}>Log in</Button>
			<Button variant="ghost" href="/signup">Create an account</Button>
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
