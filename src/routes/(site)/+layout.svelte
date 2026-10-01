<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { SiteNav } from '$lib/ds';
	import { CONTACT } from '$lib/content/site';

	let { data, children } = $props();

	const ACTIVE: Record<string, 'home' | 'calendar' | 'store'> = {
		'/(site)': 'home',
		'/(site)/schedule': 'calendar',
		'/(site)/store': 'store'
	};
	const active = $derived(ACTIVE[page.route.id ?? '']);
	const links = $derived({
		home: '/',
		juniors: '/#programs',
		camps: '/#camps',
		adults: '/#programs',
		jtt: '/#programs',
		calendar: '/schedule',
		store: '/store',
		login: data.loggedIn ? '/portal' : '/login',
		book: data.loggedIn ? '/portal/book' : '/login?next=/portal/book',
		logoSrc: '/logo-mark.svg'
	});
</script>

<SiteNav {active} loggedIn={data.loggedIn} {links} campNote={data.camp.note} />

{@render children()}

<footer class="ft">
	<div class="ft__inner">
		<img class="ft__logo" src="/logo.svg" alt="Momentum Tennis" />
		<nav class="ft__nav" aria-label="Footer">
			<a href="{resolve('/(site)')}#programs">Classes</a>
			<a href="{resolve('/(site)')}#programs">Team tennis</a>
			<a href="{resolve('/(site)')}#camps">Camps</a>
			<a href={resolve('/(site)/coaches')}>Coaches</a>
			<a href="{resolve('/(site)')}#performance">Performance</a>
			<a href="{resolve('/(site)')}#book">Contact</a>
		</nav>
		<div class="ft__facts">
			{#each CONTACT.addresses as line (line)}<span>{line}</span>{/each}
			<span>CALL OR WHATSAPP · {CONTACT.phone}</span>
			<span>© {data.year} {CONTACT.legalName}</span>
		</div>
	</div>
</footer>

<style>
	.ft {
		background: var(--surface-page);
		border-top: var(--hairline);
		padding: var(--space-7) 0;
	}
	.ft__inner {
		max-width: var(--container);
		margin: 0 auto;
		padding: 0 var(--space-6);
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--space-6);
		flex-wrap: wrap;
	}
	.ft__logo {
		height: 76px; /* ds-allow the kit's footer logo height */
		display: block;
	}
	.ft__nav {
		display: flex;
		gap: var(--space-5);
		flex-wrap: wrap;
	}
	.ft__nav a {
		display: inline-flex;
		align-items: center;
		min-height: var(--size-action);
		font-family: var(--font-sans);
		font-size: var(--size-label-sm);
		font-weight: var(--weight-bold);
		letter-spacing: var(--track-label);
		text-transform: uppercase;
		color: var(--ink);
		text-decoration: none;
	}
	.ft__nav a:hover {
		color: var(--court-500);
	}
	.ft__facts {
		display: flex;
		flex-direction: column;
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		line-height: 1.8;
		color: var(--text-secondary);
		text-align: right;
	}
	@media (max-width: 760px) {
		.ft__inner {
			padding: 0 var(--space-4);
			flex-direction: column;
		}
		.ft__facts {
			text-align: left;
		}
	}
</style>
