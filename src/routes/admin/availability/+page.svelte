<script lang="ts">
	import { resolve } from '$app/paths';
	import { superForm } from 'sveltekit-superforms';
	import {
		Banner,
		Button,
		EmptyState,
		Eyebrow,
		FormSection,
		Select,
		StatusChip,
		TextField
	} from '$lib/ds';

	let { data, form: action } = $props();
	// superforms takes the initial form value by design
	// svelte-ignore state_referenced_locally
	const {
		form: venue,
		errors: venueErrors,
		enhance: venueEnhance,
		message: venueMessage
	} = superForm(data.locationForm, { id: 'location', resetForm: true });
	// svelte-ignore state_referenced_locally
	const {
		form: court,
		errors: courtErrors,
		enhance: courtEnhance,
		message: courtMessage
	} = superForm(data.courtForm, { id: 'court', resetForm: true });
	const venueOptions = $derived(data.locations.map((l) => ({ value: l.id, label: l.name })));
</script>

<svelte:head><title>Availability · Momentum Tennis</title></svelte:head>

<div class="av">
	<Eyebrow ticks>Courts and reservation windows</Eyebrow>
	<p class="av__lead">
		A court has to be reserved with the venue first. Declaring the window here is what lets anything
		be scheduled on it.
	</p>

	{#if data.loadError}<Banner tone="error">{data.loadError}</Banner>{/if}
	{#if action?.courtError}<Banner tone="error">{action.courtError}</Banner>{/if}

	{#if data.locations.length === 0}
		<EmptyState ticks>No locations yet</EmptyState>
	{/if}

	{#each data.locations as l (l.id)}
		<section class="av__venue">
			<div class="av__venue-head">
				<h2 class="av__venue-name">{l.name}</h2>
				<StatusChip status={l.active ? 'active' : 'expired'} />
			</div>
			{#if l.address}<p class="av__address">{l.address}</p>{/if}

			{#if l.courts.length === 0}
				<EmptyState>NO COURTS AT THIS LOCATION</EmptyState>
			{:else}
				<ul class="av__courts">
					{#each l.courts as c (c.id)}
						<li class="av__court">
							<a
								class="av__court-name"
								href={resolve('/admin/availability/[courtId]', { courtId: c.id })}>{c.name}</a
							>
							<StatusChip status={c.active ? 'active' : 'expired'} />
							<form method="POST" action="?/toggleCourt">
								<input type="hidden" name="courtId" value={c.id} />
								<input type="hidden" name="active" value={c.active ? 'false' : 'true'} />
								<Button variant="ghost" size="sm" type="submit"
									>{c.active ? 'Deactivate' : 'Reactivate'}</Button
								>
							</form>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	{/each}

	<div class="av__forms">
		<form method="POST" action="?/location" use:venueEnhance>
			<FormSection eyebrow="Add a location" description="A venue the academy uses.">
				{#if $venueMessage}<Banner>{$venueMessage}</Banner>{/if}
				<TextField
					label="Name"
					name="name"
					bind:value={$venue.name}
					error={$venueErrors.name?.[0]}
				/>
				<TextField
					label="Address"
					name="address"
					bind:value={$venue.address}
					error={$venueErrors.address?.[0]}
				/>
				<div><Button type="submit" variant="secondary" size="sm">Add location</Button></div>
			</FormSection>
		</form>

		<form method="POST" action="?/court" use:courtEnhance>
			<FormSection eyebrow="Add a court" description="Courts belong to exactly one location.">
				{#if $courtMessage}<Banner>{$courtMessage}</Banner>{/if}
				<Select
					label="Location"
					name="locationId"
					placeholder="Choose one"
					options={venueOptions}
					bind:value={$court.locationId}
					error={$courtErrors.locationId?.[0]}
				/>
				<TextField
					label="Court name"
					name="name"
					bind:value={$court.name}
					error={$courtErrors.name?.[0]}
					help="As the venue names it, e.g. MP-1"
				/>
				<div><Button type="submit" variant="secondary" size="sm">Add court</Button></div>
			</FormSection>
		</form>
	</div>
</div>

<style>
	.av {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}
	.av__lead {
		margin: 0;
		max-width: var(--measure);
		font-size: var(--size-body-sm);
		color: var(--text-secondary);
	}
	.av__venue {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		border-top: var(--hairline);
		padding-top: var(--space-4);
	}
	.av__venue-head {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}
	.av__venue-name {
		margin: 0;
		font-size: var(--size-h4);
	}
	.av__address {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		color: var(--text-secondary);
	}
	.av__courts {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
	}
	.av__court {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-3) 0;
		border-bottom: var(--hairline);
	}
	.av__court-name {
		font-family: var(--font-mono);
		font-size: var(--size-body-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--link);
		flex: 1;
	}
	.av__forms {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* ds-allow form column floor */
		gap: var(--space-6);
		border-top: var(--hairline);
		padding-top: var(--space-5);
	}
</style>
