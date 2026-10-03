<script lang="ts">
	import { resolve } from '$app/paths';
	import NameField from '$lib/components/NameField.svelte';
	import ScoreField from '$lib/components/ScoreField.svelte';
	import {
		Banner,
		Button,
		DateField,
		Dialog,
		Eyebrow,
		FormSection,
		SegmentedControl,
		Select,
		StatusChip,
		TextArea,
		TextField,
		TimeField
	} from '$lib/ds';

	let { data, form } = $props();
	let deleting = $state(false);

	const fields = $derived(form?.fields ?? data.fields);
	const errors = $derived((form?.errors ?? {}) as Record<string, string | undefined>);
	const v = (k: string) => fields[k] ?? '';
	const final = $derived(data.card.status === 'final');
	const sides = ['home', 'away'] as const;
	const teamName = (side: 'home' | 'away') =>
		(side === 'home' ? v('homeTeam') : v('awayTeam')) || side.toUpperCase();
	const ours = (side: 'home' | 'away') => side === v('momentumSide');
	const games = (side: 'home' | 'away') => (side === 'home' ? 'hg' : 'ag');
	const resultOptions = $derived([{ value: '', label: 'From score' }, ...data.results]);
	const winnerOptions = $derived([
		{ value: '', label: 'From score' },
		{ value: 'home', label: teamName('home') },
		{ value: 'away', label: teamName('away') }
	]);
	// One string, so the mono line never carries the template's line breaks.
	const totalsLine = $derived(
		`GAMES WON · ${teamName('home').toUpperCase()} ${data.totals.home} · ${teamName('away').toUpperCase()} ${data.totals.away}`
	);
</script>

<svelte:head><title>{data.card.title} · Scorecards · Momentum Tennis</title></svelte:head>

<div class="sc">
	<div>
		<Eyebrow ticks>{data.card.playedOn} · {data.card.teamName}</Eyebrow>
		<h2 class="sc__title">{data.card.title}</h2>
		<a class="sc__back" href={resolve('/coach/scorecards')}>All scorecards</a>
	</div>

	<div class="sc__top">
		<StatusChip status={data.card.status.toUpperCase()} />
		{#if data.card.matchId}<span class="sc__mono">USTA {data.card.matchId}</span>{/if}
		{#if data.card.finalizedOn}<span class="sc__mono">FINAL · {data.card.finalizedOn}</span>{/if}
	</div>

	{#if data.loadError}<Banner tone="error">{data.loadError}</Banner>{/if}
	{#if form?.saveError}<Banner tone="error">{form.saveError}</Banner>{/if}
	{#if form?.finalizeError}<Banner tone="error">{form.finalizeError}</Banner>{/if}
	{#if form?.actionError}<Banner tone="error">{form.actionError}</Banner>{/if}
	{#if form?.saved}<Banner>SAVED</Banner>{/if}
	{#if form?.finalized}<Banner>FINAL · READY TO EXPORT</Banner>{/if}
	{#if form?.reopened}<Banner>REOPENED · DRAFT</Banner>{/if}

	<form method="POST" action="?/save" class="sc__form">
		<FormSection eyebrow="Match" description="What the card prints at the top.">
			<div class="sc__grid">
				<SegmentedControl
					label="Format"
					name="format"
					options={[
						{ value: 'two_court', label: '2 COURTS' },
						{ value: 'three_court', label: '3 COURTS' }
					]}
					value={v('format')}
					disabled={final}
				/>
				<SegmentedControl
					label="Set to"
					name="setGames"
					options={[
						{ value: '4', label: '4 GAMES' },
						{ value: '6', label: '6 GAMES' }
					]}
					value={v('setGames')}
					disabled={final}
				/>
				<SegmentedControl
					label="Momentum is"
					name="momentumSide"
					options={[
						{ value: 'home', label: 'HOME' },
						{ value: 'away', label: 'VISITING' }
					]}
					value={v('momentumSide')}
					disabled={final}
				/>
				<TextField
					label="USTA match id"
					name="matchId"
					inputmode="numeric"
					value={v('matchId')}
					error={errors.matchId}
					disabled={final}
					ballCaret={false}
				/>
				<DateField
					label="Date"
					name="playedOn"
					value={v('playedOn')}
					error={errors.playedOn}
					disabled={final}
				/>
				<TimeField
					label="Time"
					name="startTime"
					value={v('startTime')}
					error={errors.startTime}
					disabled={final}
				/>
				<TextField
					label="Division"
					name="division"
					value={v('division')}
					error={errors.division}
					disabled={final}
					ballCaret={false}
				/>
				<TextField
					label="Home team"
					name="homeTeam"
					value={v('homeTeam')}
					error={errors.homeTeam}
					disabled={final}
					ballCaret={false}
				/>
				<TextField
					label="Visiting team"
					name="awayTeam"
					value={v('awayTeam')}
					error={errors.awayTeam}
					disabled={final}
					ballCaret={false}
				/>
				<TextField
					label="Location"
					name="location"
					value={v('location')}
					error={errors.location}
					disabled={final}
					ballCaret={false}
				/>
			</div>
		</FormSection>

		{#each data.rounds as round (round.round)}
			<FormSection eyebrow="Round {round.round}">
				{#each round.lines as line (line.position)}
					<fieldset class="sc__line">
						<legend class="sc__pos">{line.label}</legend>
						{#each sides as side (side)}
							<div class="sc__side">
								<span class="sc__team">{teamName(side)}{ours(side) ? ' · MOMENTUM' : ''}</span>
								<NameField
									label="Player 1"
									name="{line.position}_{side}1"
									value={v(`${line.position}_${side}1`)}
									error={errors[`${line.position}_${side}1`]}
									suggestions={ours(side) ? data.suggestions : []}
									disabled={final}
								/>
								{#if line.doubles}
									<NameField
										label="Player 2"
										name="{line.position}_{side}2"
										value={v(`${line.position}_${side}2`)}
										error={errors[`${line.position}_${side}2`]}
										suggestions={ours(side) ? data.suggestions : []}
										disabled={final}
									/>
								{/if}
								<ScoreField
									label="Games"
									name="{line.position}_{games(side)}"
									value={v(`${line.position}_${games(side)}`)}
									error={errors[`${line.position}_${games(side)}`]}
									disabled={final}
								/>
							</div>
						{/each}
						<div class="sc__result">
							<Select
								label="Result"
								name="{line.position}_result"
								options={resultOptions}
								value={v(`${line.position}_result`)}
								error={errors[`${line.position}_result`]}
								disabled={final}
							/>
							<Select
								label="Winner"
								name="{line.position}_winner"
								options={winnerOptions}
								value={v(`${line.position}_winner`)}
								error={errors[`${line.position}_winner`]}
								disabled={final}
							/>
						</div>
					</fieldset>
				{/each}
			</FormSection>
		{/each}

		<FormSection eyebrow="Sportsmanship and notes">
			<div class="sc__grid">
				<TextField
					label="Home nominee"
					name="homeSportsmanship"
					value={v('homeSportsmanship')}
					error={errors.homeSportsmanship}
					disabled={final}
					ballCaret={false}
				/>
				<TextField
					label="Visiting nominee"
					name="awaySportsmanship"
					value={v('awaySportsmanship')}
					error={errors.awaySportsmanship}
					disabled={final}
					ballCaret={false}
				/>
			</div>
			<TextArea label="Notes" name="notes" rows={2} value={v('notes')} disabled={final} />
		</FormSection>

		<p class="sc__totals">{totalsLine}</p>

		{#if !final}
			<ul class="sc__ready" aria-label="Before finalizing">
				{#if data.readiness.length === 0}<li>READY TO FINALIZE</li>{/if}
				{#each data.readiness as r (r)}<li>{r}</li>{/each}
			</ul>
			<div class="sc__actions">
				<Button type="submit" variant="secondary">Save</Button>
				<Button type="submit" formaction="?/finalize">Finalize</Button>
				{#if data.isAdmin}
					<Button type="button" variant="ghost" onclick={() => (deleting = true)}
						>Delete draft</Button
					>
				{/if}
			</div>
			<p class="sc__note">
				FINALIZING SAVES THE CARD AND LOCKS IT · ONLY AN ADMINISTRATOR CAN REOPEN IT
			</p>
		{/if}
	</form>

	{#if final}
		<div class="sc__actions">
			<Button href={resolve('/coach/scorecards/[id]/export', { id: data.card.id })}
				>Export JSON</Button
			>
			{#if data.isAdmin}
				<form method="POST" action="?/reopen">
					<Button type="submit" variant="secondary">Reopen</Button>
				</form>
			{/if}
		</div>
	{/if}
</div>

<Dialog
	bind:open={deleting}
	title="Delete this draft"
	consequence="THE CARD AND ITS EIGHT LINES ARE REMOVED"
>
	<p class="sc__body">A draft nobody needs. A final card cannot be deleted; reopen it first.</p>
	{#snippet actions()}
		<Button variant="ghost" onclick={() => (deleting = false)}>Keep it</Button>
		<form method="POST" action="?/delete">
			<Button type="submit" variant="secondary">Delete draft</Button>
		</form>
	{/snippet}
</Dialog>

<style>
	.sc {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		max-width: 760px;
	}
	.sc__title {
		margin: var(--space-2) 0;
		font-size: var(--size-h4);
	}
	.sc__back,
	.sc__mono,
	.sc__pos,
	.sc__team,
	.sc__totals,
	.sc__ready,
	.sc__note {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
	}
	.sc__back {
		color: var(--link);
		display: block;
		margin-top: var(--space-2);
	}
	.sc__mono,
	.sc__team,
	.sc__ready,
	.sc__note {
		color: var(--text-secondary);
	}
	.sc__top {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		flex-wrap: wrap;
	}
	.sc__form {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}
	.sc__grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
	}
	.sc__line {
		margin: 0;
		padding: var(--space-4) 0;
		border: 0;
		border-top: var(--hairline);
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
	}
	.sc__pos {
		padding: 0;
		color: var(--ink);
		font-weight: var(--weight-bold);
	}
	.sc__side {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
	.sc__result {
		grid-column: 1 / -1;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
	}
	.sc__totals {
		margin: 0;
		color: var(--ink);
		border-top: var(--hairline);
		padding-top: var(--space-4);
	}
	.sc__ready {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
	.sc__note {
		margin: 0;
	}
	.sc__actions {
		display: flex;
		gap: var(--space-3);
		flex-wrap: wrap;
	}
	.sc__body {
		font-size: var(--size-body);
		color: var(--ink);
		margin: 0 0 var(--space-4);
	}
	@media (max-width: 760px) {
		.sc__grid,
		.sc__line,
		.sc__result {
			grid-template-columns: 1fr;
		}
	}
</style>
