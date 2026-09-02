<script lang="ts">
	import { Button, Eyebrow } from '$lib/ds';
</script>

<svelte:head><title>Momentum Tennis</title></svelte:head>

<main class="home">
	<Eyebrow ticks>Cupertino · De Anza College · Murdock Park</Eyebrow>
	<h1 class="mt-display home__title">Building players to win is our lifestyle.</h1>
	<p class="home__lede">
		Juniors and adults train mornings at De Anza College and weekday evenings at Murdock Park.
		Classes by ball level, USTA Junior Team Tennis, private lessons.
	</p>
	<div class="home__actions">
		<Button href="/login?next=/portal">Book a free trial class</Button>
		<Button variant="ghost" href="/styleguide">Design system</Button>
	</div>
	<p class="mt-mono home__note">
		PHASE 0 · FOUNDATIONS · THE HOMEPAGE KIT LANDS WITH THE SITE PHASE
	</p>
</main>

<style>
	.home {
		max-width: var(--container);
		margin: 0 auto;
		padding: var(--space-9) var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}
	.home__title {
		margin: 0;
		font-size: var(--size-display);
		max-width: 16ch;
	}
	.home__lede {
		margin: 0;
		max-width: var(--measure);
		font-size: var(--size-body-lg);
		color: var(--text-secondary);
	}
	.home__actions {
		display: flex;
		gap: var(--space-3);
		flex-wrap: wrap;
	}
	.home__note {
		color: var(--text-secondary);
		margin: var(--space-6) 0 0;
	}
	@media (max-width: 760px) {
		.home {
			padding: var(--space-7) var(--space-4);
		}
	}
</style>
