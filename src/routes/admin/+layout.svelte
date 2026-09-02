<script lang="ts">
	import { page } from '$app/state';
	import { Button, Eyebrow, Tabs } from '$lib/ds';

	let { children } = $props();
	// Phase 3 adds Schedule / Programs; 5 Purchases; 2 Waivers; 6 Ratings. Only built routes are linked.
	const tabs = [{ id: '/admin', label: 'Overview', href: '/admin' }];
	const active = $derived(tabs.find((t) => page.url.pathname.startsWith(t.id))?.id);
</script>

<div class="admin">
	<header class="admin__head">
		<div class="admin__id">
			<Eyebrow ticks>Admin</Eyebrow>
			<h1 class="mt-display admin__title">Momentum Tennis</h1>
		</div>
		<form method="POST" action="/logout">
			<Button variant="ghost" size="sm" type="submit">Log out</Button>
		</form>
	</header>
	<Tabs items={tabs} {active} ariaLabel="Admin sections" mobileMode="scroll" />
	<main class="admin__main">{@render children()}</main>
</div>

<style>
	.admin {
		max-width: var(--container);
		margin: 0 auto;
		padding: var(--space-7) var(--space-6) var(--space-9);
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}
	.admin__head {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: var(--space-5);
		flex-wrap: wrap;
	}
	.admin__id {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
	.admin__title {
		margin: 0;
		font-size: var(--size-h2);
	}
	.admin__main {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}
	@media (max-width: 760px) {
		.admin {
			padding: var(--space-6) var(--space-4) var(--space-8);
		}
	}
</style>
