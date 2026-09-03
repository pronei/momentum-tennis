<script lang="ts">
	import { resolve } from '$app/paths';
	import { superForm } from 'sveltekit-superforms';
	import { Eyebrow, Select, SessionForm, TextField } from '$lib/ds';

	let { data } = $props();
	// superforms takes the initial form value by design
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, submitting } = superForm(data.form, { resetForm: false });

	const backHref = $derived(
		`${resolve('/admin/schedule')}?location=${data.locationId}&date=${$form.date || ''}`
	);
	const parents = $derived(
		data.parents[$form.type as keyof typeof data.parents] ??
			([] as { value: string; label: string }[])
	);
	const fieldErrors = $derived({
		type: $errors.type?.[0],
		courtId: $errors.courtId?.[0],
		coachId: $errors.coachId?.[0],
		date: $errors.date?.[0],
		start: $errors.start?.[0],
		end: $errors.end?.[0]
	});
	const TYPES = [
		{ value: 'class', label: 'Class' },
		{ value: 'camp', label: 'Camp' },
		{ value: 'team', label: 'Team' },
		{ value: 'private', label: 'Private' }
	];
</script>

<svelte:head><title>New session · Momentum Tennis</title></svelte:head>

<div class="new">
	<Eyebrow ticks>New session</Eyebrow>
	<nav class="new__types" aria-label="Session type">
		{#each TYPES as t (t.value)}
			<a
				class="new__type"
				class:new__type--on={t.value === $form.type}
				aria-current={t.value === $form.type ? 'page' : undefined}
				href="{resolve(
					'/admin/schedule/new'
				)}?type={t.value}&location={data.locationId}&date={$form.date || ''}">{t.label}</a
			>
		{/each}
	</nav>

	<form method="POST" use:enhance>
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
			submitLabel="Create session"
		>
			{#snippet extra()}
				{#if $form.type !== 'private'}
					<Select
						label="Belongs to"
						name="parentId"
						placeholder="Choose one"
						options={parents}
						bind:value={$form.parentId}
						error={$errors.parentId?.[0]}
						help={parents.length === 0 ? 'Nothing to attach to yet' : undefined}
					/>
				{/if}
				{#if $form.type === 'team'}
					<div class="new__team">
						<Select
							label="Kind"
							name="kind"
							options={[
								{ value: 'practice', label: 'Practice' },
								{ value: 'match', label: 'Match' }
							]}
							bind:value={$form.kind}
						/>
						<TextField
							label="Opponent"
							name="opponent"
							bind:value={$form.opponent}
							error={$errors.opponent?.[0]}
						/>
						<Select
							label="Home or away"
							name="homeAway"
							placeholder="—"
							options={[
								{ value: 'home', label: 'Home' },
								{ value: 'away', label: 'Away' }
							]}
							bind:value={$form.homeAway}
							error={$errors.homeAway?.[0]}
							help="Only an away match may have no court"
						/>
					</div>
				{/if}
			{/snippet}
		</SessionForm>
	</form>
</div>

<style>
	.new {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		max-width: 760px;
	}
	.new__types {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}
	.new__type {
		min-height: 44px; /* ds-allow the system's minimum hit target; no token below --size-action */
		display: inline-flex;
		align-items: center;
		padding: 0 var(--space-4);
		border: var(--hairline);
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--ink);
		text-decoration: none;
	}
	.new__type--on {
		border-color: var(--ink);
		background: var(--court-050);
		font-weight: var(--weight-medium);
	}
	.new__team {
		display: grid;
		grid-template-columns: repeat(
			auto-fit,
			minmax(160px, 1fr) /* ds-allow grid track floor, as SessionForm's own */
		);
		gap: var(--space-4);
	}
</style>
