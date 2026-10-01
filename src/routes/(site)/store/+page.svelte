<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Banner, Button, EmptyState, Eyebrow, SegmentedControl, Select } from '$lib/ds';

	let { data } = $props();
	// superforms takes the initial form value by design
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance } = superForm(data.form, { resetForm: false });

	const packOptions = $derived(data.products.map((p) => ({ value: p.id, label: p.name })));
</script>

<svelte:head><title>Store · Momentum Tennis</title></svelte:head>

<main class="st">
	<header class="st__head">
		<Eyebrow ticks>Store</Eyebrow>
		<h1 class="mt-display st__title">Store</h1>
		<p class="st__lede">
			Class packs are bought for one player and drawn down one class at a time. Weekday packs redeem
			Monday to Friday, weekend packs Saturday and Sunday.
		</p>
	</header>

	{#if data.cancelled}
		<Banner>CHECKOUT CANCELLED — nothing was charged.</Banner>
	{/if}
	{#if data.loadError}<Banner tone="error">{data.loadError}</Banner>{/if}

	{#if data.products.length === 0}
		<EmptyState ticks>Nothing on sale right now</EmptyState>
	{:else}
		<ul class="st__packs">
			{#each data.products as p (p.id)}
				<li class="st__pack">
					<h2 class="st__name">{p.name}</h2>
					{#if p.memberPrice && data.signedIn}
						<p class="st__price">
							<span class="st__member">MEMBER PRICE</span>
							{p.memberPrice}
							<s class="st__was">{p.publicPrice}</s>
						</p>
					{:else}
						<p class="st__price">{p.publicPrice}</p>
					{/if}
					<p class="st__facts">{p.facts}</p>
					{#if p.description}<p class="st__copy">{p.description}</p>{/if}
				</li>
			{/each}
		</ul>

		{#if data.signedIn}
			{#if data.players.length === 0}
				<Banner>
					Add a player before buying — a pack belongs to the player who will use it.
					{#snippet action()}<Button size="sm" variant="ghost" href="/portal/players/new"
							>Add a player</Button
						>{/snippet}
				</Banner>
			{:else}
				<form method="POST" action="?/buy" use:enhance class="st__buy">
					{#if $errors._errors?.length}
						<Banner tone="error">{$errors._errors[0]}</Banner>
					{/if}
					<SegmentedControl
						label="Pack"
						name="productId"
						options={packOptions}
						bind:value={$form.productId}
						error={$errors.productId?.[0]}
						fullWidth
					/>
					<Select
						label="Player"
						name="playerId"
						options={data.players}
						placeholder="Choose a player"
						bind:value={$form.playerId}
						error={$errors.playerId?.[0]}
					/>
					<Button type="submit">Continue to payment</Button>
				</form>
			{/if}
		{:else}
			<div class="st__cta">
				<Button href="/login?next=/store">Log in to buy</Button>
			</div>
		{/if}
	{/if}
</main>

<style>
	.st {
		max-width: var(--container);
		margin: 0 auto;
		padding: var(--space-8) var(--space-6) var(--space-9);
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}
	.st__head {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
	.st__title {
		margin: 0;
		font-size: var(--size-h2);
	}
	.st__lede {
		margin: 0;
		max-width: var(--measure);
		font-size: var(--size-body-lg);
		color: var(--text-secondary);
	}
	.st__packs {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr) /* ds-allow card column floor */);
		gap: var(--space-4);
	}
	.st__pack {
		border: var(--hairline);
		padding: var(--space-5);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	.st__name {
		margin: 0;
		font-family: var(--font-sans);
		font-size: var(--size-h4);
		font-weight: var(--weight-bold);
		color: var(--ink);
	}
	.st__price {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--size-h3);
		color: var(--ink);
	}
	.st__member,
	.st__facts {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}
	.st__member {
		display: block;
	}
	.st__was {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		color: var(--text-secondary);
	}
	.st__facts {
		margin: 0;
	}
	.st__copy {
		margin: 0;
		font-size: var(--size-body-sm);
		color: var(--text-secondary);
	}
	.st__buy {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		max-width: var(--measure);
	}
	.st__cta {
		display: flex;
	}
	@media (max-width: 760px) {
		.st {
			padding: var(--space-7) var(--space-4) var(--space-8);
		}
		.st__packs {
			grid-template-columns: 1fr;
		}
	}
</style>
