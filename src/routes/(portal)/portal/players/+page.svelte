<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import { Banner, Button, EmptyState, StatusChip } from '$lib/ds';

	let { data } = $props();
</script>

<svelte:head><title>Players · Momentum Tennis</title></svelte:head>

{#if data.playersError}
	<Banner tone="error">{data.playersError}</Banner>
{/if}

{#if data.players.length === 0}
	<EmptyState ticks>
		No players yet. Add everyone in your family who trains with us
		{#snippet action()}
			<Button href="/portal/players/new">Add your first player</Button>
		{/snippet}
	</EmptyState>
{:else}
	<Card>
		<ul class="roster">
			{#each data.players as p (p.id)}
				<li class="roster__row">
					<div class="roster__who">
						<span class="roster__name">{p.fullName}</span>
						<span class="mt-mono roster__meta">
							{p.levelLabel ?? 'Level not set'} · Age {p.age}
						</span>
					</div>
					<StatusChip status={p.isAdult ? 'adult' : 'minor'} />
					<Button variant="ghost" size="sm" href="/portal/players/{p.id}">Edit</Button>
				</li>
			{/each}
		</ul>
	</Card>
	<div>
		<Button variant="secondary" size="sm" href="/portal/players/new">Add a player</Button>
	</div>
{/if}

<style>
	.roster {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
	}
	.roster__row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		padding: var(--space-4) 0;
		border-bottom: var(--hairline);
		flex-wrap: wrap;
	}
	.roster__row:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}
	.roster__row:first-child {
		padding-top: 0;
	}
	.roster__who {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		flex: 1;
		min-width: 12ch;
	}
	.roster__name {
		font-size: var(--size-body);
		font-weight: 600;
		color: var(--ink);
	}
	.roster__meta {
		color: var(--text-secondary);
		text-transform: uppercase;
	}
</style>
