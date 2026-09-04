<script lang="ts">
	import { page } from '$app/state';
	import { Button, Eyebrow, Tabs } from '$lib/ds';

	let { children } = $props();
	const tabs = [{ id: '/coach/sessions', label: 'Sessions', href: '/coach/sessions' }];
	const active = $derived(
		tabs.map((t) => t.id).find((id) => page.url.pathname.startsWith(id)) ?? '/coach/sessions'
	);
</script>

<div class="coach">
	<header class="coach__head">
		<div class="coach__id">
			<Eyebrow ticks>Coach</Eyebrow>
			<h1 class="mt-display coach__title">Momentum Tennis</h1>
		</div>
		<form method="POST" action="/logout">
			<Button variant="ghost" size="sm" type="submit">Log out</Button>
		</form>
	</header>
	<Tabs items={tabs} {active} ariaLabel="Coach sections" mobileMode="scroll" />
	<main class="coach__main">{@render children()}</main>
</div>

<style>
	.coach {
		max-width: var(--container);
		margin: 0 auto;
		padding: var(--space-7) var(--space-6) var(--space-9);
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}
	.coach__head {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: var(--space-5);
		flex-wrap: wrap;
	}
	.coach__id {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
	.coach__title {
		margin: 0;
		font-size: var(--size-h2);
	}
	.coach__main {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}
	@media (max-width: 760px) {
		.coach {
			padding: var(--space-6) var(--space-4) var(--space-8);
		}
	}
</style>
