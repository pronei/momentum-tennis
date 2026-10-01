<script lang="ts">
	import { EmptyState, Eyebrow, PhotoFrame } from '$lib/ds';

	let { data } = $props();
</script>

<svelte:head>
	<title>Coaches · Momentum Tennis</title>
	<meta
		name="description"
		content="The coaches of Momentum Tennis in Cupertino: founder and director Artur Westergren and the team who teach classes, teams, camps and private lessons."
	/>
</svelte:head>

<main class="co">
	<header class="co__head">
		<Eyebrow ticks>Coaches</Eyebrow>
		<h1 class="mt-display co__title">Coaches</h1>
		<p class="co__lede">
			Classes, team practices, camps and private lessons — taught by this team.
		</p>
	</header>

	{#if data.coaches.length === 0}
		<EmptyState ticks>PROFILES ARRIVE AS RELEASES ARE SIGNED</EmptyState>
	{:else}
		{#each data.coaches as c (c.slug)}
			<article class="co__coach" class:co__coach--text={!c.photo}>
				{#if c.photo}
					<div class="co__portrait">
						<PhotoFrame
							src={c.photo}
							alt="Portrait of Coach {c.name}"
							ratio="3:4"
							focal="50% 25%"
							treatment="plain"
						/>
					</div>
				{/if}
				<div class="co__text">
					<h2 class="co__name">{c.name}</h2>
					<div class="co__role">{c.role}</div>
					{#each c.bio as paragraph, i (i)}<p class="co__bio">{paragraph}</p>{/each}
				</div>
			</article>
		{/each}
	{/if}
</main>

<style>
	.co {
		max-width: var(--container);
		margin: 0 auto;
		padding: var(--space-8) var(--space-6) var(--space-9);
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}
	.co__head {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
	.co__title {
		margin: 0;
		font-size: var(--size-h2);
	}
	.co__lede {
		margin: 0;
		max-width: var(--measure);
		font-size: var(--size-body-lg);
		color: var(--text-secondary);
	}
	.co__coach {
		display: grid;
		grid-template-columns: 1fr 2fr;
		gap: var(--space-7);
		align-items: start;
		padding-top: var(--space-7);
		border-top: var(--hairline);
	}
	.co__coach--text {
		grid-template-columns: 1fr;
	}
	.co__text {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		max-width: var(--measure);
	}
	.co__name {
		margin: 0;
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--size-h3);
		line-height: 1.05;
		letter-spacing: var(--track-display);
		text-transform: uppercase;
		color: var(--ink);
	}
	.co__role {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--court-500);
	}
	.co__bio {
		margin: 0;
		font-size: var(--size-body);
		line-height: var(--leading-body);
		color: var(--text-body);
	}
	@media (max-width: 760px) {
		.co {
			padding: var(--space-7) var(--space-4) var(--space-8);
			gap: var(--space-7);
		}
		.co__coach {
			grid-template-columns: 1fr;
			gap: var(--space-5);
			padding-top: var(--space-6);
		}
		.co__portrait {
			max-width: 20rem;
		}
	}
</style>
