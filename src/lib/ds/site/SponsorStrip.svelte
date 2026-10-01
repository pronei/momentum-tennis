<script lang="ts">
	/* Intentional addition (design-system/readme.md): the partners strip the homepage carries between
	   Performance and the quote. No reference component existed; it is written in the system's own
	   vocabulary — hairline rules, a mono label, logos in ink at one height. A logo links out only
	   when given an address. */
	type Sponsor = { name: string; src: string; href?: string };
	let { sponsors = [], label = 'Partners' }: { sponsors?: Sponsor[]; label?: string } = $props();
</script>

<section class="mt-sponsors" aria-label="Partners">
	<span class="mt-sponsors__label">{label}</span>
	<ul class="mt-sponsors__list">
		{#each sponsors as s (s.name)}
			<li class="mt-sponsors__item">
				{#if s.href}
					<a class="mt-sponsors__link" href={s.href} rel="noopener"
						><img class="mt-sponsors__logo" src={s.src} alt={s.name} /></a
					>
				{:else}
					<img class="mt-sponsors__logo" src={s.src} alt={s.name} />
				{/if}
			</li>
		{/each}
	</ul>
</section>

<style>
	.mt-sponsors {
		display: flex;
		align-items: center;
		gap: var(--space-6);
		flex-wrap: wrap;
		padding: var(--space-5) 0;
		border-top: 1px solid var(--border-hairline);
		border-bottom: 1px solid var(--border-hairline);
	}
	.mt-sponsors__label {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}
	.mt-sponsors__list {
		display: flex;
		align-items: center;
		gap: var(--space-7);
		flex-wrap: wrap;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.mt-sponsors__item {
		display: flex;
	}
	/* ink at rest: one weight for every partner, whatever their brand colours */
	.mt-sponsors__logo {
		display: block;
		height: 32px;
		width: auto;
		max-width: 160px;
		object-fit: contain;
		filter: grayscale(1) contrast(1.1);
		opacity: 0.78;
	}
	.mt-sponsors__link {
		display: flex;
		min-height: 44px;
		align-items: center;
	}
	.mt-sponsors__link:hover .mt-sponsors__logo,
	.mt-sponsors__link:focus-visible .mt-sponsors__logo {
		filter: none;
		opacity: 1;
	}
</style>
