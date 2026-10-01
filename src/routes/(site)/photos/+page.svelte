<script lang="ts">
	import { asset } from '$app/paths';
	import { EmptyState, Eyebrow, Lightbox, PhotoFrame } from '$lib/ds';

	let { data } = $props();
</script>

<svelte:head>
	<title>Photos · Momentum Tennis</title>
	<meta
		name="description"
		content="Matches, medals and practice at Momentum Tennis in Cupertino, from the academy's own archive."
	/>
</svelte:head>

<main class="ph">
	<header class="ph__head">
		<Eyebrow ticks>Photos</Eyebrow>
		<h1 class="mt-display ph__title">Photos</h1>
		<p class="ph__lede">Matches, medals and practice — from the academy's own archive.</p>
	</header>

	{#if data.photos.length === 0}
		<EmptyState ticks>PHOTOS ARRIVE AS RELEASES ARE SIGNED</EmptyState>
	{:else}
		<Lightbox>
			<ul class="ph__grid">
				{#each data.photos as p (p.src)}
					<li class="ph__item">
						<a
							class="ph__link"
							href={asset(p.src)}
							data-pswp-width={p.width}
							data-pswp-height={p.height}
						>
							<PhotoFrame src={p.src} alt={p.alt} ratio={p.ratio} focal={p.focal} />
						</a>
					</li>
				{/each}
			</ul>
		</Lightbox>
	{/if}
</main>

<style>
	.ph {
		max-width: var(--container);
		margin: 0 auto;
		padding: var(--space-8) var(--space-6) var(--space-9);
		display: flex;
		flex-direction: column;
		gap: var(--space-7);
	}
	.ph__head {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
	.ph__title {
		margin: 0;
		font-size: var(--size-h2);
	}
	.ph__lede {
		margin: 0;
		max-width: var(--measure);
		font-size: var(--size-body-lg);
		color: var(--text-secondary);
	}
	/* each photo at its own shape: columns rather than rows, so nothing is cropped to fit */
	.ph__grid {
		list-style: none;
		margin: 0;
		padding: 0;
		columns: 3;
		column-gap: var(--space-4);
	}
	.ph__item {
		break-inside: avoid;
		margin-bottom: var(--space-4);
	}
	.ph__link {
		display: block;
	}
	@media (max-width: 760px) {
		.ph {
			padding: var(--space-7) var(--space-4) var(--space-8);
		}
		.ph__grid {
			columns: 1;
		}
	}
</style>
