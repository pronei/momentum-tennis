# Phase 8 — Public site — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The marketing site in the design system — home from the homepage template, a coaches page, the sponsors strip, a photo gallery with a lightbox, the store entry — live on dev, readable by anyone, with no photo or bio of a minor published without a signed media release.

**Architecture:** No migration and no new domain rules. The work is (1) porting the site group of the design system verbatim — `SiteNav`, `ProgramCard`, `PhotoFrame`, `StrobeArc`, `Wordmark` — plus two intentional additions the readme must record (a sponsors strip and the lightbox wrapper); (2) a `(site)` route group whose layout carries `SiteNav` and the footer, into which the existing public pages move; (3) content modules for what PRODUCT.md §12 says is admin-set data (stats, coaches, sponsors) until an admin console for site content exists; (4) the camps banner reading real `camps` rows from phase 3; (5) PhotoSwipe behind the gate in `docs/decisions/2026-09-05-lightbox-library.md`.

**Tech Stack:** **One new dependency**, `photoswipe@5.4.4` (MIT), loaded by dynamic import only when a photo is opened — the first UI dependency the design system admits, recorded in its readme. SvelteKit 2 / Svelte 5, vitest SSR contract tests, Playwright.

**Branch:** `phase-8/public-site` from `main`. **Migration:** none. **Harness:** none.

---

## Opening questions (recommended default first)

1. **Roster and titles.** From the current site: Artur Westergren (founder & director), Vishal (lead instructor), Tom Anderson (junior tennis expert), Surya, Zach, Matthew (college coach). Artur confirms; the website kit's *Elsio* line is dropped unless he says otherwise.
2. **Minors on the coaches page.** No photo, name or bio of a coach under 18 ships without a signed media release and guardian consent; each entry carries `consented: boolean` and renders only when true. Non-negotiable.
3. **Sponsor logos.** The four rasters in `design-system/assets/sponsors/` ship as placeholders in an ink/grayscale strip; vectors replace them when the sponsors' brand kits arrive (Artur asks). Yes.
4. **Where the gallery lives.** One row of six on the home page with `More →` to `/photos`; `/photos` shows the curated archive (14) plus consented coach portraits. Yes.
5. **Copy.** The homepage kit's copy is ported as written and flagged for Artur's review in the checklist; nothing new is drafted (the standing rule on marketing copy). Yes.
6. **The camps banner** reads phase-3 `camps` (`starts_on`/`ends_on`) instead of the kit's `SEASON_EVENTS`: live → `ENROLLING NOW`, next → `RETURNS <year>`, none → `DATES COMING`. Yes.
7. **Performance stats** (`SITE_STATS`) live in `src/lib/content/site.ts` with their date range; an admin editor is PRODUCT.md §12 work for a later phase. Yes.
8. **The hero film** ships as the labelled placeholder the kit shows until footage exists. Yes.
9. **Book a trial** → `/login?next=/portal/book`; **Calendar** → `/schedule`; **Store** → `/store`; **Log in / Account** → `/login` / `/portal`. Yes.

---

## File structure

**Ports** — create `src/lib/ds/site/SiteNav.svelte`, `ProgramCard.svelte`, `SponsorStrip.svelte` (addition), `src/lib/ds/media/PhotoFrame.svelte`, `Lightbox.svelte` (addition), `src/lib/ds/brand/StrobeArc.svelte`, `Wordmark.svelte`; modify `src/lib/ds/index.ts`, `ds.test.ts`, `src/routes/styleguide/+page.svelte`, `design-system/readme.md` (two additions + the dependency), `scripts/check-adherence.mjs` only if the lightbox override needs an allowance it cannot express with `ds-allow`.

**Content** — create `src/lib/content/site.ts` (stats, hero/section copy from the kit), `coaches.ts`, `sponsors.ts`, `photos.ts` (the curated list with ratio, focal, alt, consent); copy assets to `static/photos/`, `static/coaches/`, `static/sponsors/`, `static/logo-mark.svg`.

**Routes** — create `src/routes/(site)/+layout.svelte` (+ `.server.ts` for the camps banner and login state); move `src/routes/+page.svelte` → `(site)/+page.svelte`, `src/routes/schedule/` → `(site)/schedule/`, `src/routes/store/` → `(site)/store/`; create `(site)/coaches/`, `(site)/photos/`. Modify `src/hooks.server.ts` only if the group prefix needs listing (it does not: `(site)` is public).

**Tests** — modify `e2e/smoke.test.ts`; create `e2e/site.test.ts`; `src/routes/schedule/schedule-pages.test.ts` moves with its page.

**Docs** — `docs/PLAN.md`, `AGENTS.md`, `docs/OPERATIONS.md` §7 (phase 8: releases, sponsor kits), the checklist, `docs/decisions/2026-09-05-lightbox-library.md` (status → adopted, gate results).

---

### Task 1: Brand and media ports — `Wordmark`, `StrobeArc`, `PhotoFrame`

**Files:** Create the three components; modify `src/lib/ds/index.ts`, `ds.test.ts`, `src/routes/styleguide/+page.svelte`, `e2e/smoke.test.ts`.

- [ ] **Step 1: Failing SSR contract tests**
  - `Wordmark`: `variant` `lockup` (default) renders `MOMENTUM` and the justified `TENNIS` line; `word` omits `TENNIS`; `mark` renders only the three-ball settle; `onField` switches the class; `height` sets the cap height style; ghost frames absent below 30px.
  - `StrobeArc`: renders `frames` (default 8) ball elements, the last one carrying the amber class and the rest the cool ramp; `showPath` toggles the dashed trajectory; `annotate` renders `t−7 … t0` mono labels; `role="img"` with an `aria-label`.
  - `PhotoFrame`: wraps the `<img>` in a hairline frame (`frame` default true), applies the `ratio` class (`3:2` default) and `object-position: focal` (default `50% 38%`), renders `tag` top-left mono, the caption bar with `caption`/`captionRight`; `treatment="slice"` renders `slices` (default 5) frames of the same image with the lead edge amber; `wash` applies the duotone classes; `alt` is passed through (empty alt allowed for decorative use).
- [ ] **Step 2: Run** → FAIL. **Step 3: Port** each from its `.jsx` verbatim in values (sizes, ramp steps, opacity of ghost frames, the multiply pass of the wash, slice offsets); classes not inline styles; `ds-allow` where the reference fixes a px. **Step 4: Styleguide** block "Brand & media"; smoke asserts `getByRole('img', { name: /strobe/i })` and a `PhotoFrame` caption.
- [ ] **Step 5: Run** all → green. **Step 6: Commit** — `git commit -m "feat(ds): Wordmark, StrobeArc and PhotoFrame ports"`

### Task 2: Site ports — `SiteNav`, `ProgramCard`; the `SponsorStrip` addition

**Files:** Create the three components; modify the barrel, `ds.test.ts`, the styleguide, `design-system/readme.md`.

- [ ] **Step 1: Failing SSR contract tests**
  - `SiteNav`: a `<header>` with `<nav aria-label="Site">`; the Programs group (Junior classes & teams / Summer camps / Adult programs / JTT schedule) as a disclosure that works without JavaScript (`<details>`/`<summary>` or a `:focus-within` menu — pick what the `.jsx` structure maps to and assert the four links exist), first-class `Calendar` and `Store` links, `Log in` when `loggedIn` is false and `Account` when true, the one amber `Book a trial` action, `active` marks the current tab with `aria-current="page"`; the mobile sheet markup is present (the tri-colour hamburger button with `aria-expanded`, the court-navy sheet with the same links and the Book pill last); `links` overrides every href; `campNote` renders the mono note under Summer camps when given.
  - `ProgramCard`: eyebrow, title, mono `level` and `location`, schedule rows `{ days, time, detail }`, `note`, optional `PhotoFrame` header (`photo`, `photoRatio`, `photoTreatment` default `wash`), the CTA secondary unless `primaryCta`.
  - `SponsorStrip` (addition): `<section aria-label="Partners">` with the mono eyebrow `PARTNERS`, one `<img>` per sponsor at one fixed height with its `alt` set to the sponsor name, ink/grayscale at rest, hairline top and bottom, no links unless `href` is given.
- [ ] **Step 2: Run** → FAIL. **Step 3: Port** `SiteNav` and `ProgramCard` verbatim (the 118-line nav is the largest port in the system; keep the breakpoint from `BREAKPOINT`); write `SponsorStrip` in the system's vocabulary. **Step 4:** Record `SponsorStrip` in `design-system/readme.md` under intentional additions. Styleguide block "Site — navigation, program card, partners".
- [ ] **Step 5: Run** all → green. **Step 6: Commit** — `git commit -m "feat(ds): SiteNav and ProgramCard ports; SponsorStrip"`

### Task 3: Content modules and static assets

**Files:** Create `src/lib/content/site.ts`, `coaches.ts`, `sponsors.ts`, `photos.ts` (+ `content.test.ts`); copy assets into `static/`.

- [ ] **Step 1: Failing tests** — `coaches` entries have `{ slug, name, role, bio, photo: string | null, consented: boolean }` and `publishedCoaches()` returns only `consented`; `photos` entries have `{ src, width, height, ratio, focal, alt, consented }` and `publishedPhotos()` filters likewise; every `src` named exists under `static/` (a filesystem assertion in the test keeps the list honest); `SITE_STATS` has the seven numbers and the range string.
- [ ] **Step 2: Implement.** Bios copied verbatim from momentum-tennis.com/our-staff (the academy's own copy; the "bings" typo and the mixed pronouns in Tom's entry are left for Artur and listed in the checklist); `consented: false` for Matthew, Zach and Surya until releases arrive, `true` for Artur, Vishal and Tom only once Artur confirms (default `false` for everyone — the page shows nobody until he does). Photos: the 14 curated archive files from `design-system/assets/photos/` with their `-l`/`-p` ratios, `consented: false` until the media-release check (readme: identifiable minors throughout).
- [ ] **Step 3: Run** → PASS. **Step 4: Commit** — `git commit -m "feat(content): site stats, coaches, sponsors and photos as content modules"`

### Task 4: The `(site)` group — layout, home, moved pages

**Files:** Create `src/routes/(site)/+layout.server.ts`, `+layout.svelte`, `+page.svelte` (home); move `schedule/`, `store/`, `+page.svelte`; modify `e2e/smoke.test.ts`.

- [ ] **Step 1: Failing e2e** — home renders `SiteNav` (`getByRole('navigation', { name: 'Site' })`), the hero `h1`, the programs section with three `ProgramCard`s, the camps banner in one of its three states, the performance stats (`155`), the quote, the CTA band, the footer, and **exactly one** amber primary action above the fold (`Book a trial`); the styleguide link leaves the home page (it stays reachable at `/styleguide`). `/schedule` and `/store` still answer at the same URLs.
- [ ] **Step 2: Implement.** Layout `load`: `locals.user` → `loggedIn`; `listCamps` → `campWindow(camps, now)` (pure, in `src/lib/content/camps.ts`, tested: live/next/none). Layout renders `SiteNav` with `active` from the route id and the footer from the kit (`Wordmark`, address, phone, the `PTR-CERTIFIED COACHES · …` line). Home: the kit's sections in order — Hero (sliced `PhotoFrame`, `FrameTicks`), Film placeholder, Programs (three cards + camps banner), Inside a class (`ClassTimeline`), Performance (`SITE_STATS`), Quote, Book band, and the `SponsorStrip` between Performance and Quote; `StrobeArc` only in the camp-day band (readme removal pass). Move the two pages with `git mv`; their tests move with them.
- [ ] **Step 3: Run** → green; `pnpm check`, `pnpm lint` (the adherence gate is strict on the largest page in the system — token every value). **Step 4: Commit** — `git commit -m "feat(site): the public shell and the home page from the homepage template"`

### Task 5: `/coaches`

**Files:** Create `src/routes/(site)/coaches/+page.svelte` (+ `.server.ts`); modify `e2e/smoke.test.ts`.

- [ ] **Step 1: Failing e2e** — `/coaches` renders publicly; with no consented coach the page shows `PROFILES ARRIVE AS RELEASES ARE SIGNED` and no portrait; with one consented entry (a unit SSR test with a fixture) it renders a `PhotoFrame` portrait (`ratio="3:4"`, `treatment="plain"`), the name, the mono role and the bio paragraphs.
- [ ] **Step 2: Implement.** `load` returns `publishedCoaches()`; one `article` per coach; Artur first (founder), then in the order of the content file.
- [ ] **Step 3: Run** → green. **Step 4: Commit** — `git commit -m "feat(site): coaches"`

### Task 6: The lightbox — `Lightbox.svelte` and `/photos`

**Files:** `pnpm add photoswipe@5.4.4`; create `src/lib/ds/media/Lightbox.svelte`, `src/lib/ds/media/lightbox.css` (the overrides), `src/routes/(site)/photos/+page.svelte` (+ `.server.ts`); modify the barrel, `ds.test.ts`, the styleguide, `design-system/readme.md`, `docs/decisions/2026-09-05-lightbox-library.md`, `e2e/site.test.ts`.

- [ ] **Step 1: Failing tests** — SSR: `Lightbox` renders its children (a gallery of `PhotoFrame`s wrapped in `<a href={src} data-pswp-width data-pswp-height>`) and nothing else on the server (no PhotoSwipe markup until opened); e2e (`site.test.ts`): on `/photos` clicking the first photo opens a dialog (`.pswp` with `aria-modal`), the controls read `CLOSE`, `PREV`, `NEXT` as text (no `<svg>` inside `.pswp__button`), `Escape` closes it and focus returns to the opener; with `prefers-reduced-motion: reduce` emulated, open/close has no animation (`showHideAnimationType` `none`).
- [ ] **Step 2: Implement.** `Lightbox.svelte`: `onMount` → `const { default: PhotoSwipeLightbox } = await import('photoswipe/lightbox')` with `pswpModule: () => import('photoswipe')`, `gallery`/`children` selectors, `arrowPrevSVG`/`arrowNextSVG`/`closeSVG`/`zoomSVG` set to `''` and `zoom: false`, `counter: true`, then `lightbox.on('uiRegister', …)` registering three `isButton` elements with `html: 'CLOSE' | 'PREV' | 'NEXT'` and the mono class, `showHideAnimationType` from `matchMedia('(prefers-reduced-motion: reduce)')`, `--pswp-transition-duration: 0ms` likewise; `lightbox.destroy()` on unmount. `lightbox.css` imports `photoswipe/dist/photoswipe.css` and overrides `.pswp__error-msg { text-shadow: none }`, sets `--pswp-bg` to the field colour token, `--pswp-icon-color` to line white, and gives `.pswp__button` the mono label styles with a 44px hit area. `/photos`: `publishedPhotos()` in a 3-up grid (1-up below 760px), each a `PhotoFrame` with `plain` treatment inside the anchor.
- [ ] **Step 3: Gate** (from the decision doc): styleguide specimen; `pnpm lint` (adherence gate) green with the override sheet under `src/lib/ds`; reduced-motion verified; keyboard verified; the dependency recorded in `design-system/readme.md` next to the icon rule; the decision doc's status set to adopted with the results.
- [ ] **Step 4: Run** all → green. **Step 5: Commit** — `git commit -m "feat(site): photo gallery with PhotoSwipe behind text controls"`

### Task 7: e2e, docs, and the finish

**Files:** Modify `docs/PLAN.md`, `AGENTS.md`, `docs/OPERATIONS.md` §7; create the checklist.

- [ ] **Step 1:** `e2e/site.test.ts` walks home → coaches → photos → the lightbox → `Store` → `Calendar` → `Book a trial` lands on login with `next=/portal/book`; mobile viewport: the hamburger opens the sheet, the Book pill is last.
- [ ] **Step 2: Gates** — `pnpm env:check` · `pnpm check` · `pnpm lint` · `pnpm test` · `pnpm db:test` · `pnpm db:types` no diff · `pnpm build:dev` · `pnpm test:e2e`.
- [ ] **Step 3: Records** — PLAN.md phase-8 row and decisions (questions 1–9), AGENTS.md (status, repo map: `(site)`, `src/lib/content`, the dependency), OPERATIONS §7 (phase 8: media releases; sponsor kits; Artur's copy review), the checklist listing every item that waits on Artur (roster, releases, vectors, the two bio corrections, stats currency).
- [ ] **Step 4: Finish** — merge, fast-forward `deploy/dev`, push, report, **stop**.

---

## Self-review

**Spec coverage.** Brief task 1 (site ports) → Tasks 1–2. Task 2 (home from the template; sponsors) → Task 4 with `SponsorStrip` from Task 2. Task 3 (`/coaches` from a content file) → Tasks 3 and 5. Task 4 (gallery + PhotoSwipe behind the gate) → Task 6. Task 5 (e2e smoke) → Tasks 4–7. The brief's questions are all in the opening list; PLAN's exit ("render anonymously in the design system; no photo of a minor without a release") is Task 4's e2e plus the `consented` filter tests in Task 3.

**Placeholders.** Copy is ported, not drafted; every entry that depends on Artur is a content-file boolean defaulting to *not published*, so the site cannot ship a minor by omission.

**Type consistency.** `publishedCoaches()` / `publishedPhotos()` (Task 3) are what Tasks 5–6 read; `campWindow(camps, now)` (Task 4) mirrors the kit's logic on phase-3 rows; `Lightbox` wraps `PhotoFrame` anchors (Task 6) and `PhotoFrame`'s props are Task 1's.
