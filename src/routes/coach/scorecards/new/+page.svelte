<script lang="ts">
	import { resolve } from '$app/paths';
	import { superForm } from 'sveltekit-superforms';
	import {
		Banner,
		Button,
		DateField,
		Eyebrow,
		FormSection,
		SegmentedControl,
		Select,
		TextField,
		TimeField
	} from '$lib/ds';

	let { data } = $props();
	// superforms takes the initial form value by design
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form, { resetForm: false });
</script>

<svelte:head><title>New scorecard · Momentum Tennis</title></svelte:head>

<div class="scn">
	<div>
		<Eyebrow ticks>New scorecard</Eyebrow>
		<a class="scn__back" href={resolve('/coach/scorecards')}>All scorecards</a>
	</div>

	{#if data.loadError}<Banner tone="error">{data.loadError}</Banner>{/if}

	<form method="GET" class="scn__step">
		<Select
			label="Team"
			name="team"
			options={data.teams}
			placeholder="Choose a team"
			value={data.team?.id ?? ''}
		/>
		<Button variant="secondary" size="sm" type="submit">Choose team</Button>
	</form>

	{#if data.team}
		<form method="GET" class="scn__step">
			<input type="hidden" name="team" value={data.team.id} />
			<Select
				label="Scheduled match"
				name="session"
				options={data.matches}
				placeholder="None — type the header"
				value={data.sessionId}
				help="PICKING ONE FILLS THE HEADER BELOW"
			/>
			<Button variant="secondary" size="sm" type="submit">Use this match</Button>
		</form>

		<form method="POST" action="?/create" use:enhance>
			<input type="hidden" name="teamId" value={$form.teamId} />
			<input type="hidden" name="sessionId" value={$form.sessionId} />
			<FormSection
				eyebrow="The card"
				description="What the paper card prints at the top. Everything can be changed on the card itself."
			>
				{#if $message}<Banner tone="error">{$message}</Banner>{/if}
				{#if $errors._errors?.[0]}<Banner tone="error">{$errors._errors[0]}</Banner>{/if}
				<div class="scn__grid">
					<SegmentedControl
						label="Format"
						name="format"
						options={[
							{ value: 'two_court', label: '2 COURTS' },
							{ value: 'three_court', label: '3 COURTS' }
						]}
						bind:value={$form.format}
					/>
					<SegmentedControl
						label="Set to"
						name="setGames"
						options={[
							{ value: '4', label: '4 GAMES' },
							{ value: '6', label: '6 GAMES' }
						]}
						bind:value={$form.setGames}
					/>
					<SegmentedControl
						label="Momentum is"
						name="momentumSide"
						options={[
							{ value: 'home', label: 'HOME' },
							{ value: 'away', label: 'VISITING' }
						]}
						bind:value={$form.momentumSide}
					/>
					<TextField
						label="USTA match id"
						name="matchId"
						inputmode="numeric"
						bind:value={$form.matchId}
						error={$errors.matchId?.[0]}
						help="FROM THE SCORECARD HEADER · NEEDED TO FINALIZE"
						ballCaret={false}
					/>
					<DateField
						label="Date"
						name="playedOn"
						bind:value={$form.playedOn}
						error={$errors.playedOn?.[0]}
					/>
					<TimeField
						label="Time"
						name="startTime"
						bind:value={$form.startTime}
						error={$errors.startTime?.[0]}
					/>
					<TextField
						label="Division"
						name="division"
						bind:value={$form.division}
						error={$errors.division?.[0]}
						ballCaret={false}
					/>
					<TextField
						label="Home team"
						name="homeTeam"
						bind:value={$form.homeTeam}
						error={$errors.homeTeam?.[0]}
						ballCaret={false}
					/>
					<TextField
						label="Visiting team"
						name="awayTeam"
						bind:value={$form.awayTeam}
						error={$errors.awayTeam?.[0]}
						ballCaret={false}
					/>
					<TextField
						label="Location"
						name="location"
						bind:value={$form.location}
						error={$errors.location?.[0]}
						ballCaret={false}
					/>
				</div>
				<div><Button type="submit">Create card</Button></div>
			</FormSection>
		</form>
	{/if}
</div>

<style>
	.scn {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		max-width: 760px;
	}
	.scn__back {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--link);
		display: block;
		margin-top: var(--space-2);
	}
	.scn__step {
		display: flex;
		align-items: flex-end;
		gap: var(--space-3);
		flex-wrap: wrap;
	}
	.scn__grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
	}
	@media (max-width: 760px) {
		.scn__grid {
			grid-template-columns: 1fr;
		}
	}
</style>
