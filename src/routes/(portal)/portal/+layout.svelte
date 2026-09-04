<script lang="ts">
	import { page } from '$app/state';
	import PlayerSwitcher from '$lib/components/PlayerSwitcher.svelte';
	import { Button, Eyebrow, Tabs } from '$lib/ds';

	let { data, children } = $props();
	const tabs = [
		{ id: '/portal', label: 'Overview', href: '/portal' },
		{ id: '/portal/schedule', label: 'Schedule', href: '/portal/schedule' },
		{ id: '/portal/book', label: 'Book', href: '/portal/book' },
		{ id: '/portal/bookings', label: 'Bookings', href: '/portal/bookings' },
		{ id: '/portal/credits', label: 'Credits', href: '/portal/credits' },
		{ id: '/portal/players', label: 'Players', href: '/portal/players' },
		{ id: '/portal/waivers', label: 'Waivers', href: '/portal/waivers' },
		{ id: '/portal/account', label: 'Account', href: '/portal/account' }
	];
	const active = $derived(
		tabs
			.map((t) => t.id)
			.filter((id) => page.url.pathname === id || page.url.pathname.startsWith(id + '/'))
			.sort((a, b) => b.length - a.length)[0]
	);
	// Switching only means something where the page is about one player.
	const switchable = $derived(
		page.url.pathname === '/portal' || page.url.pathname === '/portal/players'
	);
</script>

<div class="portal">
	<header class="portal__head">
		<div class="portal__id">
			<Eyebrow ticks>Player portal</Eyebrow>
			<h1 class="mt-display portal__title">{data.account.full_name || data.account.email}</h1>
			{#if switchable}
				<PlayerSwitcher players={data.players} currentId={data.currentPlayer?.id} />
			{/if}
		</div>
		<form method="POST" action="/logout">
			<Button variant="ghost" size="sm" type="submit">Log out</Button>
		</form>
	</header>
	<Tabs items={tabs} {active} ariaLabel="Portal sections" />
	<main class="portal__main">{@render children()}</main>
</div>

<style>
	.portal {
		max-width: var(--container);
		margin: 0 auto;
		padding: var(--space-7) var(--space-6) var(--space-10); /* room for the fixed mobile tab bar */
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}
	.portal__head {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: var(--space-5);
		flex-wrap: wrap;
	}
	.portal__id {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
	.portal__title {
		margin: 0;
		font-size: var(--size-h2);
	}
	.portal__main {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}
	@media (max-width: 760px) {
		.portal {
			padding: var(--space-6) var(--space-4) var(--space-10);
		}
	}
</style>
