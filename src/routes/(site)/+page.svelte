<script lang="ts">
	import { resolve } from '$app/paths';
	import {
		Button,
		ClassTimeline,
		Eyebrow,
		FrameTicks,
		PhotoFrame,
		ProgramCard,
		SponsorStrip,
		StrobeArc
	} from '$lib/ds';
	import { publishedCoaches } from '$lib/content/coaches';
	import { publishedPhotos } from '$lib/content/photos';
	import { CONTACT, SITE_STATS as S } from '$lib/content/site';
	import { SPONSORS } from '$lib/content/sponsors';

	// The homepage, ported from design-system/templates/homepage and ui_kits/website/sections.jsx:
	// hero → film → programs (+ the seasonal camp banner) → inside a class → photos → performance →
	// partners → quote → book. The drawn StrobeArc lives only in the class band (readme removal pass).
	let { data } = $props();
	const book = $derived(data.loggedIn ? '/portal/book' : '/login?next=/portal/book');
	const row = publishedPhotos().slice(0, 6);
	const coaches = publishedCoaches();
</script>

<svelte:head>
	<title>Momentum Tennis · Cupertino junior and adult tennis</title>
	<meta
		name="description"
		content="Tennis training for juniors and adults at De Anza College and Murdock Park, Cupertino: classes by ball level, USTA Junior Team Tennis, private lessons and summer camps."
	/>
</svelte:head>

<main id="top">
	<section class="hero">
		<div class="wrap hero__grid">
			<div class="hero__text">
				<Eyebrow ticks>Cupertino · De Anza College &amp; Murdock Park</Eyebrow>
				<h1 class="hero__title">Learn to see<br />your own motion.</h1>
				<p class="hero__lede">
					Tennis training for juniors and adults, one frame at a time — small groups, match play
					every week, and coaching centered on your comprehension.
				</p>
				<div class="hero__actions">
					<Button href={book}>Book a free trial class</Button>
					<Button variant="ghost" href="#programs">Explore programs</Button>
				</div>
				<div class="hero__note">
					PTR-CERTIFIED COACHES · USTA JUNIOR TEAM TENNIS · SUMMER CAMPS AT DE ANZA COLLEGE
				</div>
			</div>
			<PhotoFrame
				src="/photos/net-rally-l.webp"
				alt="A junior team lined up at the net with racquets"
				ratio="4:3"
				treatment="slice"
				focal="50% 45%"
				tag="MURDOCK PARK"
				caption="Rallies & games — green ball"
				captionRight="THU · t0 →"
			/>
		</div>
	</section>

	<!-- the hero film's slot: a labelled placeholder until the slow-mo footage exists (PRODUCT.md §12) -->
	<section class="film" aria-label="Film">
		<div class="wrap">
			<div class="film__frame">
				<span class="film__ann film__ann--tl">PLACEHOLDER — CINEMATIC SLOW-MO FILM</span>
				<span class="film__ann film__ann--tr">16:9 · 0:40 LOOP · MUTED</span>
				<span class="film__ann film__ann--bl"
					>SHOT LIST: SERVE FOLLOW-THROUGH · BALL AT CONTACT · SPLIT-STEP · 120 FPS</span
				>
				<span class="film__ann film__ann--br">t0 →</span>
				<span class="film__pill" aria-hidden="true">Play the film</span>
				<span class="film__caption">YOUR SWING AT 120 FPS — FOOTAGE IN PRODUCTION</span>
			</div>
		</div>
	</section>

	<section id="programs" class="programs">
		<div class="wrap">
			<div class="section-head">
				<Eyebrow ticks>Programs</Eyebrow>
				<h2 class="h2">Classes. Team tennis.<br />Private lessons.</h2>
			</div>
			<div class="programs__grid">
				<ProgramCard
					eyebrow="Weekly"
					title="Classes"
					level="Orange → Yellow ball"
					location="De Anza · Murdock Park"
					photo="/photos/racquets-up-l.webp"
					photoAlt="Juniors raising their racquets on court"
					photoFocal="50% 42%"
					schedule={[
						{ days: 'Sat & Sun', time: '2h classes', detail: 'De Anza' },
						{ days: 'Mon · Tue · Thu', time: '1.5h classes', detail: 'Murdock' }
					]}
					note="Groups by ball level, juniors and adults. Every class runs the same three blocks — times are set by the academy each season."
					ctaLabel="See class times"
					ctaHref="/schedule"
				/>
				<ProgramCard
					eyebrow="USTA JTT"
					title="Team tennis"
					level="Multiple Momentum teams"
					location="Bay Area league"
					photo="/photos/champs-banner-l.webp"
					photoAlt="Momentum teams and coaches under a Junior Team Tennis Championship banner"
					photoFocal="50% 55%"
					schedule={[
						{ days: 'Fall & spring', time: 'League season' },
						{ days: 'Matches', time: 'Public schedule', detail: 'Bay Area' }
					]}
					note="USTA Junior Team Tennis against some twenty Bay Area clubs. Competing is part of the curriculum, not a graduation from it."
					ctaLabel="JTT match schedule"
					ctaHref="/schedule"
				/>
				<ProgramCard
					eyebrow="1-on-1"
					title="Private lessons"
					level="All levels"
					location="De Anza · Murdock Park"
					photo="/photos/court-walk-l.webp"
					photoAlt="Four players with medals and racquet bags on court"
					photoFocal="50% 50%"
					schedule={[{ days: 'By appointment', time: '60 / 90 min' }]}
					note="One court, one player, one plan — most lessons taught by head coach Artur Westergren himself."
					ctaLabel="Ask about availability"
					ctaHref="#book"
				/>
			</div>
			<div id="camps" class="camps on-field">
				<div class="camps__text">
					<span class="camps__label">Seasonal — {data.camp.label}</span>
					<span class="camps__blurb">{data.camp.blurb}</span>
				</div>
				<div class="camps__when">
					<span class="camps__window">{data.camp.window}</span>
					<span class="camps__status">{data.camp.status} · 2ND WEEK OF JUNE – END OF JULY</span>
				</div>
			</div>
		</div>
	</section>

	<section id="class" class="class on-field">
		<div class="wrap class__grid">
			<div class="class__text">
				<Eyebrow onField>Inside a class</Eyebrow>
				<h2 class="h2 h2--field">Play by play of your time on court.</h2>
				<p class="class__lede">
					Every class runs the same three blocks — technique, applied drills, live play. The
					structure never changes; the work inside it does, layer by layer, across a four-year
					physical progression.
				</p>
				<div class="class__note">
					WEEKENDS 2H (40-MIN BLOCKS) · WEEKDAYS 1.5H (30-MIN BLOCKS) · TIMES SET BY THE ACADEMY
					EACH SEASON
				</div>
				<StrobeArc tone="field" annotate frames={8} height={150} />
			</div>
			<div class="class__card"><ClassTimeline /></div>
		</div>
	</section>

	{#if row.length}
		<section class="photos" aria-labelledby="photos-head">
			<div class="wrap">
				<div class="photos__head">
					<Eyebrow ticks><span id="photos-head">On court</span></Eyebrow>
				</div>
				<ul class="photos__row">
					{#each row as p (p.src)}
						<li><PhotoFrame src={p.src} alt={p.alt} ratio="1:1" focal={p.focal} /></li>
					{/each}
				</ul>
			</div>
		</section>
	{/if}

	<section id="performance" class="performance">
		<div class="wrap">
			<div class="section-head">
				<Eyebrow ticks>Results</Eyebrow>
				<h2 class="h2">Sneak peek<br />at our performance.</h2>
			</div>
			<div class="stats stats--three">
				<div class="stat stat--field on-field">
					<img class="stat__mark" src="/logo-mark-field.svg" alt="" />
					<div class="stat__num stat__num--light">{S.dualWins}</div>
					<div class="stat__cap stat__cap--field">Dual match wins</div>
					<div class="stat__stamp stat__stamp--field">{S.range}</div>
				</div>
				<div class="stat stat--blue on-field">
					<div class="stat__num stat__num--light">{S.leagues}</div>
					<div class="stat__cap stat__cap--blue">League championships</div>
					<div class="stat__stamp stat__stamp--blue">{S.range}</div>
				</div>
				<div class="stat stat--white">
					<div class="stat__num">{S.top3}</div>
					<div class="stat__cap">Top 3 finishes</div>
					<div class="stat__stamp">{S.range}</div>
				</div>
			</div>
			<div class="stats stats--two">
				<div class="winpct">
					<div
						class="winpct__ring"
						role="img"
						aria-label="{S.winPct} percent overall winning percentage"
						style:background="conic-gradient(var(--court-500) 0 {S.winPct}%, var(--court-100) {S.winPct}%
						100%)"
					>
						<div class="winpct__hole">{S.winPct}%</div>
					</div>
					<div class="winpct__text">
						<div class="stat__cap">Overall winning percentage</div>
						<div class="stat__stamp">{S.range}</div>
					</div>
				</div>
				<div class="stat stat--field on-field">
					<div class="pair">
						<div class="pair__half pair__half--rule">
							<div class="stat__num stat__num--light">{S.seasons}</div>
							<div class="stat__cap stat__cap--field">Unique team seasons</div>
						</div>
						<div class="pair__half">
							<div class="stat__num stat__num--light">{S.ratio}</div>
							<div class="stat__cap stat__cap--field">Win / loss ratio</div>
						</div>
					</div>
					<div class="stat__stamp stat__stamp--field">{S.range}</div>
				</div>
			</div>
			<div class="coaches-line">
				<a class="coaches-line__text" href={resolve('/(site)/coaches')}
					>COACHES — {coaches
						.map((c) => `${c.name.toUpperCase()} (${c.role.toUpperCase()})`)
						.join(' · ')} →</a
				>
				<Button variant="secondary" size="sm" href="/schedule">JTT match schedule</Button>
			</div>
			<div class="partners"><SponsorStrip sponsors={SPONSORS} /></div>
		</div>
	</section>

	<section class="quote" aria-label="From the head coach">
		<div class="quote__inner">
			<FrameTicks />
			<blockquote class="quote__text">
				“If our students aren’t improving — we aren’t growing as coaches.”
			</blockquote>
			<div class="quote__by">ARTUR WESTERGREN · HEAD COACH</div>
		</div>
	</section>

	<section id="book" class="book on-field">
		<div class="wrap book__inner">
			<img class="book__mark" src="/logo-mark-field.svg" alt="" />
			<h2 class="h2 h2--field book__title">Book a free trial class.</h2>
			<p class="book__lede">
				One session on court with a PTR-certified coach. See where your game is now — and what the
				next frame looks like.
			</p>
			<div class="book__actions">
				<Button href={book}>Book a free trial class</Button>
				<span class="book__phone">CALL OR WHATSAPP · {CONTACT.phone}</span>
			</div>
		</div>
	</section>
</main>

<style>
	.wrap {
		max-width: var(--container);
		margin: 0 auto;
		padding: 0 var(--space-6);
	}
	.section-head {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		margin-bottom: var(--space-7);
	}
	.h2 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--size-h2);
		line-height: 1.04;
		letter-spacing: var(--track-display);
		text-transform: uppercase;
		color: var(--ink);
	}
	.h2--field {
		color: var(--line-white);
	}
	.on-field {
		background: var(--surface-field);
	}

	/* hero */
	.hero {
		background: var(--surface-page);
	}
	.hero__grid {
		display: grid;
		grid-template-columns: 1.05fr 0.95fr;
		gap: var(--space-8);
		align-items: center;
		padding-top: var(--space-9);
		padding-bottom: var(--space-8);
	}
	.hero__text {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}
	.hero__title {
		margin: 0;
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--size-display-xl);
		line-height: var(--leading-display);
		letter-spacing: var(--track-display);
		text-transform: uppercase;
		color: var(--ink);
	}
	.hero__lede {
		margin: 0;
		font-size: var(--size-body-lg);
		line-height: var(--leading-body);
		color: var(--text-secondary);
		max-width: 46ch;
	}
	.hero__actions {
		display: flex;
		gap: var(--space-4);
		align-items: center;
		flex-wrap: wrap;
	}
	.hero__note {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.06em;
		color: var(--text-secondary);
		border-top: var(--hairline);
		padding-top: var(--space-4);
	}

	/* film */
	.film {
		background: var(--surface-page);
		padding-bottom: var(--space-9);
	}
	.film__frame {
		position: relative;
		aspect-ratio: 16 / 9;
		background: var(--court-900);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-4);
		overflow: hidden;
	}
	.film__ann {
		position: absolute;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.07em;
		color: var(--court-300);
		text-transform: uppercase;
	}
	.film__ann--tl {
		top: var(--space-3);
		left: var(--space-4);
	}
	.film__ann--tr {
		top: var(--space-3);
		right: var(--space-4);
		text-align: right;
	}
	.film__ann--bl {
		bottom: var(--space-3);
		left: var(--space-4);
	}
	.film__ann--br {
		bottom: var(--space-3);
		right: var(--space-4);
	}
	.film__pill {
		height: var(--size-action);
		padding: 0 var(--space-5);
		display: inline-flex;
		align-items: center;
		border-radius: var(--radius-action);
		border: 1px solid var(--line-white); /* ds-allow the kit's outlined pill on the film */
		color: var(--line-white);
		font-family: var(--font-sans);
		font-size: var(--size-label);
		font-weight: var(--weight-bold);
		letter-spacing: var(--track-label);
		text-transform: uppercase;
	}
	.film__caption {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.07em;
		color: var(--court-200);
		text-align: center;
		padding: 0 var(--space-4);
	}

	/* programs */
	.programs {
		background: var(--surface-card);
		border-top: var(--hairline);
		padding: var(--space-9) 0;
	}
	.programs__grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-5);
		align-items: stretch;
	}
	.camps {
		margin-top: var(--space-5);
		padding: var(--space-5) var(--space-6);
		display: flex;
		gap: var(--space-6);
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
	}
	.camps__text {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		flex: 1 1 20rem;
	}
	.camps__label {
		font-family: var(--font-sans);
		font-size: var(--size-label-sm);
		font-weight: var(--weight-bold);
		letter-spacing: var(--track-label);
		text-transform: uppercase;
		color: var(--court-300);
	}
	.camps__blurb {
		font-size: var(--size-body-sm);
		line-height: 1.5;
		color: var(--text-on-field-dim);
	}
	.camps__when {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		align-items: flex-end;
	}
	.camps__window {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		color: var(--line-white);
	}
	.camps__status {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		color: var(--court-300);
	}

	/* inside a class */
	.class {
		padding: var(--space-9) 0;
	}
	.class__grid {
		display: grid;
		grid-template-columns: 0.9fr 1.1fr;
		gap: var(--space-8);
		align-items: center;
	}
	.class__text {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}
	.class__lede {
		margin: 0;
		font-size: var(--size-body);
		line-height: 1.6;
		color: var(--text-on-field-dim);
		max-width: 44ch;
	}
	.class__note {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.06em;
		color: var(--text-on-field-dim);
	}
	.class__card {
		background: var(--surface-card);
		border: var(--hairline);
		padding: var(--space-5);
	}

	/* photos */
	.photos {
		background: var(--surface-page);
		padding: var(--space-9) 0 0;
	}
	.photos__head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-4);
		margin-bottom: var(--space-5);
	}
	.photos__row {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: var(--space-3);
	}

	/* performance */
	.performance {
		background: var(--surface-page);
		border-top: var(--hairline);
		padding: var(--space-9) 0;
	}
	.photos + .performance {
		border-top: none;
	}
	.stats {
		display: grid;
		gap: var(--space-5);
	}
	.stats--three {
		grid-template-columns: repeat(3, 1fr);
	}
	.stats--two {
		grid-template-columns: 1fr 2fr;
		margin-top: var(--space-5);
	}
	.stat {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-5) var(--space-5) var(--space-4);
		min-height: 12.5rem;
		box-sizing: border-box;
	}
	.stat--field {
		background: var(--court-800);
	}
	.stat--blue {
		background: var(--court-500);
	}
	.stat--white {
		background: var(--white);
		border: var(--hairline);
	}
	.stat__mark {
		height: var(--space-6);
		align-self: flex-start;
	}
	.stat__num {
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: clamp(2.75rem, 4.2vw, 3.75rem);
		line-height: 0.95;
		color: var(--ink);
	}
	.stat__num--light {
		color: var(--line-white);
	}
	.stat__cap {
		font-family: var(--font-sans);
		font-size: var(--size-label);
		font-weight: var(--weight-bold);
		letter-spacing: var(--track-label);
		text-transform: uppercase;
		line-height: 1.5;
		color: var(--court-500);
	}
	.stat__cap--field {
		color: var(--court-300);
	}
	.stat__cap--blue {
		color: var(--court-050);
	}
	.stat__stamp {
		margin-top: auto;
		border-top: var(--hairline);
		padding-top: var(--space-3);
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.08em;
		color: var(--text-secondary);
	}
	.stat__stamp--field {
		border-top: var(--hairline-on-field);
		color: var(--court-200);
	}
	.stat__stamp--blue {
		border-top: 1px solid rgba(247, 247, 247, 0.35); /* ds-allow the kit's rule on court-500 */
		color: var(--court-050);
	}
	.winpct {
		display: flex;
		gap: var(--space-5);
		align-items: center;
		padding: var(--space-5);
		background: var(--white);
		border: var(--hairline);
	}
	.winpct__ring {
		width: 132px; /* ds-allow the kit's ring size */
		height: 132px; /* ds-allow the kit's ring size */
		border-radius: 50%;
		display: grid;
		place-items: center;
		flex: none;
	}
	.winpct__hole {
		width: 96px; /* ds-allow the kit's ring size */
		height: 96px; /* ds-allow the kit's ring size */
		border-radius: 50%;
		background: var(--white);
		display: grid;
		place-items: center;
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: 1.625rem;
		color: var(--ink);
	}
	.winpct__text {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		align-self: stretch;
		flex: 1;
		padding-top: var(--space-2);
	}
	.pair {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-5);
		flex: 1;
	}
	.pair__half {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
	.pair__half--rule {
		border-right: var(--hairline-on-field);
		padding-right: var(--space-5);
	}
	.coaches-line {
		margin-top: var(--space-7);
		border-top: var(--hairline);
		padding-top: var(--space-4);
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-4);
		flex-wrap: wrap;
	}
	.coaches-line__text {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.04em;
		line-height: 1.7;
		color: var(--text-secondary);
		text-decoration: none;
		flex: 1 1 30rem;
	}
	.coaches-line__text:hover {
		color: var(--link);
		text-decoration: underline;
	}
	.partners {
		margin-top: var(--space-7);
	}

	/* quote */
	.quote {
		background: var(--surface-tint);
		border-top: var(--hairline);
		padding: var(--space-9) 0;
	}
	.quote__inner {
		max-width: 56.25rem;
		margin: 0 auto;
		padding: 0 var(--space-6);
	}
	.quote__text {
		margin: var(--space-5) 0 0;
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: clamp(1.75rem, 3vw, 2.5rem);
		line-height: 1.12;
		letter-spacing: var(--track-display);
		text-transform: uppercase;
		color: var(--ink);
	}
	.quote__by {
		margin-top: var(--space-4);
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.08em;
		color: var(--text-secondary);
	}

	/* book */
	.book {
		background: var(--surface-field-deep);
		padding: var(--space-9) 0;
	}
	.book__inner {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		align-items: flex-start;
	}
	.book__mark {
		height: 84px; /* ds-allow the kit's mark height in the book band */
		display: block;
	}
	.book__title {
		font-size: clamp(2.25rem, 3.6vw, 3.25rem);
	}
	.book__lede {
		margin: 0;
		font-size: var(--size-body);
		line-height: 1.6;
		color: var(--text-on-field-dim);
		max-width: 44ch;
	}
	.book__actions {
		display: flex;
		gap: var(--space-5);
		align-items: center;
		flex-wrap: wrap;
	}
	.book__phone {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		color: var(--text-on-field-dim);
	}

	@media (max-width: 760px) {
		.wrap,
		.quote__inner {
			padding: 0 var(--space-4);
		}
		.hero__grid {
			grid-template-columns: 1fr;
			gap: var(--space-6);
			padding-top: var(--space-7);
			padding-bottom: var(--space-6);
		}
		.film {
			padding-bottom: var(--space-8);
		}
		.film__ann {
			font-size: 0.5625rem;
		}
		.film__ann--bl {
			display: none;
		}
		.programs,
		.performance {
			padding: var(--space-8) 0;
		}
		.programs__grid,
		.class__grid,
		.stats--three,
		.stats--two {
			grid-template-columns: 1fr;
		}
		.stats {
			gap: var(--space-3);
		}
		.stats--two {
			margin-top: var(--space-3);
		}
		.stat {
			min-height: 10.5rem;
		}
		.camps {
			padding: var(--space-5);
			align-items: flex-start;
		}
		.camps__when {
			align-items: flex-start;
		}
		.class {
			padding: var(--space-8) 0;
		}
		.class__grid {
			gap: var(--space-6);
		}
		.photos {
			padding-top: var(--space-8);
		}
		.photos__row {
			grid-template-columns: repeat(3, 1fr);
		}
		.winpct__ring {
			width: 116px; /* ds-allow the kit's mobile ring size */
			height: 116px; /* ds-allow the kit's mobile ring size */
		}
		.winpct__hole {
			width: 84px; /* ds-allow the kit's mobile ring size */
			height: 84px; /* ds-allow the kit's mobile ring size */
		}
	}
</style>
