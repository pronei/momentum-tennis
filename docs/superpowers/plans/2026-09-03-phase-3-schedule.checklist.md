# Phase 3 — Schedule & availability — what was built

Companion to `2026-09-03-phase-3-schedule.md` (the plan). Branch `phase-3/schedule`.

## Opening questions — answered before any code

1. Coach choices = staff with `coach` **or** `admin` — yes. Artur runs the academy and teaches
   most of it; a coach-only list would omit the main coach (`coachChoices` in `identity/staff.ts`).
2. Court-less sessions only for team **away** matches — yes, encoded as a refinement in
   `sessionSchema`, because the availability trigger only bites when a court is set.
3. Generation horizon = the whole term, re-runnable — yes.
4. Public `/schedule` in scope, read-only — yes.
5. Camp registration deferred to phase 5 (it needs a purchase) — yes; phase 3 schedules camp days.
6. Coach availability stays unmodelled per decision H — yes; `no_coach_overlap` is the guard.

## Tasks

- [x] **1 — migration 0007 + harness §13.** `set_session_levels` / `set_class_levels` replace a
      tag set in one act; `v_schedule_sessions` is the one read model every calendar reads,
      `security_invoker` so the caller's RLS still decides the rows. Grants are explicit: 0001's
      blanket revoke only covered the functions that existed then, and a new function is created
      with EXECUTE for PUBLIC.
- [x] **2 — error codes.** `availability_in_use`, `camp_out_of_season`, `unknown_class`.
      `camp_full` waits for phase 5, where registration is the first thing that can raise it.
- [x] **3 — `dayBounds` and `localInstant` in `time.ts`.** Both read the zone offset at the
      answer, not at the guess, so a 25-hour day and a session on a DST morning are both right.
- [x] **4 — `schedule/locations.ts`, `schedule/availability.ts`.**
- [x] **5 — `schedule/classes.ts`** — terms, templates, `setClassLevels`, `generateOccurrences`.
- [x] **6 — `schedule/sessions.ts`** — `listDay`, `listRange`, `listByParent`, `getSession`,
      `createSession` (+ compensation), `updateSession`, `setSessionLevels`, `cancelSession`,
      `filterForPlayer`.
- [x] **7 — `schedule/camps.ts`, `schedule/teams.ts`** — both write through `createSession`.
- [x] **8 — ports.** `admin/DataTable`, `schedule/ResourceDayView`, `schedule/SessionForm`,
      `site/ClassTimeline`, `site/CampTimeline`; all five in `/styleguide`.
- [x] **9 — `/admin/schedule`** day grid, `new`, `[id]`.
- [x] **10 — `/admin/availability`, `/admin/classes`, `/admin/camps`, `/admin/teams`.**
- [x] **11 — `/portal/schedule` and the public `/schedule`.**
- [x] **12 — calendar spike.** `docs/decisions/2026-09-03-calendar-library.md`: no dependency.
- [x] **13 — e2e, gates, docs.**

## Decisions taken while building

- **`sessionSchema` is one flat object with refinements, not the planned discriminated union.**
  superforms needs a single object shape to carry defaults and errors for a form; the type-specific
  rules read perfectly well as refinements, and a test pins that `superValidate` accepts it.
- **`createSession` validates its own input.** Routes arrive through superforms, but `camps.ts` and
  `teams.ts` assemble a session themselves, and the single writer should not trust every caller.
- **Sorting, paging, day and venue navigation are links.** The admin console works with JavaScript
  off. `DataTable` takes `sortHref`/`pageHref`, `ResourceDayView` takes `sessionHref`.
- **The create form's type is both a control and four `?type=` links** — a SegmentedControl alone
  cannot change the posted type without JavaScript.
- **ResourceDayView scrolls horizontally on mobile** instead of dropping to a single court with a
  Select, so a coach courtside keeps every column without JavaScript.
- **The timelines drop the reference's `tabindex` on each row.** Nothing in a row is actionable and
  every value is already text; five dead tab stops cost a keyboard user more than the amber
  hover state gains them.
- **0007 grants `select` on the view explicitly** rather than relying on the project's default
  privileges for new objects. It had not been applied anywhere when this was added.

## Known limitations, by choice

- Cancelling a session needs JavaScript (the confirm is a `Dialog`). It fails closed — the action
  simply is not offered — and every other form on the page works without it.
- Clicking an empty slot to pre-fill a new session is not wired. It needs a client-side
  measurement, and the "New session" link covers creation without one. The port still supports it.
- The location switcher inside `ResourceDayView` has no accessible name, exactly as its reference
  does. The app does not use it: `/admin/schedule` renders venue links instead.
- Camp registration and any booking are out of scope by answer 5 and by the phase itself.

## Gates at the end

`pnpm env:check` · `pnpm check` (1894 files, **0 errors, 0 warnings**) · `pnpm lint` ·
`pnpm test` (**246**) · `pnpm db:test` (**109 checks**) · `pnpm db:types` (no diff) ·
`pnpm build:dev` · `pnpm test:e2e` (**11 passed, 1 skipped** — the admin walk-through waits for an
admin account on dev).

## Exit criterion

Artur can enter the real fall schedule — locations, courts, reservation windows with their venue
reference, terms, class templates with level tags, generated occurrences, camps and teams — and the
calendar renders it in academy time for admin, families and the public. Proven in the database by
harness §13 and in the app by the SSR page tests; the dev walk-through needs the first admin
account (`docs/OPERATIONS.md` §2), which is an operator step.
