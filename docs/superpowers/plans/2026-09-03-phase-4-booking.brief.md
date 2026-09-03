# Phase 4 — Booking, credits & attendance — Brief

Expand into a full plan (superpowers:writing-plans) at phase start; post the questions first.

**Goal (PLAN exit):** a real week is bookable on dev with admin-granted credits; double-booking, the weekly cap and the waiver gate are enforced by the database.

**Already in place (0001):** `book_class`, `cancel_booking` (24-hour rule, reversal, forgiveness L), `promote_waitlist` (K), `finalize_bookings` (no-show settlement from attendance), `issue_credits` (the only issuance path — admin grants use it), `pick_lot`, `credit_ledger` + `v_lot_remaining` + `v_credit_balances`, `uq_one_class_per_scope_week`, `uq_active_class_booking`, `lesson_bookings`, `session_attendance`, `assert_waivers_signed()`; `src/lib/server/domain/booking/index.ts` (`bookClass`, `cancelBooking`); codes `weekly_cap`, `insufficient_credits`, `class_full`, `level_*`, `waiver_required`, `not_cancellable`, `beyond_booking_horizon`.

**Questions to open (default first):** private-lesson booking in this phase or phase 5 (this phase, admin-granted lesson credits); who may grant credits (admin only, reason required); waitlist visible to families (yes, position shown); attendance editable after `finalize_bookings` ran (staff yes, audited — the trigger already exists).

**Tasks:**
1. Migration 0008 only if 0001 lacks `book_lesson` / `grant_credits` wrappers — check first; harness §14 for anything added.
2. `domain/booking/`: split into `classes.ts` (list bookable sessions for a player: level, scope, horizon, waiver status; book; cancel), `lessons.ts`, `credits.ts` (balances per player from the views, admin grant via `issue_credits`, ledger listing gated by `can_view_financials`), `attendance.ts`, `waitlist.ts`.
3. Portal: `/portal/book` (sessions from `v_schedule_sessions` + eligibility), `/portal/bookings` (upcoming, cancel with the rule stated before confirming), `/portal/credits` (balances + ledger drill-in).
4. Coach: `/coach/sessions` (today/this week) and `/coach/sessions/[id]` (attendance marking; admin sees the same).
5. Admin: `/admin/credits` (grant form: player, product, reason) and a bookings view per session.
6. Booking confirmation email through `notify.sendTransactional` with `design-system/templates/email/booking-confirmation.html` ported to a text+HTML template; dev adapter prints.
7. Harness: cap, gate, both forgiveness paths, cancel-then-re-book, waitlist promotion — extend §5–§8 only where the phase adds behaviour; PGlite is single-connection, so the race proof is the constraint itself (say so in the plan).
8. e2e: a family with granted credits books and cancels on dev.

**Files:** `src/lib/server/domain/booking/*.ts` (+ tests), `src/routes/(portal)/portal/{book,bookings,credits}/`, `src/routes/coach/sessions/`, `src/routes/admin/credits/`, `src/lib/server/domain/notify/templates/booking-confirmation.ts`.

**Operator:** nothing new. Test families signed up on dev.
