<script lang="ts">
	/* Port of PlayerSwitcher from design-system/ui_kits/portal/portal-flows.jsx: a frame row of
	   names, the current one filled court-050 with an ink border. Rendered as links rather than
	   buttons so switching works without JS — which makes `aria-current` the right state
	   attribute for the element (the reference used `aria-pressed` on buttons).
	   The hrefs are query-only, so the browser keeps whatever path it is on. */
	type Player = { id: string; fullName: string };

	let { players = [], currentId }: { players?: Player[]; currentId?: string } = $props();
</script>

{#if players.length > 1}
	<div class="mt-switcher" role="group" aria-label="Player">
		<!-- A query-only href resolves against the current URL, so there is no path for
		     resolve() to prefix — the base-path bug the rule guards against cannot occur. -->
		<!-- eslint-disable svelte/no-navigation-without-resolve -->
		{#each players as p (p.id)}
			<a
				class="mt-switcher__opt"
				class:mt-switcher__opt--on={p.id === currentId}
				href="?player={p.id}"
				aria-current={p.id === currentId ? 'true' : undefined}>{p.fullName}</a
			>
		{/each}
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
	</div>
{/if}

<style>
	.mt-switcher {
		display: flex;
		gap: var(--space-1);
		flex-wrap: wrap;
	}
	.mt-switcher__opt {
		display: inline-flex;
		align-items: center;
		min-height: var(--size-action);
		padding: 0 var(--space-4);
		background: none;
		border: var(--hairline);
		border-radius: var(--radius-none);
		text-decoration: none;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		font-weight: var(--weight-regular);
		color: var(--ink);
	}
	.mt-switcher__opt:hover {
		border-color: var(--court-300);
	}
	.mt-switcher__opt--on {
		background: var(--court-050);
		border-color: var(--ink);
		font-weight: 600;
	}
</style>
