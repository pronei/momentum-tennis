# Phase 4 — Booking, credits & attendance — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A real week is bookable on dev with admin-granted credits — a guardian books a level-matched class against a scoped credit, cancels it and sees the reversal, joins a waitlist and is promoted when a seat frees; a coach marks attendance; and the weekly cap, the capacity limit and the waiver gate are all refused by the database, not by the app.

**Architecture:** 0001 already carries every rule: `book_class`, `book_private_lesson`, `cancel_booking` (notice window, reversal, forgiveness), `apply_forgiveness`, `promote_waitlist`, `finalize_bookings`, `issue_credits` as the single issuance path, `pick_lot`, the append-only `credit_ledger` with `v_lot_remaining` / `v_credit_balances`, and the two unique indexes that make the weekly cap and one-active-booking race-proof. Phase 4 adds one migration for the three things reading the model closely revealed it lacks, a `booking/` domain module split by concern, and the portal, coach and admin surfaces. **No rule is re-implemented in TypeScript.** The app pre-checks only to explain, never to decide.

**Tech Stack:** No new dependencies. SvelteKit 2 / Svelte 5 runes, superforms + zod4, Supabase RLS client, PGlite harness, vitest, Playwright.

**Branch:** `phase-4/booking` from `main`. **Migration:** `0008_booking.sql`. **Harness:** section 14.

---

## What reading 0001 revealed (the reason 0008 exists)

The brief expected 0008 to be unnecessary. Three findings say otherwise; each is a task below and each has an opening question.

1. **The consent gate opens when no waiver is published.** `v_player_waiver_status` *inner joins* `v_current_waiver_versions`, so a `required_for_participation` document with no published version contributes no rows, `assert_waivers_signed()` finds nothing unsatisfied, and booking proceeds. Dev is in exactly that state right now: `waiver_documents` holds `liability`, `waiver_versions` is empty. Phase 2's exit criterion is intact — publishing a *new* version does invalidate old signatures — but the empty case fails open, and the first thing phase 4 does is put that gate in front of real families.

2. **Nothing promotes the waitlist.** `promote_waitlist` exists and is correct, but no caller invokes it: `cancel_booking` frees a seat and returns. A family that cancels leaves the next family waitlisted indefinitely. `promote_waitlist` also refuses a non-staff caller (`staff_only`), so `cancel_booking` cannot simply call it.

3. **A family cannot count seats.** The portal wants "2 of 6 places left", but `read_class_bookings` admits only staff or the player's own guardian, so a guardian counting `class_bookings` sees their own child and nobody else. Every session would read as empty.

A fourth finding needs no migration: **`book_private_lesson` requires the coach to hold the `coach` role exactly** (`where account_id = p_coach and role = 'coach'`). Phase 3's coach picker offers `coach` **or** `admin`, so an admin-only Artur can be put on a class but not booked for a lesson — `not_a_coach`. The fix is data, not schema: grant Artur the `coach` role as well.

---

## Opening questions (recommended default first)

1. **A required waiver with no published version should refuse booking, not permit it.** Recommended yes — `assert_waivers_signed()` also raises `waiver_required` when a required document has no current version, so the gate fails closed. Alternative: leave it, and rely on the operator publishing v1 before opening booking.
2. **Cancelling promotes the waitlist immediately.** Recommended yes — `cancel_booking` calls an internal promotion after freeing a seat, so the next family gets it in the same transaction. Alternative: promote only from an admin button now and cron in phase 7, which leaves seats idle for hours.
3. **Private lessons ship in this phase**, on admin-granted `private_lesson` credits, and Artur is granted the `coach` role so he can be booked. Recommended yes. Alternative: defer lessons to phase 5, or relax the RPC to accept admins.
4. **Admin credit grants are by kind and quantity, not by product.** Recommended yes — `products` is empty until phase 5 and `issue_credits` already falls back to the academy defaults when `p_product` is null. A reason is required and the grant is audited.
5. Who may grant credits — **admin only** (the RPC already refuses everyone else). Yes.
6. Waitlist position visible to families — **yes**.
7. Attendance stays editable by staff after `finalize_bookings` has run — **yes**, audited by the existing trigger. Note the consequence: correcting attendance does **not** re-settle a booking whose status already moved; re-settlement is a separate staff action, and this plan does not build one.

Tasks below assume every recommended answer. Task 1 changes if 1 or 2 differ; Task 6 disappears if 3 differs.

---

## File structure

| file | responsibility |
|---|---|
| `supabase/migrations/0008_booking.sql` | fail-closed waiver gate; `promote_waitlist_internal` + `cancel_booking` calling it; `v_class_session_seats` (owner-privileged, counts only) |
| `supabase/tests/validate.mjs` §14 | behaviour of all three |
| `src/lib/server/domain/result.ts` | codes `not_a_coach`, `unknown_kind`, `quantity_positive` |
| `src/lib/server/domain/booking/credits.ts` | balances per player, ledger listing, admin grant through `issue_credits` |
| `src/lib/server/domain/booking/classes.ts` | bookable sessions for a player (level, scope, horizon, seats, cap, waiver), book, cancel |
| `src/lib/server/domain/booking/lessons.ts` | lesson-bookable windows, book, cancel |
| `src/lib/server/domain/booking/attendance.ts` | roster for a session, mark present/absent, settle |
| `src/lib/server/domain/booking/waitlist.ts` | position for a player, staff promote |
| `src/lib/server/domain/booking/index.ts` | existing `bookClass` / `cancelBooking` wrappers stay; re-export the new modules |
| `src/lib/server/domain/notify/templates/booking-confirmation.ts` | text + HTML from `design-system/templates/email/booking-confirmation.html` |
| `src/routes/(portal)/portal/book/` | the bookable fortnight for the `?player=` context |
| `src/routes/(portal)/portal/bookings/` | upcoming and past bookings; cancel behind the stated rule |
| `src/routes/(portal)/portal/credits/` | balances, expiry, ledger drill-in |
| `src/routes/coach/sessions/` + `[id]/` | today and this week; attendance marking |
| `src/routes/admin/credits/` | grant form; recent grants |
| `src/routes/admin/schedule/[id]/` | extend: who is booked on this session |
| `e2e/family-booking.test.ts` | a granted family books, cancels, and sees the reversal |

Domain modules take `BookingDb = Pick<SupabaseClient<Database>, 'from' | 'rpc'>`, colocate zod schemas, return `Result`, and are tested with the narrow fakes in `src/lib/server/domain/schedule/fakes.ts` (import them; do not write a third copy).

---

### Task 1: Migration 0008 — the three gaps

**Files:** Create `supabase/migrations/0008_booking.sql`. Modify `supabase/tests/validate.mjs` (append §14 before the summary lines).

- [ ] **Step 1: Write the failing harness section.** Append before `console.log(failures ? …`:

```js
// 14. Booking (0008): a fail-closed consent gate, waitlist promotion on cancel, seat counts
console.log('14. booking gate, waitlist promotion, seat counts (0008)');
await asUser(ADMIN);
// a required document with NO published version must block, not wave through
const p4doc = (
	await q(`insert into waiver_documents (slug, title) values ('media','Media release') returning id`)
).rows[0].id;
await expectErr(
	'a required document with no published version refuses booking',
	() => q(`select assert_waivers_signed($1)`, [maya]),
	'waiver_required'
);
await q(`update waiver_documents set required_for_participation = false where id = $1`, [p4doc]);
await expectOk('and stops refusing once it is not required', () =>
	q(`select assert_waivers_signed($1)`, [maya])
);

// seats: counts are readable without reading anybody's booking rows
const p4seats = (
	await q(`select capacity, booked, waitlisted from v_class_session_seats where session_id = $1`, [satW1])
).rows[0];
if (p4seats && p4seats.capacity === 2) ok('v_class_session_seats reports capacity and occupancy');
else { console.log('  ✗ seats', p4seats); failures++; }

// promotion: a cancellation hands the seat to the next family in line
await asUser(PARENT);
const p4booking = (await q(`select book_class($1,$2) as id`, [maya, tueW2])).rows[0].id;
await asUser(PARENT2);
const p4wait = (await q(`select book_class($1,$2) as id`, [ravi, tueW2])).rows[0].id;
const p4status = (await q(`select status from class_bookings where id = $1`, [p4wait])).rows[0].status;
await asUser(PARENT);
await q(`select cancel_booking('class', $1)`, [p4booking]);
const p4after = (await q(`select status from class_bookings where id = $1`, [p4wait])).rows[0].status;
if (p4status === 'waitlisted' && p4after === 'booked')
	ok('cancelling promotes the next waitlisted player in the same transaction');
else { console.log('  ✗ waitlist', p4status, '→', p4after); failures++; }
const p4led = (
	await q(`select count(*)::int as n from credit_ledger where booking_session_id = $1 and entry_type = 'consume'`, [tueW2])
).rows[0].n;
if (p4led === 2) ok('the promoted booking consumed its own credit');
else { console.log('  ✗ consume rows', p4led); failures++; }
```

- [ ] **Step 2: Run to verify it fails** — `pnpm db:test` → expected: `relation "v_class_session_seats" does not exist`, and the consent check passing where it should refuse.

  The section depends on fixtures section 4 created (`maya`, `ravi`, `satW1`, `tueW2`) and on capacity 2. If `tueW2` already carries bookings from sections 6–8, pick a session with a free seat and adjust the expected counts — read the surrounding sections before assuming.

- [ ] **Step 3: Write the migration**

```sql
-- ═══════════════════════════════════════════════════════════════════════════
-- Momentum Tennis — 0008: booking (phase 4)
--
-- 0001 carries every booking RULE. Three things reading it closely revealed:
--   • the consent gate opened when a required document had no published version
--     (v_player_waiver_status inner-joins the current-version view, so "nothing
--     published" produced no unsatisfied rows). It now fails closed.
--   • nothing promoted the waitlist — cancel_booking freed a seat and returned,
--     and promote_waitlist refuses a family caller, so it could not call it.
--   • a family cannot count seats: read_class_bookings admits only staff or the
--     player's own guardian, so every session read as empty.
--
-- Append-only: never edit this file once applied — add 0009.
-- ═══════════════════════════════════════════════════════════════════════════

-- A required document with no current version means "not ready", not "nothing to sign".
create or replace function public.assert_waivers_signed(p_player uuid) returns void
language plpgsql stable as $$
begin
  if exists (select 1 from v_player_waiver_status where player_id = p_player and not satisfied) then
    raise exception 'waiver_required' using errcode = 'check_violation';
  end if;
  if exists (
    select 1 from waiver_documents d
    where d.required_for_participation
      and not exists (select 1 from v_current_waiver_versions cv where cv.document_id = d.id)
  ) then
    raise exception 'waiver_required: no published version of a required document'
      using errcode = 'check_violation';
  end if;
end $$;

-- The promotion loop without the staff check, so a cancelling family can trigger it. Not granted
-- to anyone: it is reachable only from inside the SECURITY DEFINER functions that call it.
create function public.promote_waitlist_internal(p_session uuid)
returns int language plpgsql security definer set search_path = public as $$
declare r record; n int := 0; v_kind credit_kind; v_lot uuid; v_cap int; v_booked int; v_starts timestamptz;
begin
  select starts_at into v_starts from sessions where id = p_session and status = 'scheduled';
  if v_starts is null then return 0; end if;
  v_kind := case academy_scope(v_starts) when 'weekend' then 'class_weekend' else 'class_weekday' end;
  select c.capacity into v_cap from class_sessions cs join classes c on c.id = cs.class_id
   where cs.session_id = p_session;
  for r in select id, player_id from class_bookings
           where class_session_id = p_session and status = 'waitlisted' order by created_at loop
    select count(*) into v_booked from class_bookings
     where class_session_id = p_session and status = 'booked';
    exit when v_booked >= v_cap;
    begin
      perform pg_advisory_xact_lock(hashtextextended(r.player_id::text, 42));
      v_lot := pick_lot(r.player_id, v_kind);
      if v_lot is not null then
        update class_bookings set status = 'booked' where id = r.id;
        insert into credit_ledger (player_id, entry_type, delta, credit_kind, lot_id, booking_session_id, idempotency_key)
        values (r.player_id, 'consume', -1, v_kind, v_lot, p_session, 'consume:class_booking:' || r.id);
        n := n + 1;
      end if;
    exception when unique_violation or check_violation then
      null;                                            -- cap or capacity refused: stays waitlisted
    end;
  end loop;
  return n;
end $$;
revoke execute on function public.promote_waitlist_internal(uuid) from public, anon, authenticated;

-- cancel_booking, unchanged except for the last line of the class branch: a freed seat is offered
-- to the waitlist inside the same transaction, so nobody sits behind an empty place.
create or replace function public.cancel_booking(p_kind text, p_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_account uuid := auth.uid(); v_player uuid; v_session uuid; v_status booking_status;
        v_starts timestamptz; v_notice int; v_new booking_status; v_by_academy boolean; v_consume record;
        v_forgiven boolean := false; v_promoted int := 0;
begin
  if v_account is null then raise exception 'not_authenticated'; end if;
  if p_kind = 'class' then
    select player_id, class_session_id, status into v_player, v_session, v_status from class_bookings where id = p_id;
  elsif p_kind = 'lesson' then
    select player_id, session_id, status into v_player, v_session, v_status from lesson_bookings where session_id = p_id;
  else
    raise exception 'unknown_kind';
  end if;
  if v_player is null then raise exception 'unknown_booking'; end if;
  v_by_academy := is_staff();
  if not v_by_academy and not guards(v_player) then raise exception 'not_authorized'; end if;
  if v_status not in ('booked','waitlisted') then
    raise exception 'not_cancellable: %', v_status using errcode = 'check_violation';
  end if;
  select starts_at into v_starts from sessions where id = v_session;
  select cancel_notice_hours into v_notice from academy_settings;
  v_new := case
    when v_status = 'waitlisted' then 'cancelled'::booking_status
    when v_by_academy then 'cancelled_by_academy'::booking_status
    when v_starts - now() >= make_interval(hours => v_notice) then 'cancelled'::booking_status
    else 'cancelled_late'::booking_status end;
  if p_kind = 'class' then
    update class_bookings set status = v_new where id = p_id;
    if v_new = 'cancelled_late' then v_forgiven := apply_forgiveness(p_id); end if;
  else
    update lesson_bookings set status = v_new where session_id = p_id;
    update sessions set status = 'cancelled' where id = v_session;   -- free the court + coach
  end if;
  if v_status = 'booked' and v_new in ('cancelled','cancelled_by_academy') then
    select * into v_consume from credit_ledger
     where idempotency_key = case when p_kind = 'class' then 'consume:class_booking:' || p_id
                                  else 'consume:lesson:' || v_session end;
    if v_consume.id is not null then
      insert into credit_ledger (player_id, entry_type, delta, credit_kind, lot_id, booking_session_id,
                                 idempotency_key, created_by, reason)
      values (v_player, 'consume_reversal', -v_consume.delta, v_consume.credit_kind, v_consume.lot_id,
              v_session, 'reverse:' || v_consume.id, v_account, v_new::text)
      on conflict (idempotency_key) do nothing;
    end if;
  end if;
  -- NEW: the seat this cancellation freed goes to the next family in line.
  if p_kind = 'class' and v_status = 'booked' then
    v_promoted := promote_waitlist_internal(v_session);
  end if;
  return jsonb_build_object('status', v_new, 'forgiven', v_forgiven, 'promoted', v_promoted);
end $$;

-- Occupancy WITHOUT identities. Deliberately NOT security_invoker: a guardian may read only their
-- own class_bookings rows, so an invoker-rights view would report every session as empty. This one
-- runs with the owner's rights and exposes three integers per session and nothing else — no
-- player_id, no name, no booking id.
create view public.v_class_session_seats as
select cs.session_id,
       c.capacity,
       count(*) filter (where b.status = 'booked')::int      as booked,
       count(*) filter (where b.status = 'waitlisted')::int  as waitlisted,
       greatest(c.capacity - count(*) filter (where b.status = 'booked'), 0)::int as seats_left
from class_sessions cs
join classes c on c.id = cs.class_id
left join class_bookings b on b.class_session_id = cs.session_id
group by cs.session_id, c.capacity;

grant select on public.v_class_session_seats to anon, authenticated;
```

- [ ] **Step 4: Run to verify it passes** — `pnpm db:test` → `ALL CHECKS PASSED`. Then `pnpm db:types`; confirm `v_class_session_seats` and `promote_waitlist_internal` appear in `src/lib/server/db/database.types.ts`.

- [ ] **Step 5: Commit** — `git add supabase src/lib/server/db/database.types.ts && git commit -m "feat(schema): 0008 fail-closed consent gate, waitlist promotion on cancel, seat counts"`

### Task 2: Error codes

**Files:** Modify `src/lib/server/domain/result.ts`, `src/lib/server/domain/result.test.ts`.

- [ ] **Step 1: Failing test** — append to `result.test.ts`:

```ts
describe('booking refusals map to codes, not to unexpected', () => {
	it('maps the tokens the booking RPCs raise', () => {
		expect(fromPostgres({ message: 'not_a_coach' }).code).toBe('not_a_coach');
		expect(fromPostgres({ message: 'unknown_kind' }).code).toBe('unknown_kind');
		expect(fromPostgres({ message: 'quantity_positive' }).code).toBe('quantity_positive');
	});
});
```

- [ ] **Step 2: Run** — `pnpm exec vitest run src/lib/server/domain/result.test.ts` → fails, all three map to `unexpected`.
- [ ] **Step 3: Implement** — add the three to `CODES` and to `COPY`: `not_a_coach` → "That person does not coach private lessons."; `unknown_kind` → "That booking type does not exist."; `quantity_positive` → "Grant at least one credit."
- [ ] **Step 4: Run** → passes. **Step 5:** commit with Task 3.

### Task 3: `booking/credits.ts`

**Files:** Create `src/lib/server/domain/booking/credits.ts` and `credits.test.ts`.

- [ ] **Step 1: Failing tests** — with `fakeDb` / `called` imported from `../schedule/fakes`:
  - `balances(db, playerId)` reads `v_credit_balances` filtered by `player_id`, returning `{ creditKind, balance, nextExpiry }[]` with all three kinds present at zero when the view has no row for one — a family must see "0 weekend credits", not a missing line.
  - `ledger(db, playerId)` reads `credit_ledger` ordered by `created_at` descending, mapping `entry_type`/`delta`/`reason`; a `42501` becomes `not_authorized` (the row is money and `can_view_financials` gates it).
  - `grantSchema` requires a player, a kind in `class_weekday | class_weekend | private_lesson`, a quantity 1–100 and a non-empty reason.
  - `grantCredits(db, { playerId, kind, quantity, reason, token })` calls `rpc('issue_credits', { p_player, p_kind, p_quantity, p_idempotency_key: 'grant:' + token, p_reason })` and returns `{ lotId }`; a null `data` (the key was already used) returns `{ lotId: null }` and is **not** an error — that is the double-submit case.
  - `admin_only` and `quantity_positive` map through `fromPostgres`.
- [ ] **Step 2: Run** → module missing.
- [ ] **Step 3: Implement.** The idempotency key is `grant:{token}` where the token is a `crypto.randomUUID()` the *load* function put in a hidden field, so a refresh or double-click re-sends the same key and `issue_credits` no-ops on conflict. Never generate the token in the action.
- [ ] **Step 4: Run** → green. **Step 5: Commit** — `git commit -m "feat(booking): credit balances, ledger and admin grants"`

### Task 4: `booking/classes.ts`

**Files:** Create `src/lib/server/domain/booking/classes.ts` and `classes.test.ts`.

- [ ] **Step 1: Failing tests**
  - `listBookable(db, { playerId, levelKey, from, days, tz })` reads `v_schedule_sessions` for `session_type = 'class'`, `status = 'scheduled'` across the range, joins `v_class_session_seats` by session id, and returns each session with `{ seatsLeft, waitlisted, alreadyBooked, weekBlocked, scope }`.
  - Level filtering reuses `filterForPlayer` from `schedule/sessions.ts` — assert an untagged session passes for a player with no level and a mismatched session does not. Do **not** write a second copy of that rule.
  - `weekBlocked` is true when the player already holds a `booked` class in the same `scope` and ISO week — computed from the player's own `class_bookings` (readable: they are the guardian) using `isoWeekStart` and `scopeOf` from `time.ts`, which mirror `academy_week_start()` and `academy_scope()`.
  - A session beyond `booking_horizon_days` is excluded; the horizon comes from `academy_settings`, never hard-coded.
  - `book(db, { playerId, sessionId })` calls `rpc('book_class', …)` and maps `weekly_cap`, `insufficient_credits`, `class_full`, `level_required`, `level_mismatch`, `already_booked`, `waiver_required`, `beyond_booking_horizon`, `session_not_bookable`.
  - `listBookings(db, { playerId, upcoming })` reads `class_bookings` with the session joined, ordered by `starts_at`, split on `starts_at >= now()`.
  - `cancel(db, bookingId)` calls `rpc('cancel_booking', { p_kind: 'class', p_id })` and returns `{ status, forgiven, promoted }`.
  - `cancellationNotice(startsAt, noticeHours, now)` — pure — returns `'free' | 'late'` so the UI can state the rule *before* the guardian confirms. Assert the boundary: exactly `noticeHours` before the start is still `'free'`, mirroring `>=` in SQL.
- [ ] **Step 2: Run** → fails. **Step 3: Implement.** **Step 4: Run** → green.
- [ ] **Step 5: Commit** — `git commit -m "feat(booking): bookable classes, booking and cancellation"`

### Task 5: `booking/waitlist.ts` and `booking/attendance.ts`

**Files:** Create both modules and their tests.

- [ ] **Step 1: Failing tests**
  - `waitlistPosition(db, { sessionId, playerId })` counts `waitlisted` rows for that session created before this player's, returning `1`-based position or `null` when not waitlisted. A family may read only its own row, so the count comes from `v_class_session_seats.waitlisted` plus the player's own `created_at` — assert it does not try to read other families' rows.
  - `promote(db, sessionId)` calls `rpc('promote_waitlist', …)` and maps `staff_only`.
  - `roster(db, sessionId)` reads `class_bookings` for the session with player names and any existing `session_attendance` row, returning `{ playerId, fullName, status, present }[]` ordered by name; staff-only in practice.
  - `mark(db, { sessionId, playerId, present, markedBy })` upserts `session_attendance` with `marked_by`, mapping `42501` to `not_authorized` — the insert policy requires `marked_by = auth.uid()`.
  - `settle(db, endedBefore)` calls `rpc('finalize_bookings', { p_ended_before })` and returns the count.
- [ ] **Step 2–5:** run RED, implement, run GREEN, commit `git commit -m "feat(booking): waitlist position and attendance"`.

### Task 6: `booking/lessons.ts`

**Files:** Create `src/lib/server/domain/booking/lessons.ts` and `lessons.test.ts`.

- [ ] **Step 1: Failing tests**
  - `lessonSlots(db, { from, days, tz })` reads `court_availability` rows with `lesson_bookable = true` that are in force across the range and expands them into `{ courtId, courtName, date, start, end }` candidates at `slot_minutes` intervals, dropping any that `court_available()` would refuse — call `rpc('court_available', …)` rather than reimplementing the rule.
  - `lessonSchema` requires a player, a coach, a court, a date and a start, with `credits` defaulting to 1.
  - `bookLesson(db, input, tz)` converts the local date and time with `localInstant` and calls `rpc('book_private_lesson', { p_player, p_coach, p_court, p_starts, p_ends, p_credits })`, mapping `not_a_coach`, `slot_not_bookable`, `slot_taken`, `insufficient_credits`, `waiver_required`.
  - `cancelLesson(db, sessionId)` calls `cancel_booking` with kind `lesson`.
- [ ] **Step 2–5:** run RED, implement, run GREEN, commit `git commit -m "feat(booking): private lessons"`.

### Task 7: The booking-confirmation email

**Files:** Create `src/lib/server/domain/notify/templates/booking-confirmation.ts` and its test.

- [ ] **Step 1: Failing test** — `bookingConfirmation({ playerName, title, whenLocal, where, creditsLeft })` returns `{ subject, text, html }`; the subject carries the session and the academy-time stamp; the text version contains every fact the HTML does (a plain-text reader must not lose the where or the when); the HTML contains no `<script>` and no external image.
- [ ] **Step 2: Run** → module missing.
- [ ] **Step 3: Implement** by porting `design-system/templates/email/booking-confirmation.html`, keeping its inline hex (the recorded exception in `design-system/templates/email/README.md`) and substituting the fields. Send through `sendTransactional` with `trigger_key = 'booking:' + bookingId` so an overlapping retry cannot double-send.
- [ ] **Step 4: Run** → green. **Step 5: Commit** — `git commit -m "feat(notify): booking confirmation template"`

### Task 8: Portal — `/portal/book`

**Files:** `src/routes/(portal)/portal/book/+page.server.ts`, `+page.svelte`, `book.test.ts`.

- [ ] **Step 1: Failing tests** — an SSR render with fixtures asserting: a bookable session shows its seats and a Book action; a full session shows "WAITLIST" instead; a session the player is already booked on says so and offers no second Book; a session blocked by the weekly cap explains which week and offers no Book; and with no credits of the right scope the page says so and links to `/portal/credits`.
- [ ] **Step 2: Run** → fails. **Step 3: Implement** — load: `getAcademyTimezone` → `listBookable` for the `?player=` context → `balances`; the page groups by academy date exactly as `/portal/schedule` does. One action, `book`, calling `booking/classes.book` and returning `describeError` on refusal. Every refusal the database can raise is displayed verbatim from `COPY`; the page never decides eligibility itself.
- [ ] **Step 4: Run** `pnpm check && pnpm test` → green. **Step 5: Commit** — `git commit -m "feat(portal): booking a class"`

### Task 9: Portal — `/portal/bookings` and `/portal/credits`

**Files:** the two route pairs plus a shared SSR test file.

- [ ] **Step 1: Failing tests** — bookings: upcoming and past sections; a cancel button whose confirm names the consequence (`cancellationNotice` → "the credit returns" or "this is inside 24 hours and the credit is forfeited"); a waitlisted row shows its position. Credits: a balance line per kind with its next expiry, and a ledger table whose rows read `PURCHASE +10`, `CONSUME −1`, `REVERSAL +1`, `FORGIVE +1`, `EXPIRE −n`.
- [ ] **Step 2–3:** implement. The cancel confirm is a `Dialog`, so it needs JavaScript and fails closed; the ledger and balances work without it.
- [ ] **Step 4:** green. **Step 5: Commit** — `git commit -m "feat(portal): bookings and credits"`

### Task 10: Coach — `/coach/sessions` and `/coach/sessions/[id]`

**Files:** `src/routes/coach/+layout.svelte`, `sessions/+page.{server.ts,svelte}`, `sessions/[id]/+page.{server.ts,svelte}`, one SSR test file.

- [ ] **Step 1: Failing tests** — the list shows today's sessions first with a mono day heading; the detail page lists the roster with a present/absent control per player and a mono count of who is marked; a session with no bookings says so.
- [ ] **Step 2–3:** implement. `hooks.server.ts` already refuses non-staff on `/coach`. Marking posts one form per player so it works without JavaScript; `marked_by` is `locals.user.id`, which the insert policy requires.
- [ ] **Step 4:** green. **Step 5: Commit** — `git commit -m "feat(coach): session list and attendance"`

### Task 11: Admin — `/admin/credits` and bookings per session

**Files:** `src/routes/admin/credits/+page.{server.ts,svelte}`, modify `src/routes/admin/schedule/[id]/+page.{server.ts,svelte}`, extend `src/routes/admin/admin-pages.test.ts`.

- [ ] **Step 1: Failing tests** — the grant form renders player, kind, quantity and reason, and refuses an empty reason; the hidden idempotency token is present in the markup; the session page lists who is booked with their status.
- [ ] **Step 2–3:** implement. Player choice reuses `searchPlayers` from `identity/players.ts`. Recent grants are read from `credit_ledger` where `entry_type = 'adjust'`.
- [ ] **Step 4:** green. **Step 5: Commit** — `git commit -m "feat(admin): credit grants and session bookings"`

### Task 12: Harness — the invariants phase 4 leans on

**Files:** Modify `supabase/tests/validate.mjs` (§14 continued).

- [ ] Sections 5–8 already prove the weekly cap, the waiver gate, both forgiveness paths, cancel-then-re-book and waitlist promotion. Add only what phase 4 introduces: that a promoted booking's consume row is keyed on the *booking* and not the session (so cancel-then-re-book stays legal), and that a second grant with the same idempotency key issues nothing.
- [ ] **A note the plan owes the reader:** PGlite is single-connection, so no harness check can prove the concurrent case. The race proof is the constraint itself — `uq_one_class_per_scope_week` and `uq_active_class_booking` are partial unique indexes, and `no_court_overlap` / `no_coach_overlap` are GiST exclusions. Two simultaneous transactions cannot both win; the loser gets a unique or exclusion violation, which `book_class` already translates. Do not add a fake concurrency test that passes by accident.
- [ ] **Commit** — `git commit -m "test(schema): booking invariants phase 4 depends on"`

### Task 13: e2e and the finish

**Files:** `e2e/family-booking.test.ts`, `docs/PLAN.md`, `AGENTS.md`, the phase checklist.

- [ ] **Step 1:** the spec logs in as the admin, grants a weekday credit to a player, logs in as that player's guardian, books the next weekday class, sees it under `/portal/bookings`, cancels it, and sees the balance return on `/portal/credits`. It skips with a message when `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` are unset, exactly as `admin-schedule.test.ts` does. A guardian account on dev is a prerequisite — note it in `docs/OPERATIONS.md` §7.
- [ ] **Step 2:** gates — `pnpm env:check · pnpm check · pnpm lint · pnpm test · pnpm db:test · pnpm db:types` (no diff) `· pnpm build:dev · pnpm test:e2e`.
- [ ] **Step 3:** update `AGENTS.md` (status, repo map) and `docs/PLAN.md` (phase 4 row → built, decision log); write the checklist beside this plan. Merge to `main`, `git branch -f deploy/dev main`, push both; confirm 0008 on dev; report and stop.

---

## Self-review

- **Spec coverage:** every brief task maps here — 0008 (Task 1, and it *is* needed, for reasons the brief could not have known), the five domain modules (3–6), portal (8–9), coach (10), admin (11), the email (7), harness (12), e2e (13).
- **Placeholders:** none. Where a task defines an interface the code is given; where it composes existing pieces the exact functions and their sources are named.
- **Type consistency:** `BookingDb`, `balances`, `ledger`, `grantCredits`, `listBookable`, `book`, `cancel`, `cancellationNotice`, `listBookings`, `waitlistPosition`, `promote`, `roster`, `mark`, `settle`, `lessonSlots`, `bookLesson`, `cancelLesson` are used identically across tasks. `filterForPlayer`, `isoWeekStart`, `scopeOf`, `localInstant`, `searchPlayers` and `fakeDb` are reused from phase 3 rather than redefined.
- **Risk the plan carries deliberately:** Task 1 replaces two functions from 0001 with `create or replace`. That is the sanctioned way to change SQL behaviour under an append-only migration policy — the file 0001 is never edited; 0008 supersedes it, and the harness runs the whole directory in order, so what the tests exercise is the final state.
