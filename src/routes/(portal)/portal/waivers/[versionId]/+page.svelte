<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import Card from '$lib/components/Card.svelte';
	import { Banner, Button, Checkbox, Eyebrow, StatusChip, TextField } from '$lib/ds';

	let { data } = $props();
	// superforms takes the initial form value by design
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, submitting } = superForm(data.form);

	// The capacity the database will record. Stated, never chosen.
	const capacity = $derived(
		data.player.relationship === 'self'
			? data.player.isAdult
				? `Signing as yourself, ${data.player.fullName}`
				: null
			: `Signing as guardian for ${data.player.fullName}`
	);
</script>

<svelte:head><title>{data.version.title} · Momentum Tennis</title></svelte:head>

<div class="sign">
	<header class="sign__head">
		<Eyebrow ticks>{data.version.title}</Eyebrow>
		<span class="mt-mono sign__stamp">
			V{data.version.version} · PUBLISHED {data.version.publishedAt?.slice(0, 10)} ·
			{data.version.contentSha256.slice(0, 12)}
		</span>
	</header>

	{#if !data.version.isCurrent}
		<Banner tone="error">
			A newer version has been published. Go back and sign the current one.
		</Banner>
	{/if}

	<Card>
		<!-- A long document in a scroll box: keyboard users must be able to scroll it, which
		     needs a focusable region. The rule assumes tabindex on a region is a mistake. -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div class="sign__doc" tabindex="0" role="region" aria-label="{data.version.title} text">
			<pre class="sign__text">{data.version.contentMd}</pre>
		</div>
	</Card>

	{#if data.alreadySigned}
		<Card>
			<div class="sign__receipt">
				<StatusChip status="signed" />
				<p class="mt-mono sign__meta">
					Signed for {data.player.fullName} · version {data.version.version}. A new version will
					need a new signature.
				</p>
			</div>
		</Card>
	{:else if capacity === null}
		<Banner tone="error">
			{data.player.fullName} is under 18 and cannot sign for themselves. A parent or guardian signs from
			their own account.
		</Banner>
	{:else if data.version.isCurrent}
		<form method="POST" use:enhance class="sign__form">
			{#if $errors._errors?.length}<Banner tone="error">{$errors._errors[0]}</Banner>{/if}
			<p class="mt-mono sign__capacity">{capacity}</p>
			<TextField
				label="Type your full name"
				name="typedName"
				autocomplete="name"
				bind:value={$form.typedName}
				error={$errors.typedName?.[0]}
			/>
			<Checkbox
				consent
				name="agree"
				bind:checked={$form.agree}
				error={$errors.agree?.[0]}
				label="I have read this document and I sign it for {data.player.fullName}."
			/>
			<div class="sign__actions">
				<Button type="submit" disabled={$submitting}>Sign</Button>
				<Button variant="ghost" size="sm" href="/portal/waivers">Cancel</Button>
			</div>
		</form>
	{/if}

	<p class="mt-mono sign__meta">The academy keeps every signature and the exact text it covered.</p>
</div>

<style>
	.sign {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		max-width: 72ch;
	}
	.sign__head {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	.sign__stamp,
	.sign__meta,
	.sign__capacity {
		color: var(--text-secondary);
		text-transform: uppercase;
		margin: 0;
	}
	.sign__doc {
		max-height: 44vh;
		overflow-y: auto;
		border: var(--hairline);
		padding: var(--space-4);
		background: var(--surface-page);
	}
	.sign__text {
		margin: 0;
		font-family: var(--font-sans);
		font-size: var(--size-body-sm);
		line-height: var(--leading-body);
		color: var(--ink);
		white-space: pre-wrap;
		word-break: break-word;
	}
	.sign__form {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
	.sign__actions {
		display: flex;
		gap: var(--space-3);
		align-items: center;
		flex-wrap: wrap;
	}
	.sign__receipt {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
</style>
