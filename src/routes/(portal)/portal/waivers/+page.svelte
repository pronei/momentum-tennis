<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import { Banner, Button, EmptyState, StatusChip } from '$lib/ds';

	let { data } = $props();
	const player = $derived(data.currentPlayer);
</script>

<svelte:head><title>Waivers · Momentum Tennis</title></svelte:head>

{#if !player}
	<EmptyState ticks>
		Add a player first — waivers are signed for a named player
		{#snippet action()}
			<Button href="/portal/players/new">Add a player</Button>
		{/snippet}
	</EmptyState>
{:else if data.waiverStatus.length === 0}
	<EmptyState ticks>Nothing to sign yet for {player.fullName}</EmptyState>
{:else}
	{#if data.reconsentNeeded}
		<Banner tone="error">
			{player.fullName} cannot be booked until the current waiver is signed.
		</Banner>
	{/if}
	<Card>
		<ul class="docs">
			{#each data.waiverStatus as doc (doc.documentId)}
				<li class="docs__row">
					<div class="docs__who">
						<span class="docs__title">{doc.title}</span>
						<span class="mt-mono docs__meta">
							Version {doc.version}{doc.publishedAt
								? ` · published ${doc.publishedAt.slice(0, 10)}`
								: ''}
						</span>
					</div>
					<StatusChip status={doc.satisfied ? 'signed' : 'needs re-consent'} />
					<Button
						variant={doc.satisfied ? 'ghost' : 'secondary'}
						size="sm"
						href="/portal/waivers/{doc.versionId}?player={player.id}"
					>
						{doc.satisfied ? 'View' : 'Review and sign'}
					</Button>
				</li>
			{/each}
		</ul>
	</Card>
	<p class="mt-mono docs__note">
		A signature covers one named player and one exact version. A new version needs a new signature.
	</p>
{/if}

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
		flex: 1;
		min-width: 14ch;
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
	.docs__note {
		color: var(--text-secondary);
		margin: 0;
	}
</style>
