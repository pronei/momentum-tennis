<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import { Banner, Button, EmptyState, StatusChip } from '$lib/ds';

	let { data } = $props();
	const player = $derived(data.currentPlayer);
</script>

<svelte:head><title>Portal · Momentum Tennis</title></svelte:head>

{#if data.playersError}
	<Banner tone="error">{data.playersError}</Banner>
{/if}

{#if data.reconsentNeeded && player}
	<Banner tone="error">
		{player.fullName} needs a signed waiver before booking.
		{#snippet action()}
			<Button variant="secondary" size="sm" href="/portal/waivers">Review and sign</Button>
		{/snippet}
	</Banner>
{/if}

{#if !player}
	<EmptyState ticks>
		No players yet. Add everyone in your family who trains with us — you can add more later
		{#snippet action()}
			<Button href="/portal/players/new">Add your first player</Button>
		{/snippet}
	</EmptyState>
{:else}
	<Card>
		<div class="sum">
			<div class="sum__head">
				<h2 class="mt-display sum__name">{player.fullName}</h2>
				<StatusChip status={player.isAdult ? 'adult' : 'minor'} />
			</div>
			<dl class="sum__facts">
				<div>
					<dt class="mt-mono">Ball level</dt>
					<dd class="mt-mono">{player.levelLabel ?? 'Not set — the academy sets it'}</dd>
				</div>
				<div>
					<dt class="mt-mono">Age</dt>
					<dd class="mt-mono">{player.age}</dd>
				</div>
				<div>
					<dt class="mt-mono">You are</dt>
					<dd class="mt-mono">
						{player.relationship === 'self' ? 'The player' : 'Their guardian'}
					</dd>
				</div>
			</dl>
			<div class="sum__actions">
				<Button variant="secondary" size="sm" href="/portal/players/{player.id}"
					>Edit profile</Button
				>
			</div>
		</div>
	</Card>
	<p class="mt-mono sum__note">
		Waivers, the schedule, credits and bookings arrive in the phases after this one.
	</p>
{/if}

<style>
	.sum {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}
	.sum__head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-4);
		flex-wrap: wrap;
	}
	.sum__name {
		margin: 0;
		font-size: var(--size-h3);
	}
	.sum__facts {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--space-5);
		margin: 0;
		border-top: var(--hairline);
		padding-top: var(--space-4);
	}
	.sum__facts dt {
		color: var(--text-secondary);
		text-transform: uppercase;
	}
	.sum__facts dd {
		margin: var(--space-2) 0 0;
		color: var(--ink);
		text-transform: uppercase;
	}
	.sum__note {
		color: var(--text-secondary);
		margin: 0;
	}
	@media (max-width: 760px) {
		.sum__facts {
			grid-template-columns: 1fr;
			gap: var(--space-4);
		}
	}
</style>
