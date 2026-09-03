<script lang="ts">
	import { resolve } from '$app/paths';
	import { superForm } from 'sveltekit-superforms';
	import Card from '$lib/components/Card.svelte';
	import {
		Banner,
		Button,
		Checkbox,
		EmptyState,
		FormSection,
		StatusChip,
		TextField,
		Toast
	} from '$lib/ds';

	let { data } = $props();
	// superforms takes the initial form value by design
	// svelte-ignore state_referenced_locally
	const { form, errors, message, enhance, submitting } = superForm(data.form);
	let toast = $state(false);
	$effect(() => {
		if ($message) toast = true;
	});
</script>

<svelte:head><title>Waivers · Momentum Tennis</title></svelte:head>

{#if data.documentsError}<Banner tone="error">{data.documentsError}</Banner>{/if}

<Banner>
	The text of every document comes from the academy lawyer. This console stores and versions it.
</Banner>

{#if data.documents.length === 0}
	<EmptyState ticks>No waiver documents yet</EmptyState>
{:else}
	<Card>
		<ul class="docs">
			{#each data.documents as doc (doc.id)}
				<li class="docs__row">
					<div class="docs__who">
						<a class="docs__title" href={resolve('/admin/waivers/[id]', { id: doc.id })}
							>{doc.title}</a
						>
						<span class="mt-mono docs__meta">
							{doc.slug}
							{doc.requiredForParticipation ? '· required to participate' : '· optional'}
						</span>
					</div>
					<div class="docs__state">
						{#if doc.currentVersion}
							<StatusChip status="published" />
							<span class="mt-mono docs__meta">V{doc.currentVersion.version}</span>
						{:else}
							<StatusChip status="draft" />
							<span class="mt-mono docs__meta">Never published</span>
						{/if}
						{#if doc.draft}<StatusChip status="draft" />{/if}
					</div>
				</li>
			{/each}
		</ul>
	</Card>
{/if}

<form method="POST" use:enhance class="add">
	<FormSection
		eyebrow="Add a document"
		description="A short name identifies the document in the system. Only documents marked required gate booking."
	>
		{#if $errors._errors?.length}<Banner tone="error">{$errors._errors[0]}</Banner>{/if}
		<TextField
			label="Short name"
			name="slug"
			help="Lower case, digits and hyphens — for example liability"
			bind:value={$form.slug}
			error={$errors.slug?.[0]}
		/>
		<TextField label="Title" name="title" bind:value={$form.title} error={$errors.title?.[0]} />
		<Checkbox
			label="Required to participate — booking is refused until it is signed"
			name="requiredForParticipation"
			bind:checked={$form.requiredForParticipation}
		/>
		<div>
			<Button type="submit" variant="secondary" size="sm" disabled={$submitting}
				>Add document</Button
			>
		</div>
	</FormSection>
</form>

<Toast bind:open={toast}>{$message}</Toast>

<style>
	.docs {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
	}
	.docs__row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		padding: var(--space-4) 0;
		border-bottom: var(--hairline);
		flex-wrap: wrap;
	}
	.docs__row:first-child {
		padding-top: 0;
	}
	.docs__row:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}
	.docs__who {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
	.docs__title {
		font-size: var(--size-body);
		font-weight: 600;
		color: var(--ink);
	}
	.docs__meta {
		color: var(--text-secondary);
		text-transform: uppercase;
	}
	.docs__state {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		flex-wrap: wrap;
	}
	.add {
		max-width: 52ch;
	}
</style>
