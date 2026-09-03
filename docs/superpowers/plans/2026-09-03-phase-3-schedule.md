# Phase 3 — Schedule & availability — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Artur enters the real fall schedule — locations, courts, reservation windows, class templates with level tags, generated occurrences, camps, teams — and the calendar renders it in academy time for admin, families and the public site.

**Architecture:** The schema already carries the whole model (0001: `locations`, `courts`, `court_availability` + exceptions with `court_available()` and the two protecting triggers, `sessions` with the court/coach EXCLUDE constraints, `session_skill_levels`, `terms`/`classes`/`class_skill_levels`/`class_sessions`, `generate_class_sessions()`, `cancel_session()`, camps, teams; admin `for all` RLS policies on every one of these tables). Phase 3 adds one migration (atomic level tagging + one read model), a `schedule/` domain module split by concern, the admin surfaces on top of ported design-system components, and read-only portal and public calendars. Nothing bookable is built here — that is phase 4.

**Tech Stack:** SvelteKit 2 / Svelte 5 runes, superforms + zod4, Supabase RLS client, PGlite harness, vitest, Playwright. No calendar library unless Task 12's spike passes (default: the ResourceDayView port alone).

**Branch:** `phase-3/schedule` from `main`. **Migration:** `0007_schedule.sql`. **Harness:** section 13.

**Open with these questions (recommended default first), then wait for the go:**
1. Coach choices for `coach_id` = accounts with a `coach` or `admin` role in `staff_members` — yes.
2. Court-less sessions (`court_id null`) only for team away matches — yes.
3. Occurrence generation horizon = the whole term in one action, re-runnable (the RPC skips existing dates) — yes.
4. Public `/schedule` page (ClassTimeline + CampTimeline + upcoming scheduled sessions) in scope — yes, read-only.
5. Camp registration UI deferred to phase 5 (it needs a purchase); phase 3 only schedules camp days — yes.
6. Coach availability stays unmodelled (decision H); the coach EXCLUDE constraint is the guard — yes.

---

## File structure

| file | responsibility |
|---|---|
| `supabase/migrations/0007_schedule.sql` | `set_session_levels`, `set_class_levels` (atomic tag replacement, admin-only), `v_schedule_sessions` (one row per session with title, court, location, coach, parent id, level keys; `security_invoker`) |
| `supabase/tests/validate.mjs` §13 | behaviour of the three objects above |
| `src/lib/server/domain/result.ts` | codes `availability_in_use`, `camp_out_of_season`, `unknown_class` + copy |
| `src/lib/server/domain/time.ts` | `dayBounds(localDate, tz)` — UTC instants for a local calendar day (DST-safe) |
| `src/lib/server/domain/schedule/locations.ts` | locations + courts: list/create/rename/deactivate |
| `src/lib/server/domain/schedule/availability.ts` | windows + exceptions: list per court, add, end (set `effective_to`), delete exception |
| `src/lib/server/domain/schedule/classes.ts` | terms, class templates, `setClassLevels`, `generateOccurrences` |
| `src/lib/server/domain/schedule/sessions.ts` | day query from the view, create (with subtype row), update, `setSessionLevels`, cancel |
| `src/lib/server/domain/schedule/camps.ts` | camps CRUD + camp day sessions |
| `src/lib/server/domain/schedule/teams.ts` | teams CRUD, roster, practices/matches |
| `src/lib/ds/schedule/ResourceDayView.svelte` · `SessionForm.svelte` | ports of `design-system/components/schedule/*.jsx` |
| `src/lib/ds/admin/DataTable.svelte` | port of `design-system/components/admin/DataTable.jsx` |
| `src/lib/ds/site/ClassTimeline.svelte` · `CampTimeline.svelte` | ports of `design-system/components/site/*.jsx` |
| `src/lib/ds/index.ts`, `src/routes/styleguide/+page.svelte` | export + show every new component |
| `src/routes/admin/+layout.svelte` | nav entries: Schedule, Availability, Classes, Camps, Teams |
| `src/routes/admin/schedule/` (`+page`, `new/`, `[id]/`) | day grid, create, edit/tag/cancel |
| `src/routes/admin/availability/` | per location: courts, windows, exceptions |
| `src/routes/admin/classes/` (`+page`, `new/`, `[id]/`) | terms, templates, tags, generate |
| `src/routes/admin/camps/` (`+page`, `[id]/`) · `src/routes/admin/teams/` (`+page`, `[id]/`) | CRUD, camp days, rosters, team sessions |
| `src/routes/(portal)/portal/schedule/+page.server.ts` · `+page.svelte` | the family's next two weeks, filtered by the `?player=` level |
| `src/routes/schedule/+page.server.ts` · `+page.svelte` | public page |
| `e2e/admin-schedule.test.ts` | admin creates court → window → class → generates a week → sees it |

Domain modules take `ScheduleDb = Pick<SupabaseClient<Database>, 'from' | 'rpc'>`, colocate zod schemas, return `Result<T>`, and are tested with the narrow fakes used in `src/lib/server/domain/waivers.test.ts`. Routes stay thin: `superValidate` → domain call → `setError`/`message`, exactly as `src/routes/admin/waivers/+page.server.ts`.

---

### Task 1: Migration 0007 — atomic level tags and the calendar read model

**Files:** Create `supabase/migrations/0007_schedule.sql`. Modify `supabase/tests/validate.mjs` (append §13 before the summary lines).

- [ ] **Step 1: Write the failing harness section** (append before `console.log(failures ? …`):

```js
// 13. Schedule (0007): atomic level tags + the calendar read model
const p3term = (
	await q(`insert into terms (name, starts_on, ends_on) values ('P3 Fall', '2026-09-07', '2026-12-13') returning id`)
).rows[0].id;
const p3court = (await q(`select id from courts limit 1`)).rows[0].id;
const p3class = (
	await q(
		`insert into classes (term_id, name, weekday, start_time_local, duration_minutes, capacity, default_court_id)
		 values ($1, 'P3 Green Sat', 6, '09:00', 120, 6, $2) returning id`,
		[p3term, p3court]
	)
).rows[0].id;
await expectOk('class tags set atomically', () =>
	q(`select set_class_levels($1, $2)`, [p3class, ['green_beginner', 'green_intermediate']])
);
const gen = (await q(`select generate_class_sessions($1, '2026-09-12', '2026-09-12') as r`, [p3class])).rows[0].r;
const p3sid = (
	await q(`select session_id from class_sessions where class_id = $1 limit 1`, [p3class])
).rows[0].session_id;
const before = (await q(`select count(*)::int as n from session_skill_levels where session_id = $1`, [p3sid])).rows[0].n;
const n1 = (await q(`select set_session_levels($1, $2) as n`, [p3sid, ['orange']])).rows[0].n;
if (before === 2 && n1 === 1) ok('set_session_levels replaces the tag set (2 → 1)');
else { console.log('  ✗ tags before/after', before, n1); failures++; }
await expectErr('an unknown level key is refused', () => q(`select set_session_levels($1, $2)`, [p3sid, ['purple']]), 'unknown_skill_level');
await expectErr('an unknown session is refused', () => q(`select set_session_levels(gen_random_uuid(), $1)`, [['orange']]), 'unknown_session');
const vrow = (await q(`select title, court_name, level_keys, session_type from v_schedule_sessions where id = $1`, [p3sid])).rows[0];
if (vrow && vrow.title === 'P3 Green Sat' && vrow.court_name && vrow.level_keys.length === 1 && vrow.session_type === 'class')
	ok('v_schedule_sessions carries title, court and level keys for the occurrence');
else { console.log('  ✗ view row', vrow); failures++; }
```

- [ ] **Step 2: Run to verify it fails** — `pnpm db:test` → expected: `function set_class_levels(uuid, text[]) does not exist`.

- [ ] **Step 3: Write the migration**

```sql
-- 0007 — schedule: atomic level tagging and one read model for every calendar.
create function public.set_session_levels(p_session uuid, p_level_keys text[])
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not is_admin() then raise exception 'admin_only'; end if;
  if not exists (select 1 from sessions where id = p_session) then raise exception 'unknown_session'; end if;
  if exists (select 1 from unnest(p_level_keys) k where not exists (select 1 from skill_levels where key = k)) then
    raise exception 'unknown_skill_level';
  end if;
  delete from session_skill_levels where session_id = p_session;
  insert into session_skill_levels (session_id, skill_level_id)
    select p_session, id from skill_levels where key = any (p_level_keys);
  get diagnostics n = row_count;
  return n;
end $$;

create function public.set_class_levels(p_class uuid, p_level_keys text[])
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not is_admin() then raise exception 'admin_only'; end if;
  if not exists (select 1 from classes where id = p_class) then raise exception 'unknown_class'; end if;
  if exists (select 1 from unnest(p_level_keys) k where not exists (select 1 from skill_levels where key = k)) then
    raise exception 'unknown_skill_level';
  end if;
  delete from class_skill_levels where class_id = p_class;
  insert into class_skill_levels (class_id, skill_level_id)
    select p_class, id from skill_levels where key = any (p_level_keys);
  get diagnostics n = row_count;
  return n;
end $$;

-- One row per session with everything a calendar cell needs. security_invoker: the caller's RLS
-- applies (anon sees scheduled sessions only; coach names come through only for staff).
create view public.v_schedule_sessions with (security_invoker = true) as
select s.id, s.session_type, s.starts_at, s.ends_at, s.status, s.notes, s.venue_note,
       s.court_id, c.name as court_name, c.location_id, l.name as location_name,
       s.coach_id, a.full_name as coach_name,
       coalesce(cl.name, cp.name, tm.name || ' · ' || ts.kind::text, 'Private lesson') as title,
       coalesce(cs.class_id, cps.camp_id, ts.team_id) as parent_id,
       coalesce(array_agg(sk.key order by sk.rank) filter (where sk.key is not null), '{}'::text[]) as level_keys
from sessions s
left join courts c on c.id = s.court_id
left join locations l on l.id = c.location_id
left join accounts a on a.id = s.coach_id
left join class_sessions cs on cs.session_id = s.id
left join classes cl on cl.id = cs.class_id
left join camp_sessions cps on cps.session_id = s.id
left join camps cp on cp.id = cps.camp_id
left join team_sessions ts on ts.session_id = s.id
left join teams tm on tm.id = ts.team_id
left join session_skill_levels ssl on ssl.session_id = s.id
left join skill_levels sk on sk.id = ssl.skill_level_id
group by s.id, c.name, c.location_id, l.name, a.full_name, cl.name, cp.name, tm.name, ts.kind,
         cs.class_id, cps.camp_id, ts.team_id;
```

- [ ] **Step 4: Run to verify it passes** — `pnpm db:test` → `ALL CHECKS PASSED` (105 checks). Then `pnpm db:types` and confirm `v_schedule_sessions`, `set_session_levels`, `set_class_levels` appear in `src/lib/server/db/database.types.ts`.

- [ ] **Step 5: Commit** — `git add supabase src/lib/server/db/database.types.ts && git commit -m "feat(schema): 0007 atomic level tags and v_schedule_sessions"`

### Task 2: Error codes

**Files:** Modify `src/lib/server/domain/result.ts`, `src/lib/server/domain/result.test.ts`.

- [ ] **Step 1: Failing tests** — add to `result.test.ts`:

```ts
it('maps the schedule tokens the triggers raise', () => {
	expect(fromPostgres({ message: 'availability_in_use: session x would lose its court' }).code).toBe('availability_in_use');
	expect(fromPostgres({ message: 'camp_out_of_season: camps must fall within …' }).code).toBe('camp_out_of_season');
	expect(fromPostgres({ message: 'unknown_class' }).code).toBe('unknown_class');
});
```

- [ ] **Step 2: Run** — `pnpm exec vitest run src/lib/server/domain/result.test.ts` → fails: codes unknown (mapped to `unexpected`).
- [ ] **Step 3: Implement** — add the three codes to `CODES`, and copy to `COPY`: `availability_in_use` → "Sessions are scheduled inside that window. Cancel or move them first."; `camp_out_of_season` → "Camps run only inside the configured summer window."; `unknown_class` → "That class no longer exists." Tokens already parse by prefix, so no mapping change.
- [ ] **Step 4: Run** → passes. **Step 5: Commit** — `git commit -am "feat(domain): schedule error codes"`

### Task 3: `dayBounds` in time.ts

**Files:** Modify `src/lib/server/domain/time.ts`, `time.test.ts`.

- [ ] **Step 1: Failing test**

```ts
it('dayBounds spans a local calendar day in UTC, including the 25-hour DST day', () => {
	const tz = 'America/Los_Angeles';
	const ordinary = dayBounds('2026-09-12', tz);
	expect(ordinary).toEqual({ startsAt: '2026-09-12T07:00:00.000Z', endsAt: '2026-09-13T07:00:00.000Z' });
	const fallBack = dayBounds('2026-11-01', tz);
	expect(new Date(fallBack.endsAt).getTime() - new Date(fallBack.startsAt).getTime()).toBe(25 * 3_600_000);
});
```

- [ ] **Step 2: Run** → `dayBounds is not a function`.
- [ ] **Step 3: Implement**

```ts
/** UTC instants for local midnight of `localDate` (YYYY-MM-DD) and of the next day, in `tz`. */
export function dayBounds(localDate: string, tz: string): { startsAt: string; endsAt: string } {
	const midnight = (d: string) => {
		const [y, m, day] = d.split('-').map(Number);
		let guess = Date.UTC(y, m - 1, day);
		for (let i = 0; i < 2; i++) guess = Date.UTC(y, m - 1, day) - offsetMs(guess, tz); // converge across a DST edge
		return new Date(guess).toISOString();
	};
	const next = new Date(Date.UTC(...(localDate.split('-').map(Number) as [number, number, number]).map((v, i) => (i === 1 ? v - 1 : v)) as [number, number, number]));
	next.setUTCDate(next.getUTCDate() + 1);
	return { startsAt: midnight(localDate), endsAt: midnight(next.toISOString().slice(0, 10)) };
}
/** Signed offset of `tz` from UTC at `instant`, in ms — derived with Intl, never hard-coded. */
function offsetMs(instant: number, tz: string): number {
	const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(new Date(instant));
	const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
	return Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second')) - instant;
}
```

- [ ] **Step 4: Run** → passes (both cases). **Step 5: Commit** — `git commit -am "feat(time): dayBounds"`

### Task 4: `schedule/locations.ts` and `schedule/availability.ts`

**Files:** Create both modules and `schedule/locations.test.ts`, `schedule/availability.test.ts`.

- [ ] **Step 1: Failing tests** — with the waivers-style fake (`from(table)` returning a chainable stub that records the call and resolves `{ data, error }`):
  - `listLocations(db)` returns locations with their courts (two queries, ordered by name).
  - `createCourt(db, { locationId, name })` inserts and maps `23505` to `conflict`.
  - `courtSchema` rejects an empty name.
  - `addWindow(db, input)` inserts into `court_availability` with `weekday` 1–7, `open_local < close_local` validated by zod (`windowSchema`), `slot_minutes` in the allowed set, `reservation_ref` optional.
  - `endWindow(db, id, on)` sets `effective_to`; when Postgres raises `availability_in_use: …`, the Result is `err('availability_in_use')`.
  - `addException(db, input)` — kind `closed` allows null times; kind `open` requires both (zod refine).
- [ ] **Step 2: Run** → modules missing.
- [ ] **Step 3: Implement** — types: `Location = { id; name; address; active; courts: Court[] }`, `Court = { id; locationId; name; active }`, `Window = { id; courtId; weekday; openLocal; closeLocal; effectiveFrom; effectiveTo; lessonBookable; slotMinutes; reservationRef }`, `AvailabilityException = { id; courtId; onDate; kind; openLocal; closeLocal; reason }`. Every write: `const { error } = await db.from('…').insert(row)…; if (error) return err(fromPostgres(error));`. Zod schemas: `locationSchema`, `courtSchema`, `windowSchema` (with `.refine(v => v.closeLocal > v.openLocal, { path: ['closeLocal'], message: 'Close must be after open' })`), `exceptionSchema`.
- [ ] **Step 4: Run** → green. **Step 5: Commit** — `git commit -m "feat(schedule): locations, courts, availability"`

### Task 5: `schedule/classes.ts`

- [ ] **Step 1: Failing tests** — `listTerms`, `createTerm` (`ends_on > starts_on` refine), `listClasses(termId)` with level keys joined from `class_skill_levels`→`skill_levels`, `createClass` (weekday 1–7, `start_time_local` HH:MM, `duration_minutes` ∈ {90,120}, capacity ≥ 1, optional default court/coach), `updateClass`, `setClassLevels(db, classId, keys)` → `rpc('set_class_levels', { p_class, p_level_keys })` and maps `unknown_skill_level`, `generateOccurrences(db, classId, from, to)` → `rpc('generate_class_sessions', …)` returning `{ created: number; skipped: string[] }`.
- [ ] **Step 2: Run** → fails. **Step 3: Implement.** **Step 4: Run** → green. **Step 5: Commit** — `git commit -m "feat(schedule): terms, class templates, occurrence generation"`

### Task 6: `schedule/sessions.ts`

- [ ] **Step 1: Failing tests**
  - `listDay(db, { locationId, localDate, tz })` selects `v_schedule_sessions` with `starts_at >= startsAt`, `starts_at < endsAt` (from `dayBounds`) and `location_id = locationId`, ordered by `starts_at`.
  - `createSession(db, input)` inserts the `sessions` row then the subtype row (`class_sessions` / `camp_sessions` / `team_sessions`) — for `class` the parent is required (zod discriminated union on `type`); a `23P01` from the first insert yields `slot_taken`; a `court_unavailable: …` token yields `court_unavailable`. On subtype-insert failure the session row is deleted (compensation) and the error returned.
  - `updateSession(db, id, patch)` updates `starts_at/ends_at/court_id/coach_id/notes`; same error mapping.
  - `setSessionLevels(db, id, keys)` → `rpc('set_session_levels', …)`.
  - `cancelSession(db, id, reason)` → `rpc('cancel_session', …)` returning the number of players made whole.
- [ ] **Step 2: Run** → fails. **Step 3: Implement** (`sessionSchema` = `z.discriminatedUnion('type', [...])` with `date` (YYYY-MM-DD), `start`/`end` (HH:MM), `courtId` (nullable only when `type === 'team'`), `coachId` optional, `notes` optional; convert local date+time to UTC with the academy tz using `dayBounds` + minutes offset). **Step 4: Run** → green. **Step 5: Commit** — `git commit -m "feat(schedule): sessions read model and writes"`

### Task 7: `schedule/camps.ts` and `schedule/teams.ts`

- [ ] **Step 1: Failing tests** — camps: `listCamps`, `createCamp` (dates, capacity ≥ 1; `camp_out_of_season` mapped), `addCampDay(db, campId, { date, start, end, courtId })` (a `camp` session + `camp_sessions` row via `createSession`). Teams: `listTeams`, `createTeam` (name + season unique → `conflict`), `roster(teamId)` (players with names via `players`), `addMember`/`removeMember` (sets `left_at`, never deletes), `addTeamSession` (kind practice/match; match requires opponent + home/away — zod refine; away matches may have no court).
- [ ] **Step 2–5:** run RED, implement, run GREEN, commit `git commit -m "feat(schedule): camps and teams"`.

### Task 8: Ports — DataTable, ResourceDayView, SessionForm, ClassTimeline, CampTimeline

**Files:** Create the five components; modify `src/lib/ds/index.ts`, `src/lib/ds/ds.test.ts`, `src/routes/styleguide/+page.svelte`.

- [ ] **Step 1: Failing SSR contract tests** (in `ds.test.ts`, one `it` per component, using `render` from `svelte/server` like the existing ones):
  - DataTable: renders `<th aria-sort>` for the sorted column, mono class on numeric cells, the `empty` line when `rows` is empty, and row cards under the 760px collapse (class present in markup).
  - ResourceDayView: one column per court, a block per session positioned by `start`/`end` (inline `style="--top:…;--height:…"` computed from `startHour` and `rowH`), cancelled sessions carry the struck mono label, the `draft.conflict` string renders inside an `ERROR:` mono line, the `nowTime` line renders only when given.
  - SessionForm: renders the type SegmentedControl, court and coach Selects, DateField, two TimeFields, TextArea, and the `conflict` Banner with the submit disabled.
  - ClassTimeline: three blocks; `variant="weekday"` shows `T+30`/`T+60`; weekend shows `T+40`/`T+80`.
  - CampTimeline: renders the default items in order with numbered frames.
- [ ] **Step 2: Run** → components missing.
- [ ] **Step 3: Port** each from its `.jsx`, values verbatim, inline styles → classes with tokens; callbacks become callback props (`onSessionClick`, `onSlotClick`, `onLocationChange`, `onSort`, `onPage`); `render` cells become a Svelte snippet prop `cell?: Snippet<[row, column]>`. ResourceDayView positions blocks with CSS custom properties, no JS layout. DataTable sorting and paging are links (`?sort=&dir=&page=`) so the admin lists work without JS.
- [ ] **Step 4: Run** `pnpm test` and `pnpm lint` (adherence gate) → green; add each to `/styleguide`. **Step 5: Commit** — `git commit -m "feat(ds): schedule, admin table and site timeline ports"`

### Task 9: Admin routes — schedule day view, session create/edit

**Files:** `src/routes/admin/+layout.svelte` (nav), `src/routes/admin/schedule/+page.server.ts`, `+page.svelte`, `new/+page.server.ts`, `new/+page.svelte`, `[id]/+page.server.ts`, `[id]/+page.svelte`.

- [ ] **Step 1: Failing tests** — route logic lives in the domain, so the tests here are: the `+page.server.ts` load helpers (`parseDayQuery(url, tz)` → `{ locationId, localDate }` defaulting to today in academy time and the first location) in `src/routes/admin/schedule/query.test.ts`; and an SSR render of `+page.svelte` with fixture data asserting the grid and the date heading `2026-09-12 · SATURDAY`.
- [ ] **Step 2: Run** → fails. **Step 3: Implement** — load: `getAcademyTimezone` → `parseDayQuery` → `listLocations` + `listDay`; the page composes `ResourceDayView` with `onSlotClick` navigating to `/admin/schedule/new?court=…&date=…&start=…` and `onSessionClick` to `/admin/schedule/[id]`. `new`: superforms with `sessionSchema`; on `slot_taken`/`court_unavailable` set the `conflict` prop from `describeError`. `[id]`: edit form + a level-tag form (checkbox per `skill_levels` row → `setSessionLevels`) + Cancel behind `Dialog` naming the made-whole count returned by `cancelSession`.
- [ ] **Step 4: Run** `pnpm check && pnpm test` → green. **Step 5: Commit** — `git commit -m "feat(admin): schedule day view, session create/edit"`

### Task 10: Admin routes — availability, classes, camps, teams

- [ ] **Step 1: Failing tests** — SSR renders of each `+page.svelte` with fixtures (headings, DataTable rows, empty states); zod schema tests already cover inputs.
- [ ] **Step 2–3:** implement `availability` (per location: courts DataTable, add-court form, per-court windows DataTable with an End action, exceptions list + add form), `classes` (terms + create; classes DataTable → `[id]` with template form, level checkboxes → `setClassLevels`, "Generate occurrences" form with `from`/`to` defaulting to the term; result line `CREATED 14 · SKIPPED 2`), `camps` (list + create → `[id]` with camp days), `teams` (list + create → `[id]` roster: player search by name across `players` (staff read policy), add/remove; team sessions form).
- [ ] **Step 4:** `pnpm check && pnpm lint && pnpm test` → green. **Step 5: Commit** — `git commit -m "feat(admin): availability, classes, camps, teams"`

### Task 11: Portal and public calendars

**Files:** `src/routes/(portal)/portal/schedule/+page.server.ts`, `+page.svelte`, `src/routes/schedule/+page.server.ts`, `+page.svelte`.

- [ ] **Step 1: Failing tests** — `filterForPlayer(sessions, levelKey | null)` in `src/lib/server/domain/schedule/sessions.ts`: untagged sessions always pass; tagged pass only when they include the key; a player without a level sees only untagged (mirrors `enforce_class_booking`). SSR render of the portal page groups by day with `academyDate` headings.
- [ ] **Step 2–3:** implement — portal load: the `?player=` context's `skill_level` key (from the layout's players list), `listRange(db, { from: today, days: 14, tz })` on the view, `filterForPlayer`. Public page: ClassTimeline + CampTimeline + the next 14 days of scheduled sessions from the view (anon RLS already limits to `scheduled`).
- [ ] **Step 4:** green. **Step 5: Commit** — `git commit -m "feat(schedule): portal and public calendars"`

### Task 12: Calendar spike (time-boxed, one hour)

- [ ] Install nothing yet. In a scratch route, render `@event-calendar/core`'s resource day view with the tokens and check the rules: no shadows, one radius, mono data strings, amber only on the now line. If any rule needs CSS overrides deeper than its variables, stop: the ResourceDayView port stays. Record the outcome as `docs/decisions/<date>-calendar-library.md` either way, and remove the scratch route.

### Task 13: e2e and the finish

**Files:** `e2e/admin-schedule.test.ts`, `playwright.config.ts` (no change unless a fixture is needed), `docs/PLAN.md`, `AGENTS.md`.

- [ ] **Step 1:** the test logs in with `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` from the environment (skip with a message when unset — CI has no admin), creates a court and a window at Murdock Park, a class on the window's weekday, generates one week, and asserts the block appears in `/admin/schedule?location=…&date=…`. Run it against dev: `pnpm build:dev && pnpm preview` then `pnpm test:e2e`.
- [ ] **Step 2:** gates — `pnpm env:check · pnpm check · pnpm lint · pnpm test · pnpm db:test · pnpm db:types` (no diff) `· pnpm build:dev`.
- [ ] **Step 3:** `AGENTS.md` (status, repo map: `schedule/` module, new routes and ports) and `docs/PLAN.md` (phase 3 row → built; decision log entry). Merge to `main`, `git branch -f deploy/dev main`, push both; confirm 0007 under dashboard → Database → Migrations; report and stop.

---

## Self-review

- Spec coverage: every PLAN phase-3 item (locations/courts/availability rules + exceptions, terms/classes/camps/teams CRUD, occurrence generation, ResourceDayView admin editor, public + portal read-only calendars) maps to Tasks 4–11.
- Placeholders: none — code is given where it defines an interface; ports point at the JSX they reproduce.
- Type consistency: `ScheduleDb`, `dayBounds`, `listDay`, `filterForPlayer`, `setSessionLevels`, `setClassLevels`, `generateOccurrences`, `cancelSession` are named identically across tasks.
