# Phase 6 — Ratings & coach tools — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A coach (or admin) records a player's court placement and any other active dimension from the coach console; the family's portal shows the current value on a meter whose text (`3 OF 5`) is always present, never colour alone; internal dimensions never reach a family-facing view; every rating is an immutable event with the coach who made it.

**Architecture:** 0001 already holds the whole model — `rating_dimensions` (seeded `court_placement`, scale 5), append-only `rating_events` with the `rating_snapshot_scale` trigger and `ratings_immutable`, `v_current_ratings` (`security_invoker`), and the policies `coach_rate` (insert only by staff, only as themselves) and `read_ratings` (staff see all; a guardian sees only `guardian`-visible events for players they guard). **This phase needs no migration**: writes are direct inserts under those policies, reads go through the view, and the harness gains a section pinning the policies phase 6 leans on. The work is a `ratings` domain module, two design-system ports (RatingMeter, CourtMeter), and three surfaces (coach entry, admin dimensions, portal meter).

**Tech Stack:** No new dependencies. SvelteKit 2 / Svelte 5 runes, superforms + zod4, Supabase RLS client, PGlite harness, vitest, Playwright.

**Branch:** `phase-6/ratings` from `main`. **Migration:** none. **Harness:** section 16 (behaviour already in 0001).

---

## Opening questions (recommended default first)

1. **Who rates.** Coaches and admins — anyone in `staff_members` (`coach_rate` already says `is_staff()`). Yes.
2. **Visibility default.** `guardian` (visible to the family), which is the column default; a coach flips a single rating to `internal` when it is a coaching note, not a placement. Yes.
3. **What a family sees.** The current value and its date per guardian-visible dimension; the full history (every event, the coach, the note) is staff-only. Yes — a policy of the UI, since RLS already hides internal events.
4. **Migration 0010 only if an RPC is preferred over a direct insert.** Recommended: **no migration.** The insert policy is exactly the rule (staff, as themselves), the trigger snapshots the scale, and the check constraint bounds the value; the UI offers only valid values, so the one refusal a coach can meet is `not_authorized`. An RPC would add a token for "dimension inactive" — the form lists only active dimensions, so nothing is lost.
5. **The placement meter pins to the top of the portal for 30 days after a change** (PRODUCT.md §11). Yes — pure date arithmetic on the current event's `rated_at`.
6. **Rewards for promotions** (PRODUCT.md §3, "define reward rules with Artur"). Not built; the placement itself is the display. Yes.
7. **Which dimension drives CourtMeter.** `court_placement` by key; other dimensions render as RatingMeter rows. Yes.

---

## File structure

**Harness** — modify `supabase/tests/validate.mjs` (section 16).

**Domain** — create `src/lib/server/domain/ratings.ts`, `ratings.test.ts`.

**Design-system ports** — create `src/lib/ds/admin/RatingMeter.svelte`, `src/lib/ds/site/CourtMeter.svelte`; modify `src/lib/ds/index.ts`, `src/lib/ds/ds.test.ts`, `src/routes/styleguide/+page.svelte`, `e2e/smoke.test.ts`.

**Routes** — create `src/routes/coach/players/+page.server.ts`, `+page.svelte`, `players/[id]/+page.server.ts`, `+page.svelte`; `src/routes/admin/ratings/+page.server.ts`, `+page.svelte`, `ratings/[id]/+page.server.ts`, `+page.svelte`. Modify `src/routes/coach/+layout.svelte`, `src/routes/coach/sessions/[id]/+page.svelte`, `src/routes/admin/+layout.svelte`, `src/routes/(portal)/portal/+page.server.ts` (create if absent), `+page.svelte`, `src/routes/(portal)/portal/players/[id]/+page.server.ts`, `+page.svelte`.

**Docs** — `docs/PLAN.md`, `AGENTS.md`, `docs/OPERATIONS.md` §7 (phase 6: nothing), the checklist.

---

### Task 1: Harness §16 — the policies phase 6 leans on

**Files:** Modify `supabase/tests/validate.mjs`.

- [ ] **Step 1: Write the section.** No migration precedes it: every check must be GREEN against 0001 as it stands, and its value is that a later migration cannot loosen these rules unnoticed. `maya` is PARENT's player; `ADMIN` is staff. Append before the final summary line:

```js
console.log('16. ratings — staff write as themselves, families read only what is theirs (phase 6)');
const p6dim = (await q(`select id, scale_max from rating_dimensions where key = 'court_placement'`)).rows[0];
await db.exec('set role authenticated');
await asUser(PARENT);
await expectErr(
	'a family cannot rate',
	() => q(`insert into rating_events (player_id, dimension_id, value, coach_id) values ($1,$2,3,$3)`, [maya, p6dim.id, PARENT]),
	'row-level security'
);
await asUser(ADMIN);
await expectErr(
	'staff cannot sign a rating as someone else',
	() => q(`insert into rating_events (player_id, dimension_id, value, coach_id) values ($1,$2,3,$3)`, [maya, p6dim.id, PARENT]),
	'row-level security'
);
const p6first = (
	await q(
		`insert into rating_events (player_id, dimension_id, value, coach_id) values ($1,$2,3,$3) returning scale_max_snapshot`,
		[maya, p6dim.id, ADMIN]
	)
).rows[0];
if (p6first.scale_max_snapshot === 5) ok('the scale is snapshotted onto the event by the trigger');
else {
	console.log('  ✗ snapshot', p6first);
	failures++;
}
await expectErr(
	'a value beyond the scale is refused by the check constraint',
	() => q(`insert into rating_events (player_id, dimension_id, value, coach_id) values ($1,$2,6,$3)`, [maya, p6dim.id, ADMIN]),
	'check constraint'
);
await q(`insert into rating_events (player_id, dimension_id, value, coach_id, visibility, note) values ($1,$2,2,$3,'internal','coaching note')`, [maya, p6dim.id, ADMIN]);
await q(`insert into rating_events (player_id, dimension_id, value, coach_id) values ($1,$2,4,$3)`, [maya, p6dim.id, ADMIN]);
await asUser(PARENT);
const p6seen = (await q(`select value, visibility from rating_events where player_id = $1 order by rated_at`, [maya])).rows;
if (p6seen.length === 2 && p6seen.every((r) => r.visibility === 'guardian'))
	ok('a guardian sees only guardian-visible events — the internal note is invisible');
else {
	console.log('  ✗ visibility', p6seen);
	failures++;
}
const p6cur = (await q(`select value from v_current_ratings where player_id = $1 and dimension_id = $2`, [maya, p6dim.id])).rows;
if (p6cur.length === 1 && p6cur[0].value === 4) ok('v_current_ratings is the latest visible event per dimension');
else {
	console.log('  ✗ current', p6cur);
	failures++;
}
await asUser(PARENT2);
const p6none = (await q(`select count(*)::int as n from rating_events where player_id = $1`, [maya])).rows[0].n;
if (p6none === 0) ok('another family sees nothing');
else {
	console.log('  ✗ cross-family', p6none);
	failures++;
}
await asUser(ADMIN);
const p6staff = (await q(`select count(*)::int as n from rating_events where player_id = $1`, [maya])).rows[0].n;
if (p6staff === 3) ok('staff see every event, internal ones included');
else {
	console.log('  ✗ staff view', p6staff);
	failures++;
}
await db.exec('reset role');
await expectErr(
	'ratings are append-only',
	() => q(`update rating_events set value = 1 where player_id = $1`, [maya]),
	'append-only'
);
```

- [ ] **Step 2: Run** `pnpm db:test` → `ALL CHECKS PASSED` with section 16 (about 9 new checks). If `'check constraint'` does not match PGlite's message, read the message it prints and use the constraint's name (`rating_events_check`).
- [ ] **Step 3: Commit** — `git commit -m "test(db): harness §16 pins the rating policies phase 6 relies on"`

### Task 2: `domain/ratings.ts`

**Files:** Create `src/lib/server/domain/ratings.ts`, `ratings.test.ts`.

- [ ] **Step 1: Failing tests** (with `fakeDb` / `called` from `./schedule/fakes`):
  - `listDimensions(db, { activeOnly: true })` reads `rating_dimensions` ordered by `sort`, `.eq('active', true)` only when asked; returns `Dimension = { id, key, label, scaleMax, sort, active }[]`.
  - `dimensionSchema`: `key` matches `/^[a-z][a-z0-9_]{1,39}$/`, `label` 1–60, `scaleMax` integer 2–10, `sort` integer, `active` boolean.
  - `saveDimension(db, input)` inserts without `id`, updates `.eq('id', id)` with it; `42501` → `not_authorized`, `23505` → `conflict` (the key is unique).
  - `rateSchema`: `playerId`, `dimensionId` uuids; `value` integer 1–10; `visibility` in `guardian | internal` (default `guardian`); `note` optional, ≤ 240.
  - `rate(db, { ...input, coachId })` inserts into `rating_events` `{ player_id, dimension_id, value, visibility, note, coach_id: coachId }` and returns `{ id }`; `42501` → `not_authorized`; `23514` → `validation` (value beyond the scale).
  - `current(db, playerId)` reads `v_current_ratings` with the embedded `rating_dimensions ( key, label, scale_max, sort, active )`, ordered by the dimension's `sort`, returning `CurrentRating = { dimensionId, key, label, value, scaleMax, visibility, ratedAt, note }[]`.
  - `history(db, playerId, dimensionId?)` reads `rating_events` newest first with `accounts ( full_name )` for the coach; `coachName` is `'Coach'` when the join is absent (a family cannot read other accounts, and does not need to).
  - Pure `trendOf(events, tz)` — events newest first for one dimension — returns `'+1 · JUL 28'` / `'−1 · JUL 28'` (the sign, the difference between the two latest values, the academy-local month and day of the latest) or `null` with fewer than two events or no change. Use `academyDate` from `./time` and the `MONTHS` convention of the email ports.
  - Pure `pinnedUntil(ratedAt, days = 30)` → ISO date string; `isPinned(ratedAt, now)` → boolean, true within 30 days.
  - Pure `meterRows(current, { includeInternal })` → `RatingMeter` props: `{ label, value, internal, note }` per dimension, internal rows dropped unless asked.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** `RatingsDb = Pick<SupabaseClient<Database>, 'from'>`.
- [ ] **Step 4: Run** → PASS. **Step 5: Commit** — `git commit -m "feat(ratings): dimensions, rating events, current values, trend and pinning"`

### Task 3: Error codes

**Files:** Modify `src/lib/server/domain/result.ts`, `result.test.ts`.

- [ ] **Step 1: Failing test** — `describeError('rating_out_of_scale')` is a sentence without `!`; `fromPostgres({ message: 'rating_out_of_scale' }).code` is the code.
- [ ] **Step 2–4:** add `rating_out_of_scale` → `That value is beyond the dimension's scale.`; the domain maps `23514` on `rating_events` to it (not to `validation`). RED → GREEN.
- [ ] **Step 5: Commit** — `git commit -m "feat(domain): rating error code"`

### Task 4: Ports — RatingMeter and CourtMeter

**Files:** Create `src/lib/ds/admin/RatingMeter.svelte`, `src/lib/ds/site/CourtMeter.svelte`; modify `src/lib/ds/index.ts`, `src/lib/ds/ds.test.ts`, `src/routes/styleguide/+page.svelte`, `e2e/smoke.test.ts`.

- [ ] **Step 1: Failing SSR contract tests** in `ds.test.ts`:
  - `RatingMeter` display: one row per dimension; `role="meter"` with `aria-valuemin="1"`, `aria-valuemax="5"`, `aria-valuenow="3"` and `aria-label="Court placement: 3 of 5"`; the text `3 OF 5` is in the markup; `internal: true` renders the mono `INTERNAL` tag; `trend` and `note` render when given; `max` segments are rendered (`5` children).
  - `RatingMeter` interactive: `role="group"`; five `<button type="submit" name="value" value="n">` with `aria-label="Court placement: set n of 5"` and `aria-pressed="true"` only on the current value; no `aria-valuenow`; the buttons carry the 44px class. `onChange` is invoked with `(dimensionIndex, value)` on click (a runes prop; SSR asserts the markup only).
  - `CourtMeter`: `role="meter"`, `aria-valuenow` clamped to `1..max`, `aria-label="Court level: court 3 of 5"`, labels `C1`…`C5` present when `showLabels`, none when false; `caption` renders uppercase mono; `tone="field"` switches the class.
- [ ] **Step 2: Run** → FAIL (components missing).
- [ ] **Step 3: Port** both from the `.jsx` **verbatim in values** — the cool ramp `--court-100/200/300/400/700` for climbed segments, `--now` amber for the current, hairline borders for the ahead frames, 16px display segments and 44px interactive buttons, gaps 6/8/20, the mono sizes (`0.6875rem`, `0.625rem`, `0.5625rem` for the tag), `transition: background var(--dur-base) var(--ease-out)` (display) and `var(--dur-fast)` (buttons), reduced motion honoured via the global rule. Classes, not inline styles; `ds-allow` comments on the px the reference fixes (`16px` segment height, `44px` buttons/`minWidth`).
  In interactive mode every segment is a real submit button (`name="value" value={n}`) so a coach form works without JavaScript; `onChange` additionally fires for enhanced forms. Export both from the barrel.
- [ ] **Step 4: Styleguide** — a "Ratings — meters" block with a display RatingMeter (two rows, one internal), an interactive one, and a CourtMeter with a caption. Extend the smoke test: `getByRole('meter', { name: /Court placement/ })` visible; `getByText('3 OF 5')` visible.
- [ ] **Step 5: Run** `pnpm test`, `pnpm check`, `pnpm lint`, `pnpm test:e2e -g styleguide` → all green.
- [ ] **Step 6: Commit** — `git commit -m "feat(ds): RatingMeter and CourtMeter ports"`

### Task 5: Coach — `/coach/players` and `/coach/players/[id]`

**Files:** Create the four route files; modify `src/routes/coach/+layout.svelte`, `src/routes/coach/sessions/[id]/+page.svelte`, `src/routes/coach/coach-pages.test.ts`, `e2e/smoke.test.ts`.

- [ ] **Step 1: Failing tests** — `smoke.test.ts`: `/coach/players` is refused for anonymous users. `coach-pages.test.ts` (SSR of the page component with fixture data): the player page renders one interactive RatingMeter per active dimension inside a form per dimension, each with a hidden `dimensionId`, a visibility `Select` and a `TextArea` note; the history table lists coach, value, visibility and date.
- [ ] **Step 2: Implement.** `/coach/players`: `?q=` search via `searchPlayers` (staff read all players), results link to `[id]`; recent ratings by this coach (`rating_events` where `coach_id = locals.user.id`, newest 20) as a DataTable. `[id]`: `load` reads the player (staff `read_players`), `listDimensions({ activeOnly: true })`, `current`, `history`; each dimension's form posts action `rate` with `dimensionId`, `value` (from the segment button), `visibility`, `note` → `rate(db, { …, coachId: locals.user.id })` → `message` `RATED · COURT PLACEMENT 3 OF 5`; `not_authorized` shown as a Banner. The coach layout gains a `Players` tab; the session roster's player names link to `/coach/players/[id]`.
- [ ] **Step 3: Run** → green; `pnpm check`, `pnpm lint`. **Step 4: Commit** — `git commit -m "feat(coach): player lookup and rating entry"`

### Task 6: Admin — `/admin/ratings`

**Files:** Create the four route files; modify `src/routes/admin/+layout.svelte`, `src/routes/admin/admin-pages.test.ts`, `e2e/smoke.test.ts`.

- [ ] **Step 1: Failing tests** — smoke: `/admin/ratings` refused anonymously. `admin-pages.test.ts`: the list renders a DataTable with key, label, scale, active; the `[id]` form renders the five fields.
- [ ] **Step 2: Implement.** List: `listDimensions({})` + ghost `New dimension` → `/admin/ratings/new`. `[id]`: superform of `dimensionSchema` (new or pre-filled), action `save` → `saveDimension` → `SAVED · <LABEL>`; `conflict` → `setError` "That key is taken". Deactivating hides a dimension from coaches; existing events keep rendering. Admin tabs gain `Ratings` after `Credits`.
- [ ] **Step 3: Run** → green. **Step 4: Commit** — `git commit -m "feat(admin): rating dimensions"`

### Task 7: Portal — the meter on the player card and the player page

**Files:** Modify `src/routes/(portal)/portal/+page.server.ts` (create: it does not exist yet — the overview reads layout data only), `+page.svelte`, `src/routes/(portal)/portal/players/[id]/+page.server.ts`, `+page.svelte`, `src/routes/(portal)/portal/booking-pages.test.ts`.

- [ ] **Step 1: Failing tests** — SSR of the overview with a fixture `placement = { value: 3, ratedAt, trend: '+1 · JUL 28', pinned: true }`: renders a CourtMeter with `aria-valuenow="3"`, the caption `MOVED UP · JUL 28`, and the mono line `PLACEMENT CHANGED — PINNED TO TOP` above the facts when pinned, below them otherwise. The player page renders a display RatingMeter with only guardian-visible rows and each row's date.
- [ ] **Step 2: Implement.** Overview `load`: `current(db, currentPlayer.id)` → the `court_placement` row (if any) with `trendOf(history)`, `isPinned`; when pinned the meter block precedes the facts (PRODUCT.md §11 stacking rule), and the phase-1 note under the card is replaced by the meter or by `NO PLACEMENT YET — THE ACADEMY SETS IT AFTER THE FIRST SESSIONS`. Player page: `meterRows(current, { includeInternal: false })` with `note` set to the date `RATED 2026-09-12`.
- [ ] **Step 3: Run** → green. **Step 4: Commit** — `git commit -m "feat(portal): court placement meter"`

### Task 8: e2e and the finish

**Files:** Create `e2e/coach-rating.test.ts`; modify `docs/PLAN.md`, `AGENTS.md`, `docs/OPERATIONS.md`; create the checklist.

- [ ] **Step 1:** Credentialed spec (skips without `E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD`): log in → add a player → `/coach/players?q=` → open → press `Court placement: set 3 of 5` → `RATED ·` → `/portal` shows `3 OF 5`/`C3` and the pinned line → rate `4` → `/portal` shows `MOVED UP`.
- [ ] **Step 2: Gates** — `pnpm env:check` · `pnpm check` · `pnpm lint` · `pnpm test` · `pnpm db:test` · `pnpm db:types` no diff (no migration: no diff by construction) · `pnpm build:dev` · `pnpm test:e2e`.
- [ ] **Step 3: Records** — PLAN.md phase-6 row "built", decision log (questions 1–7 as answered), AGENTS.md status and repo map, OPERATIONS §7 (phase 6: nothing), the checklist.
- [ ] **Step 4: Finish** — merge to `main`, fast-forward `deploy/dev`, push, report, **stop**.

---

## Self-review

**Spec coverage.** Brief task 1 (migration only if needed; harness §16) → Task 1 with the decision recorded in question 4. Task 2 (domain: dimensions CRUD, rate, current, history) → Task 2. Task 3 (ports) → Task 4. Task 4 (coach entry, admin dimensions) → Tasks 5–6. Task 5 (portal meter on the card and the player page) → Task 7. PLAN exit "court placement drives the portal meter with accessible text values" is the SSR assertion in Task 7 (`aria-valuenow` + `3 OF 5`).

**Placeholders.** None; the one open policy (rewards) is explicitly not built.

**Type consistency.** `current()` returns `CurrentRating[]` used by `meterRows` (Task 2) and both portal pages (Task 7); `rate()` takes `coachId` from `locals.user.id` (Task 5); `RatingMeter` interactive buttons are `name="value"` (Task 4) and the coach action reads `value` (Task 5).
