<script lang="ts">
	import Button from '../core/Button.svelte';
	import Wordmark from '../brand/Wordmark.svelte';

	/* The site header: concise and hierarchical. Desktop: a Programs disclosure + first-class Calendar
	   and Store tabs, the account entry beside the one Book-a-trial action. Mobile (≤760px): logo +
	   Book pill + tri-colour hamburger (past cool → now warm) opening a full-screen court-navy sheet.
	   The reference picks one tree in JavaScript; a server render cannot, so both are in the markup and
	   CSS chooses at the system's one breakpoint. Programs is a <details>, so it opens without
	   JavaScript; the sheet needs it, as the reference's does. */
	type Links = Partial<
		Record<
			| 'home'
			| 'juniors'
			| 'camps'
			| 'adults'
			| 'jtt'
			| 'calendar'
			| 'store'
			| 'login'
			| 'book'
			| 'logoSrc',
			string
		>
	>;
	let {
		active = 'home',
		loggedIn = false,
		links = {},
		campNote = 'JUN – JUL'
	}: {
		/** Which tab is current */
		active?: 'home' | 'programs' | 'calendar' | 'store' | 'account';
		/** Shows "Account" instead of "Log in" */
		loggedIn?: boolean;
		/** Override hrefs: home, juniors, camps, adults, jtt, calendar, store, login, book, logoSrc */
		links?: Links;
		/** Mono note beside Summer camps — the season's state */
		campNote?: string;
	} = $props();

	const DEFAULT_LINKS = {
		home: '#top',
		juniors: '#programs',
		camps: '#camp-day',
		adults: '#programs',
		jtt: '#jtt',
		calendar: '#calendar',
		store: '#store',
		login: '#login',
		book: '#book',
		logoSrc: '/logo-mark.svg'
	};
	const L = $derived({ ...DEFAULT_LINKS, ...links });
	const current = (key: string) => (active === key ? 'page' : undefined);

	let menu: HTMLDetailsElement | undefined = $state();
	let menuOpen = $state(false);
	let sheet = $state(false);

	// Programs closes on a click outside it and on Escape, as the reference's dropdown does.
	$effect(() => {
		if (!menuOpen) return;
		const outside = (e: MouseEvent) => {
			if (menu && !menu.contains(e.target as Node)) menuOpen = false;
		};
		const esc = (e: KeyboardEvent) => {
			if (e.key === 'Escape') menuOpen = false;
		};
		document.addEventListener('mousedown', outside);
		document.addEventListener('keydown', esc);
		return () => {
			document.removeEventListener('mousedown', outside);
			document.removeEventListener('keydown', esc);
		};
	});

	// The sheet locks the page behind it and closes on Escape.
	$effect(() => {
		if (!sheet) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		const esc = (e: KeyboardEvent) => {
			if (e.key === 'Escape') sheet = false;
		};
		document.addEventListener('keydown', esc);
		return () => {
			document.body.style.overflow = prev;
			document.removeEventListener('keydown', esc);
		};
	});
</script>

<header class="mt-nav">
	<div class="mt-nav__bar mt-nav__bar--desktop">
		<a class="mt-nav__home" href={L.home} aria-label="Momentum Tennis home">
			<img class="mt-nav__logo" src={L.logoSrc} alt="" />
			<Wordmark variant="word" height={19} />
		</a>
		<nav class="mt-nav__primary" aria-label="Primary">
			<details class="mt-nav__dd" bind:this={menu} bind:open={menuOpen}>
				<summary class="mt-nav__tab" class:mt-nav__tab--active={active === 'programs'}
					>Programs <span class="mt-nav__caret" aria-hidden="true">{menuOpen ? '▴' : '▾'}</span
					></summary
				>
				<ul class="mt-nav__menu">
					<li><a href={L.juniors} onclick={() => (menuOpen = false)}>Classes</a></li>
					<li><a href={L.jtt} onclick={() => (menuOpen = false)}>Team tennis</a></li>
					<li><a href={L.adults} onclick={() => (menuOpen = false)}>Private lessons</a></li>
					<li class="mt-nav__menu-rule" aria-hidden="true"></li>
					<li>
						<a href={L.camps} onclick={() => (menuOpen = false)}
							>Summer camps <span class="mt-nav__note">{campNote}</span></a
						>
					</li>
				</ul>
			</details>
			<a
				class="mt-nav__tab"
				class:mt-nav__tab--active={active === 'calendar'}
				href={L.calendar}
				aria-current={current('calendar')}>Calendar</a
			>
			<a
				class="mt-nav__tab"
				class:mt-nav__tab--active={active === 'store'}
				href={L.store}
				aria-current={current('store')}>Store</a
			>
		</nav>
		<div class="mt-nav__end">
			<a
				class="mt-nav__login"
				class:mt-nav__login--active={active === 'account'}
				href={L.login}
				aria-current={current('account')}>{loggedIn ? 'Account' : 'Log in'}</a
			>
			<Button variant="secondary" size="sm" href={L.book}>Book a trial</Button>
		</div>
	</div>

	<div class="mt-nav__bar mt-nav__bar--mobile">
		<!-- logo + Book pill + hamburger, as PRODUCT.md §11 and the .d.ts specify: the reference also
		     sets a 16px wordmark here, which cannot fit beside the pill even at its own 390px mock -->
		<a class="mt-nav__home mt-nav__home--mobile" href={L.home} aria-label="Momentum Tennis home">
			<img class="mt-nav__logo mt-nav__logo--mobile" src={L.logoSrc} alt="" />
		</a>
		<div class="mt-nav__mobile-end">
			<Button variant="secondary" size="sm" href={L.book}>Book a trial</Button>
			<button
				type="button"
				class="mt-nav__burger"
				aria-expanded={sheet}
				aria-controls="mt-nav-sheet"
				aria-label={sheet ? 'Close menu' : 'Open menu'}
				onclick={() => (sheet = !sheet)}
			>
				<span class="mt-nav__bars">
					<span class="mt-nav__bar1" class:mt-nav__bar1--x={sheet}></span>
					<span class="mt-nav__bar2" class:mt-nav__bar2--x={sheet}></span>
					<span class="mt-nav__bar3" class:mt-nav__bar3--x={sheet}></span>
				</span>
			</button>
		</div>
		<div
			id="mt-nav-sheet"
			class="mt-nav__sheet on-field"
			role="dialog"
			aria-modal="true"
			aria-label="Site menu"
			hidden={!sheet}
		>
			<div class="mt-nav__group">Programs</div>
			<a class="mt-nav__sheet-link" href={L.juniors} onclick={() => (sheet = false)}>Classes</a>
			<a class="mt-nav__sheet-link" href={L.jtt} onclick={() => (sheet = false)}>Team tennis</a>
			<a class="mt-nav__sheet-link" href={L.adults} onclick={() => (sheet = false)}
				>Private lessons</a
			>
			<a class="mt-nav__sheet-small" href={L.camps} onclick={() => (sheet = false)}
				>Summer camps — {campNote}</a
			>
			<div class="mt-nav__divider"></div>
			<a class="mt-nav__sheet-link" href={L.calendar} onclick={() => (sheet = false)}>Calendar</a>
			<a class="mt-nav__sheet-link" href={L.store} onclick={() => (sheet = false)}>Store</a>
			<div class="mt-nav__divider"></div>
			<a class="mt-nav__sheet-small" href={L.login} onclick={() => (sheet = false)}
				>{loggedIn ? 'Account' : 'Log in'}</a
			>
			<div class="mt-nav__sheet-book">
				<Button href={L.book}>Book a free trial class</Button>
			</div>
		</div>
	</div>
</header>

<style>
	.mt-nav {
		position: sticky;
		top: 0;
		z-index: 20;
		border-bottom: 1px solid var(--border-hairline);
	}
	/* The blur lives on a layer behind the content, not on the header: a backdrop-filter makes its
	   element the containing block for fixed descendants, which would shut the mobile sheet inside
	   the 64px bar (as it does in the reference). */
	.mt-nav::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		background: rgba(247, 247, 247, 0.94);
		backdrop-filter: blur(6px);
	}
	.mt-nav__bar--desktop {
		max-width: var(--container);
		margin: 0 auto;
		padding: 0 32px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 72px;
	}
	.mt-nav__bar--mobile {
		display: none;
		padding: 0 8px 0 16px;
		align-items: center;
		justify-content: space-between;
		height: 64px;
	}
	.mt-nav__home {
		text-decoration: none;
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.mt-nav__home--mobile {
		gap: 10px;
	}
	.mt-nav__logo {
		height: 42px;
		display: block;
	}
	.mt-nav__logo--mobile {
		height: 36px;
	}
	.mt-nav__primary {
		display: flex;
		gap: 28px;
		align-items: center;
		align-self: stretch;
	}
	.mt-nav__tab,
	.mt-nav__menu a,
	.mt-nav__login,
	.mt-nav__sheet-small {
		font-family: var(--font-sans);
		font-size: var(--size-label);
		font-weight: 700;
		letter-spacing: var(--track-label);
		text-transform: uppercase;
	}
	.mt-nav__tab {
		color: var(--ink);
		text-decoration: none;
		padding: 25px 2px 23px;
		border-bottom: 2px solid transparent;
		cursor: pointer;
	}
	.mt-nav__tab--active {
		border-bottom-color: var(--ink);
	}
	.mt-nav__dd {
		position: relative;
		display: flex;
		align-self: stretch;
		align-items: center;
	}
	.mt-nav__dd summary {
		list-style: none;
	}
	.mt-nav__dd summary::-webkit-details-marker {
		display: none;
	}
	.mt-nav__caret {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		vertical-align: 2px;
	}
	.mt-nav__menu {
		position: absolute;
		top: 100%;
		left: -16px;
		min-width: 230px;
		margin: 0;
		padding: 6px 0;
		list-style: none;
		background: var(--white);
		border: 1px solid var(--border-hairline);
	}
	.mt-nav__menu a {
		display: block;
		padding: 11px 16px;
		color: var(--ink);
		text-decoration: none;
		white-space: nowrap;
	}
	.mt-nav__menu a:hover {
		background: var(--court-050);
	}
	.mt-nav__menu-rule {
		border-top: 1px solid var(--border-hairline);
		margin: 6px 0;
	}
	.mt-nav__note {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		letter-spacing: 0.05em;
		color: var(--court-400);
	}
	.mt-nav__end {
		display: flex;
		gap: 16px;
		align-items: center;
	}
	.mt-nav__login {
		color: var(--ink-secondary);
		text-decoration: none;
	}
	.mt-nav__login--active {
		color: var(--ink);
		text-decoration: underline;
		text-underline-offset: 6px;
	}
	.mt-nav__mobile-end {
		display: flex;
		flex: none;
		align-items: center;
		gap: 4px;
		white-space: nowrap;
	}
	.mt-nav__burger {
		flex: none;
		width: 44px;
		height: 44px;
		display: grid;
		place-items: center;
		background: none;
		border: none;
		cursor: pointer;
		position: relative;
		z-index: 60;
		padding: 0;
	}
	.mt-nav__bars {
		display: flex;
		flex-direction: column;
		gap: 5px;
		width: 22px;
	}
	.mt-nav__bar1,
	.mt-nav__bar2,
	.mt-nav__bar3 {
		height: 2px;
		border-radius: 1px;
		transition:
			transform 0.22s ease,
			background 0.22s ease,
			opacity 0.22s ease;
	}
	.mt-nav__bar1 {
		background: var(--court-300);
	}
	.mt-nav__bar2 {
		background: var(--court-500);
	}
	.mt-nav__bar3 {
		background: var(--now);
	}
	.mt-nav__bar1--x {
		background: var(--line-white);
		transform: translateY(7px) rotate(45deg);
	}
	.mt-nav__bar2--x {
		opacity: 0;
	}
	.mt-nav__bar3--x {
		background: var(--line-white);
		transform: translateY(-7px) rotate(-45deg);
	}
	.mt-nav__sheet {
		position: fixed;
		inset: 0;
		z-index: 50;
		background: var(--court-800);
		padding: 88px 24px 28px;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		animation: mt-sheet-in 0.24s ease-out;
	}
	.mt-nav__sheet[hidden] {
		display: none;
	}
	@keyframes mt-sheet-in {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.mt-nav__sheet {
			animation: none;
		}
	}
	.mt-nav__group {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--court-300);
		margin: 16px 0 2px;
	}
	.mt-nav__sheet-link {
		display: block;
		padding: 12px 0;
		font-family: var(--font-display);
		font-weight: 900;
		font-size: 1.75rem;
		line-height: 1.05;
		letter-spacing: 0.01em;
		text-transform: uppercase;
		color: var(--line-white);
		text-decoration: none;
	}
	.mt-nav__sheet-small {
		display: block;
		padding: 12px 0;
		color: var(--line-white);
		text-decoration: none;
	}
	.mt-nav__divider {
		height: 1px;
		background: rgba(247, 247, 247, 0.22);
		margin: 12px 0;
	}
	.mt-nav__sheet-book {
		margin-top: auto;
		padding-top: 24px;
	}
	@media (max-width: 760px) {
		.mt-nav__bar--desktop {
			display: none;
		}
		.mt-nav__bar--mobile {
			display: flex;
		}
	}
</style>
