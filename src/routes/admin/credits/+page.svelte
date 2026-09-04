<script lang="ts">
	import { resolve } from '$app/paths';
	import { superForm } from 'sveltekit-superforms';
	import {
		Banner,
		Button,
		DataTable,
		EmptyState,
		Eyebrow,
		FormSection,
		Select,
		TextField
	} from '$lib/ds';

	let { data } = $props();
	// superforms takes the initial form value by design
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form, { resetForm: false });

	const KINDS = [
		{ value: 'class_weekday', label: 'Weekday classes' },
		{ value: 'class_weekend', label: 'Weekend classes' },
		{ value: 'private_lesson', label: 'Private lessons' }
	];
	const columns = [
		{ key: 'on', label: 'Date', mono: true },
		{ key: 'player', label: 'Player' },
		{ key: 'kind', label: 'Credits' },
		{ key: 'delta', label: 'Granted', numeric: true },
		{ key: 'reason', label: 'Reason' }
	];
</script>

<svelte:head><title>Credits · Momentum Tennis</title></svelte:head>

<div class="gc">
	<Eyebrow ticks>Grant credits</Eyebrow>
	<p class="gc__lead">
		Grants go through the same issuance path a purchase will, so validity and the forgiven-skip
		allowance are snapshotted the same way. Every grant is audited.
	</p>

	{#if data.loadError}<Banner tone="error">{data.loadError}</Banner>{/if}

	<section>
		<Eyebrow>Find a player</Eyebrow>
		<form method="GET" class="gc__search">
			<TextField label="Search by name" name="q" value={data.query} />
			<Button variant="secondary" size="sm" type="submit">Search</Button>
		</form>
		{#if data.query && data.candidates.length === 0}
			<EmptyState>NO PLAYERS MATCH</EmptyState>
		{:else if data.candidates.length}
			<ul class="gc__players">
				{#each data.candidates as p (p.id)}
					<li class="gc__player">
						<span class="gc__name">{p.fullName}</span>
						<span class="gc__born">{p.birthdate}</span>
						<Button variant="ghost" size="sm" onclick={() => ($form.playerId = p.id)} type="button"
							>Choose</Button
						>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<form method="POST" use:enhance>
		<FormSection
			eyebrow="The grant"
			description="A reason is required — it is what the audit shows."
		>
			{#if $message}<Banner>{$message}</Banner>{/if}
			{#if $errors._errors?.length}<Banner tone="error">{$errors._errors[0]}</Banner>{/if}
			<input type="hidden" name="token" value={$form.token} />
			<TextField
				label="Player id"
				name="playerId"
				bind:value={$form.playerId}
				error={$errors.playerId?.[0]}
				help="Choose a player above, or paste an id"
			/>
			<div class="gc__grid">
				<Select
					label="Credits"
					name="kind"
					options={KINDS}
					bind:value={$form.kind}
					error={$errors.kind?.[0]}
				/>
				<TextField
					label="How many"
					name="quantity"
					bind:value={$form.quantity as unknown as string}
					error={$errors.quantity?.[0]}
				/>
			</div>
			<TextField
				label="Reason"
				name="reason"
				bind:value={$form.reason}
				error={$errors.reason?.[0]}
			/>
			<div><Button type="submit" variant="secondary" size="sm">Grant credits</Button></div>
		</FormSection>
	</form>

	<section>
		<Eyebrow>Recent grants</Eyebrow>
		<DataTable {columns} rows={data.recent} empty="NO GRANTS YET" mobileTitleKey="player" />
	</section>

	<a class="gc__back" href={resolve('/admin')}>Back to the console</a>
</div>

<style>
	.gc {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}
	.gc__lead {
		margin: 0;
		max-width: var(--measure);
		font-size: var(--size-body-sm);
		color: var(--text-secondary);
	}
	.gc__search {
		display: flex;
		align-items: flex-end;
		gap: var(--space-3);
		max-width: var(--measure);
	}
	.gc__players {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.gc__player {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-3) 0;
		border-bottom: var(--hairline);
	}
	.gc__name {
		flex: 1;
		font-size: var(--size-body-sm);
		color: var(--ink);
	}
	.gc__born,
	.gc__back {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}
	.gc__back {
		color: var(--link);
	}
	.gc__grid {
		display: grid;
		grid-template-columns: repeat(
			auto-fit,
			minmax(160px, 1fr) /* ds-allow field column floor, as SessionForm's own */
		);
		gap: var(--space-4);
	}
</style>
