<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import Card from '$lib/components/Card.svelte';
	import { Banner, Button, Dialog, FormSection, StatusChip, TextArea, Toast } from '$lib/ds';

	let { data, form: actionData } = $props();
	// superforms takes the initial form value by design
	// svelte-ignore state_referenced_locally
	const { form, errors, message, enhance, submitting } = superForm(data.form, { resetForm: false });
	let toast = $state(false);
	let confirmPublish = $state(false);
	$effect(() => {
		if ($message) toast = true;
	});

	const consequence = $derived(
		data.signerCount === 0
			? 'Nobody has signed this document yet, so nobody has to re-consent.'
			: `Publishing means ${data.signerCount} ${data.signerCount === 1 ? 'player' : 'players'} must re-consent before booking again.`
	);
</script>

<svelte:head><title>{data.document.title} · Momentum Tennis</title></svelte:head>

{#if actionData?.publishError}<Banner tone="error">{actionData.publishError}</Banner>{/if}

<Card>
	<div class="doc">
		<div class="doc__head">
			<h2 class="mt-display doc__title">{data.document.title}</h2>
			<span class="mt-mono doc__meta">{data.document.slug}</span>
		</div>
		{#if data.versions.length === 0}
			<p class="mt-mono doc__meta">No versions yet. The first draft becomes version 1.</p>
		{:else}
			<ul class="vers">
				{#each data.versions as v (v.id)}
					<li class="vers__row">
						<span class="mt-mono vers__n">V{v.version}</span>
						<StatusChip status={v.publishedAt ? 'published' : 'draft'} />
						<span class="mt-mono vers__meta">
							{v.publishedAt ? `Published ${v.publishedAt.slice(0, 10)}` : 'Not published'} ·
							{v.contentSha256.slice(0, 12)}
						</span>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</Card>

<form method="POST" action="?/draft" use:enhance class="draft">
	<FormSection
		eyebrow={data.draft ? `Draft — version ${data.draft.version}` : 'New draft'}
		description="Paste the text exactly as the academy lawyer supplied it. A draft changes nothing until it is published."
	>
		{#if $errors._errors?.length}<Banner tone="error">{$errors._errors[0]}</Banner>{/if}
		<TextArea
			label="Document text"
			name="contentMd"
			rows={14}
			help="Stored verbatim and fingerprinted, so it is always clear what was signed"
			bind:value={$form.contentMd}
			error={$errors.contentMd?.[0]}
		/>
		<div class="draft__actions">
			<Button type="submit" variant="secondary" size="sm" disabled={$submitting}>Save draft</Button>
			{#if data.draft}
				<Button variant="ghost" size="sm" onclick={() => (confirmPublish = true)}>Publish</Button>
			{/if}
		</div>
	</FormSection>
</form>

{#if data.draft}
	{@const draft = data.draft}
	<Dialog bind:open={confirmPublish} title="Publish version {draft.version}" {consequence}>
		<p class="draft__body">
			Publishing freezes this text permanently and makes it the version that counts. Signatures
			against earlier versions stop satisfying the booking gate.
		</p>
		{#snippet actions()}
			<Button variant="ghost" onclick={() => (confirmPublish = false)}>Keep as draft</Button>
			<form method="POST" action="?/publish">
				<input type="hidden" name="versionId" value={draft.id} />
				<Button type="submit" variant="secondary">Publish version</Button>
			</form>
		{/snippet}
	</Dialog>
{/if}

<div><Button variant="ghost" size="sm" href="/admin/waivers">Back to waivers</Button></div>

<Toast bind:open={toast}>{$message}</Toast>

<style>
	.doc {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
	.doc__head {
		display: flex;
		align-items: baseline;
		gap: var(--space-4);
		flex-wrap: wrap;
	}
	.doc__title {
		margin: 0;
		font-size: var(--size-h3);
	}
	.doc__meta {
		color: var(--text-secondary);
		text-transform: uppercase;
		margin: 0;
	}
	.vers {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		border-top: var(--hairline);
	}
	.vers__row {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-3) 0;
		border-bottom: var(--hairline);
		flex-wrap: wrap;
	}
	.vers__n {
		color: var(--ink);
		font-weight: 600;
	}
	.vers__meta {
		color: var(--text-secondary);
		text-transform: uppercase;
	}
	.draft {
		max-width: 72ch;
	}
	.draft__actions {
		display: flex;
		gap: var(--space-3);
		align-items: center;
		flex-wrap: wrap;
	}
	.draft__body {
		margin: 0;
		font-size: var(--size-body-sm);
		line-height: var(--leading-body);
	}
</style>
