# Phase 4 — Booking, credits & attendance — what was built

Companion to `2026-09-04-phase-4-booking.md` (the plan). Branch `phase-4/booking`.

## Opening questions — answered before any code

1. A required waiver with no published version **refuses booking** — the gate fails closed. Yes.
2. Cancelling **promotes the waitlist in the same transaction**. Yes.
3. **Private lessons ship this phase**, on granted credits; Artur was granted the `coach` role so
   `book_private_lesson` will accept him. Yes.
4. Admin grants are **kind + quantity + reason**, not product. Yes.
5. Grants stay admin-only · 6. Waitlist position is shown to families · 7. Attendance stays
   staff-editable after settlement, audited — with the consequence that correcting attendance does
   **not** re-settle a booking whose status already moved. No re-settlement action was built.

## Tasks

- [x] **1 — migration 0008 + harness §14.** Three gaps reading 0001 turned up, plus a fourth found
      while building: `waitlist_position`. See "What 0008 fixes" below.
- [x] **2 — error codes** `not_a_coach`, `unknown_kind`, `quantity_positive`.
- [x] **3 — `booking/credits.ts`** — balances (every kind, zero-filled), ledger, admin grant.
- [x] **4 — `booking/classes.ts`** — `listBookable`, `listBookings`, `cancelClass`,
      `cancellationNotice`; `getAcademySettings` added to `settings.ts`.
- [x] **5 — `booking/waitlist.ts`, `booking/attendance.ts`.**
- [x] **6 — `booking/lessons.ts`.**
- [x] **7 — the confirmation email** (`src/lib/ds/email/bookingConfirmation.ts`) and a
      `consoleMailer` dev adapter.
- [x] **8/9 — `/portal/book`, `/portal/bookings`, `/portal/credits`.**
- [x] **10 — `/coach/sessions` and `/coach/sessions/[id]`** (the register, and settlement).
- [x] **11 — `/admin/credits`.**
- [x] **12 — harness.** §14 plus a corrected §9; 117 checks.
- [x] **13 — e2e, gates, docs.**

## What 0008 fixes, and why each needed a migration

- **The consent gate opened when nothing was published.** `v_player_waiver_status` inner-joins
  `v_current_waiver_versions`, so a `required_for_participation` document with no published version
  contributed no unsatisfied rows and `assert_waivers_signed()` found nothing to refuse. Dev was in
  exactly that state. **Consequence: booking on dev is blocked until a waiver version is published**
  — see `docs/OPERATIONS.md` §7.
- **Nothing promoted the waitlist.** `cancel_booking` freed a seat and returned;
  `promote_waitlist` refuses a family caller, so it could not be the one to call it.
  `promote_waitlist_internal` is that loop without the staff check, granted to nobody.
- **A family could not count seats.** `v_class_session_seats` is deliberately owner-rights, unlike
  every view in 0001, and exposes four integers per session — no player id, no name, no booking id.
- **A family could not see their waitlist position.** `waitlist_position` is a definer function
  returning one integer about a player the caller actually guards.

## Decisions taken while building

- **`booking/lessons.ts` does not enumerate bookable slots**, as the plan sketched. Expanding
  availability windows into candidate times in TypeScript would be a second, weaker copy of
  `court_available()` that goes stale the moment an exception is added. The family sees the windows;
  the database decides the slot.
- **The confirmation email uses the service-role client**, because `notification_sends` has no
  insert policy for a family — one that could write it could forge a send. It never throws: a
  booking that succeeded must not be reported as failed because a mail provider was slow. This
  widens AGENTS.md's "service role: webhooks, cron only", which was updated in the same change.
- **Email templates live in `src/lib/ds/email/`**, where ported design-system assets live and where
  the adherence gate already honours the email kit's inline-hex exception — but out of the component
  barrel, since a string builder has no business in a client bundle.
- **Harness §9 was corrected, not worked around.** It asserted that an explicit `promote_waitlist`
  after a cancellation returns 1; it now returns 0 because the cancellation already promoted. The
  check reads the new sequence and pins that the second call is a no-op.

## Known limitations, by choice

- Cancelling needs JavaScript (the confirm is a `Dialog`). It fails closed, and booking itself,
  the register and the grant form all work without it.
- Correcting attendance after settlement does not re-settle the booking. Deliberate, per answer 7.
- There is no private-lesson booking *screen* yet: `booking/lessons.ts` and its windows read are
  built and tested, but the portal surface for them was not part of the exit criterion and is the
  first thing to add if lessons are wanted before phase 5.
- PGlite is single-connection, so no harness check proves the concurrent case. The race proof is
  the constraint itself: `uq_one_class_per_scope_week` and `uq_active_class_booking` are partial
  unique indexes and the court/coach clashes are GiST exclusions. Two simultaneous transactions
  cannot both win, and `book_class` already translates the loser's violation.

## Gates at the end

`pnpm env:check` · `pnpm check` (1935 files, **0 errors, 0 warnings**) · `pnpm lint` ·
`pnpm test` (**315**) · `pnpm db:test` (**117 checks**) · `pnpm db:types` (no diff) ·
`pnpm build:dev` · `pnpm test:e2e` (**13 passed, 2 skipped** — both admin walk-throughs wait for
credentials).

## Exit criterion

A real week is bookable with admin-granted credits: the grant goes through `issue_credits`, the
booking through `book_class`, and the weekly cap, capacity, the level tags and the waiver gate are
all refused by the database and shown in its own words. Cancelling returns the credit and promotes
the next family in the same transaction. Proven in the harness (§14) and in the SSR page tests; the
dev walk-through needs a published waiver version and the admin credentials.
