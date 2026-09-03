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
		TextField,
		TimeField
	} from '$lib/ds';

	let { data, form: action } = $props();
	// superforms takes the initial form value by design
	// svelte-ignore state_referenced_locally
	const {
		form: session,
		errors: sessionErrors,
		enhance: sessionEnhance,
		message: sessionMessage
	} = superForm(data.sessionForm, { id: 'teamSession', resetForm: false });

	const columns = [
		{ key: 'date', label: 'Date', mono: true },
		{ key: 'hours', label: 'Hours', mono: true },
		{ key: 'title', label: 'Session' },
		{ key: 'where', label: 'Where', mono: true },
		{ key: 'state', label: 'State', mono: true }
	];
</script>

<svelte:head><title>{data.team.name} · Teams</title></svelte:head>

<div class="team">
	<div>
		<Eyebrow ticks>{data.team.season}</Eyebrow>
		<h2 class="team__title">{data.team.name}</h2>
		<a class="team__back" href={resolve('/admin/teams')}>All teams</a>
	</div>

	{#if data.loadError}<Banner tone="error">{data.loadError}</Banner>{/if}
	{#if action?.rosterError}<Banner tone="error">{action.rosterError}</Banner>{/if}

	<section>
		<Eyebrow>Roster</Eyebrow>
		{#if data.roster.length === 0}
			<EmptyState>NO PLAYERS ON THIS TEAM</EmptyState>
		{:else}
			<ul class="team__roster">
				{#each data.roster as m (m.playerId)}
					<li class="team__member">
						<span class="team__name">{m.fullName}</span>
						<span class="team__level">{m.levelLabel ?? 'NO LEVEL'}</span>
						<form method="POST" action="?/remove">
							<input type="hidden" name="playerId" value={m.playerId} />
							<Button variant="ghost" size="sm" type="submit">Remove</Button>
						</form>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section>
		<Eyebrow>Add a player</Eyebrow>
		<form method="GET" class="team__search">
			<TextField label="Search by name" name="q" value={data.query} />
			<Button variant="secondary" size="sm" type="submit">Search</Button>
		</form>
		{#if data.query && data.candidates.length === 0}
			<EmptyState>NO PLAYERS MATCH — CHECK THE SPELLING</EmptyState>
		{:else}
			<ul class="team__roster">
				{#each data.candidates as p (p.id)}
					<li class="team__member">
						<span class="team__name">{p.fullName}</span>
						<span class="team__level">{p.birthdate}</span>
						<form method="POST" action="?/add">
							<input type="hidden" name="playerId" value={p.id} />
							<Button variant="ghost" size="sm" type="submit">Add</Button>
						</form>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section>
		<Eyebrow>Practices and matches</Eyebrow>
		<DataTable
			{columns}
			rows={data.sessions}
			empty="NOTHING SCHEDULED"
			rowHref={(row) => resolve('/admin/schedule/[id]', { id: String(row.id) })}
			mobileTitleKey="title"
		/>
	</section>

	<form method="POST" action="?/session" use:sessionEnhance>
		<FormSection
			eyebrow="Add a session"
			description="Only an away match may be scheduled without a court."
		>
			{#if $sessionMessage}<Banner>{$sessionMessage}</Banner>{/if}
			{#if $sessionErrors._errors?.length}<Banner tone="error">{$sessionErrors._errors[0]}</Banner
				>{/if}
			<div class="team__grid">
				<Select
					label="Kind"
					name="kind"
					options={[
						{ value: 'practice', label: 'Practice' },
						{ value: 'match', label: 'Match' }
					]}
					bind:value={$session.kind}
				/>
				<TextField
					label="Date"
					name="date"
					bind:value={$session.date}
					error={$sessionErrors.date?.[0]}
					help="YYYY-MM-DD"
				/>
				<TimeField
					label="Starts"
					name="start"
					bind:value={$session.start}
					error={$sessionErrors.start?.[0]}
				/>
				<TimeField
					label="Ends"
					name="end"
					bind:value={$session.end}
					error={$sessionErrors.end?.[0]}
				/>
				<Select
					label="Court"
					name="courtId"
					placeholder="None — away match"
					options={data.courts}
					bind:value={$session.courtId}
					error={$sessionErrors.courtId?.[0]}
				/>
				<TextField
					label="Opponent"
					name="opponent"
					bind:value={$session.opponent}
					error={$sessionErrors.opponent?.[0]}
				/>
				<Select
					label="Home or away"
					name="homeAway"
					placeholder="—"
					options={[
						{ value: 'home', label: 'Home' },
						{ value: 'away', label: 'Away' }
					]}
					bind:value={$session.homeAway}
					error={$sessionErrors.homeAway?.[0]}
				/>
				<TextField
					label="Venue note"
					name="venueNote"
					bind:value={$session.venueNote}
					error={$sessionErrors.venueNote?.[0]}
				/>
			</div>
			<div><Button type="submit" variant="secondary" size="sm">Add session</Button></div>
		</FormSection>
	</form>
</div>

<style>
	.team {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}
	.team__title {
		margin: var(--space-2) 0;
		font-size: var(--size-h4);
	}
	.team__back {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--link);
	}
	.team__roster {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.team__member {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-3) 0;
		border-bottom: var(--hairline);
	}
	.team__name {
		flex: 1;
		font-size: var(--size-body-sm);
		color: var(--ink);
	}
	.team__level {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}
	.team__search {
		display: flex;
		align-items: flex-end;
		gap: var(--space-3);
		max-width: var(--measure);
	}
	.team__grid {
		display: grid;
		grid-template-columns: repeat(
			auto-fit,
			minmax(160px, 1fr) /* ds-allow field column floor, as SessionForm's own */
		);
		gap: var(--space-4);
	}
</style>
