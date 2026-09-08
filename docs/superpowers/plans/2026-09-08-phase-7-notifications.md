# Phase 7 — Notifications & lifecycle — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The cron worker drives five idempotent jobs — class reminders, low-credit nudges, credit expiry, booking finalisation, re-consent campaigns — and a family that opts in receives the newsletter with a working unsubscribe link; overlapping runs cannot double-send, and marketing can never travel through the transactional path.

**Architecture:** Phase 0 built the shape: `workers/cron` fires Cron Triggers at `POST /internal/cron` with a shared secret; `domain/cron.ts` maps the cron expression to jobs; `notification_sends` dedupes on `trigger_key` insert-first; `send.ts` makes marketing without consent a type error; `expire_credits()` and `finalize_bookings()` are SQL and already idempotent. Phase 7 adds **one migration** with the read models the mail jobs need (`v_upcoming_reminders`, `v_low_credit_players`, `v_reconsent_needed`, `v_marketing_recipients`), an unsubscribe token on `marketing_consents` with a public RPC, and a `newsletter_issues` table; turns `cron.ts` into a registry of SQL *and* TypeScript jobs; ports the four remaining email templates; and adds the preference centre, the unsubscribe page and the admin newsletter. Sends run through the service role; keys name the exact fact being announced so a job can run any number of times.

**Tech Stack:** No new dependencies (`resend@6` is installed). SvelteKit 2 / Svelte 5, zod4, Supabase, PGlite harness, vitest, Playwright.

**Branch:** `phase-7/notifications` from `main`. **Migration:** `0011_notifications.sql`. **Harness:** section 17.

---

## Opening questions (recommended default first)

1. **Reminder timing.** 24 hours before a class, sent by an hourly job that looks at every booked class starting within the next 24 hours; the key `class_reminder:{session}:{account}:{player}` means a missed hour is caught by the next run and nothing is sent twice. Alternative: a fixed evening digest.
2. **Low-credit threshold.** `academy_settings.low_credit_threshold` (2), never hard-coded; balance 0 counts (the family can no longer book). One nudge per **lot** (`low_credits:{player}:{kind}:{lot}`), so a new pack re-arms it. Yes.
3. **Newsletter cadence and copy owner.** Artur writes and sends each issue by hand from `/admin/newsletter`; no schedule. The consent line, the unsubscribe copy and the preference-centre copy come **from legal** — the pages ship with `FROM LEGAL —` placeholders exactly as the waiver did. Yes.
4. **Re-consent campaign trigger.** A daily job: every guardian of a player whose required document is unsatisfied gets one mail per published version (`reconsent:{version}:{account}:{player}`), so publishing v3 mails once, and a family that signs stops appearing. Yes.
5. **Private-lesson reminders.** Not in this phase — the class-reminder template's copy is class-specific ("three blocks"). Lessons follow with their own template.
6. **The newsletter's physical mailing address** (legally required in the footer) is a non-secret variable `MAILING_ADDRESS`; sending refuses while it is unset. Yes.
7. **Unsubscribe is one click but never on GET**: the link lands on a page with one button, so a mail scanner that prefetches links cannot unsubscribe a family. Yes.
8. **Recipients of a player's transactional mail**: every active guardian account that may see the fact — for reminders and re-consent, any guardian (`role <> 'self' or the player is an adult`); for low credits, only accounts `can_view_financials` admits (a minor's own restricted login never receives money mail). Yes.

---

## File structure

**Migration & harness** — create `supabase/migrations/0011_notifications.sql`; modify `supabase/tests/validate.mjs` (section 17); regenerate types.

**Config** — modify `src/lib/server/config.ts` (+ test): `MAILING_ADDRESS` optional non-secret; `wrangler.toml` vars; `.env.example`; `config/*.yaml`; `scripts/check-env.mjs` reports it as "not configured yet" when blank.

**Domain** — modify `src/lib/server/domain/cron.ts` (+ test): the job registry. Create `src/lib/server/domain/notify/mailer.runtime.ts` (`mailerFor(cfg)` — Resend or console; replaces the copies in `book/notify.ts` and `payments/receipt.ts`), `notify/jobs/remindClasses.ts`, `nudgeLowCredits.ts`, `reconsentCampaign.ts` (+ tests), `notify/newsletter.ts` (+ test), `notify/consent.ts` (+ test: `setConsent`, `unsubscribeByToken`, `issueSchema`, `listIssues`, `saveIssue`).

**Email ports** — create `src/lib/ds/email/classReminder.ts`, `lowCredits.ts`, `reconsentRequest.ts`, `newsletter.ts`; modify `email.test.ts`.

**Routes** — modify `src/routes/internal/cron/+server.ts`; create `src/routes/(portal)/portal/preferences/`, `src/routes/unsubscribe/[token]/`, `src/routes/admin/newsletter/` (+ `[id]`); modify the portal and admin layouts; `workers/cron/wrangler.toml` (hourly trigger).

**Docs** — `docs/OPERATIONS.md` §5 (cron worker per environment) and §7, `docs/PLAN.md`, `AGENTS.md`, the checklist.

---

### Task 1: Migration 0011 and harness §17

**Files:** Create `supabase/migrations/0011_notifications.sql`; modify `supabase/tests/validate.mjs`.

- [ ] **Step 1: Failing harness section** (RED until the migration exists; `PARENT`, `PARENT2`, `ADMIN`, `v2`, `term`, `loc`, `monday`, `D` in scope):

```js
console.log('17. notifications — read models, dedupe, consent (0011)');

// (a) a booked class within 24 hours appears once per guardian; a cancelled booking does not
await asUser(ADMIN);
const p7court = (await q(`insert into courts (location_id, name) values ($1,'MP-7') returning id`, [loc])).rows[0].id;
await q(`insert into court_availability (court_id, weekday, open_local, close_local, effective_from) values ($1, 3, '16:00', '20:00', $2)`, [p7court, monday]);
const p7class = (await q(`insert into classes (term_id, name, weekday, start_time_local, duration_minutes, capacity, default_court_id) values ($1,'P7 Wed',3,'16:00',90,4,$2) returning id`, [term, p7court])).rows[0].id;
await q(`select generate_class_sessions($1,$2,$3)`, [p7class, monday, D.next_sunday]);
const p7sid = (await q(`select cs.session_id from class_sessions cs join sessions s on s.id = cs.session_id where cs.class_id = $1 and s.starts_at > now() order by s.starts_at limit 1`, [p7class])).rows[0].session_id;
await asUser(PARENT);
const p7player = (await q(`select create_player('Ivy W.', '2015-09-09', 'parent') as id`)).rows[0].id;
await q(`select sign_waiver($1,$2,'Priya R.')`, [v2, p7player]);
await asUser(ADMIN);
await q(`select issue_credits($1,'class_weekday',2,'grant:p7', null, null, null, 'phase 7')`, [p7player]);
await asUser(PARENT);
const p7booking = (await q(`select book_class($1,$2) as id`, [p7player, p7sid])).rows[0].id;
await asUser(null);
// the session is two weeks out; the view is time-windowed, so test its predicate with the window widened
const p7rem = (await q(`select account_id, player_id, session_id from v_upcoming_reminders_within(interval '30 days') where session_id = $1`, [p7sid])).rows;
if (p7rem.length === 1 && p7rem[0].account_id === PARENT && p7rem[0].player_id === p7player)
	ok('v_upcoming_reminders lists the booking once, for its guardian');
else { console.log('  ✗ reminders', p7rem); failures++; }
const p7soon = (await q(`select count(*)::int as n from v_upcoming_reminders where session_id = $1`, [p7sid])).rows[0].n;
if (p7soon === 0) ok('the 24-hour view does not yet list a session two weeks out');
else { console.log('  ✗ window', p7soon); failures++; }
await asUser(PARENT);
await q(`select cancel_booking('class', $1)`, [p7booking]);
await asUser(null);
const p7gone = (await q(`select count(*)::int as n from v_upcoming_reminders_within(interval '30 days') where session_id = $1`, [p7sid])).rows[0].n;
if (p7gone === 0) ok('a cancelled booking is not reminded');
else { console.log('  ✗ cancelled still listed', p7gone); failures++; }

// (b) low credits: at or below the threshold, keyed by the latest lot; not above it
const p7low = (await q(`select player_id, credit_kind, balance, latest_lot_id, account_id from v_low_credit_players where player_id = $1`, [p7player])).rows;
if (p7low.length === 1 && p7low[0].balance === 2 && p7low[0].latest_lot_id && p7low[0].account_id === PARENT)
	ok('v_low_credit_players lists a player at the threshold with the lot that will key the nudge');
else { console.log('  ✗ low credits', p7low); failures++; }
await asUser(ADMIN);
await q(`select issue_credits($1,'class_weekday',5,'grant:p7b', null, null, null, 'phase 7')`, [p7player]);
await asUser(null);
const p7ok = (await q(`select count(*)::int as n from v_low_credit_players where player_id = $1 and credit_kind = 'class_weekday'`, [p7player])).rows[0].n;
if (p7ok === 0) ok('above the threshold the player drops out of the view');
else { console.log('  ✗ still low', p7ok); failures++; }

// (c) re-consent: a new published version puts the guardian in the campaign view, signing removes them
await asUser(ADMIN);
const p7doc = (await q(`select id from waiver_documents where slug = 'liability'`)).rows[0].id;
const p7v3 = (await q(`select create_waiver_draft($1, 'FROM LEGAL v3') as id`, [p7doc])).rows[0].id;
await q(`select publish_waiver_version($1)`, [p7v3]);
await asUser(null);
const p7rc = (await q(`select account_id, player_id, version_id from v_reconsent_needed where player_id = $1`, [p7player])).rows;
if (p7rc.length === 1 && p7rc[0].account_id === PARENT && p7rc[0].version_id === p7v3)
	ok('v_reconsent_needed names the guardian and the version to sign');
else { console.log('  ✗ reconsent', p7rc); failures++; }
await asUser(PARENT);
await q(`select sign_waiver($1,$2,'Priya R.')`, [p7v3, p7player]);
await asUser(null);
const p7rc2 = (await q(`select count(*)::int as n from v_reconsent_needed where player_id = $1`, [p7player])).rows[0].n;
if (p7rc2 === 0) ok('signing the new version ends the campaign for that player');
else { console.log('  ✗ still needed', p7rc2); failures++; }

// (d) dedupe is a database fact: the same trigger_key cannot be recorded twice
await q(`insert into notification_sends (trigger_key, category, recipient_account_id, template) values ('p7:once','transactional',$1,'class-reminder')`, [PARENT]);
await expectErr('a second send with the same key is refused', () => q(`insert into notification_sends (trigger_key, category, recipient_account_id, template) values ('p7:once','transactional',$1,'class-reminder')`, [PARENT]), 'duplicate key');

// (e) consent: opt in as the family, unsubscribe by token without a login, unknown token is false
await db.exec('set role authenticated');
await asUser(PARENT);
await q(`insert into marketing_consents (account_id, subscribed, source) values ($1, true, 'preferences') on conflict (account_id) do update set subscribed = true`, [PARENT]);
const p7tok = (await q(`select token from marketing_consents where account_id = $1`, [PARENT])).rows[0].token;
await db.exec('reset role');
await asUser(null);
const p7rcp = (await q(`select count(*)::int as n from v_marketing_recipients where account_id = $1`, [PARENT])).rows[0].n;
if (p7tok && p7rcp === 1) ok('a subscribed account is a marketing recipient with a token');
else { console.log('  ✗ recipient', p7tok, p7rcp); failures++; }
await db.exec('set role anon');
const p7un = (await q(`select unsubscribe_by_token($1) as done`, [p7tok])).rows[0].done;
const p7un2 = (await q(`select unsubscribe_by_token('00000000-0000-4000-8000-000000000000') as done`)).rows[0].done;
await db.exec('reset role');
const p7sub = (await q(`select subscribed from marketing_consents where account_id = $1`, [PARENT])).rows[0].subscribed;
if (p7un === true && p7un2 === false && p7sub === false) ok('unsubscribe_by_token works for anon, once, and is false for an unknown token');
else { console.log('  ✗ unsubscribe', p7un, p7un2, p7sub); failures++; }

// (f) newsletter issues are admin-only
await db.exec('set role authenticated');
await asUser(PARENT);
await expectErr('a family cannot write newsletter issues', () => q(`insert into newsletter_issues (subject, headline, lead, body) values ('x','x','x','x')`), 'row-level security');
await asUser(ADMIN);
await expectOk('an admin can', () => q(`insert into newsletter_issues (subject, headline, lead, body) values ('Courtside 1','Headline','Lead','Body')`));
await db.exec('reset role');
```

- [ ] **Step 2: Run** `pnpm db:test` → section 17 fails on the first missing view.
- [ ] **Step 3: Write the migration.**

```sql
-- ═══════════════════════════════════════════════════════════════════════════
-- Momentum Tennis — 0011: notifications & lifecycle (phase 7)
--
-- 0001 holds the mechanism — notification_sends dedupes on trigger_key,
-- marketing_consents is the consent fact, expire_credits and finalize_bookings
-- are idempotent — but nothing tells a job WHO to write to. This migration adds
-- the read models the mail jobs need, the unsubscribe token and its public
-- function, and the table an issue of the newsletter lives in. Append-only.
-- ═══════════════════════════════════════════════════════════════════════════

-- guardians who may receive mail about a player: any active guardian, except a
-- minor's own restricted login (G); money mail additionally requires can_view_financials
create view public.v_player_recipients with (security_invoker = true) as
  select g.player_id, g.account_id, a.email, a.full_name as account_name, g.role,
         (g.role <> 'self' or player_is_adult(g.player_id)) as may_receive,
         (g.role <> 'self' or player_is_adult(g.player_id)) as may_receive_money
    from guardianships g join accounts a on a.id = g.account_id
   where g.ended_at is null;

-- (a) booked classes starting inside a window, one row per guardian
create function public.v_upcoming_reminders_within(p_window interval)
returns table (session_id uuid, player_id uuid, player_name text, account_id uuid, email text,
               title text, starts_at timestamptz, ends_at timestamptz, location_name text, court_name text)
language sql stable security definer set search_path = public as $$
  select s.id, cb.player_id, p.full_name, r.account_id, r.email,
         v.title, s.starts_at, s.ends_at, v.location_name, v.court_name
    from class_bookings cb
    join sessions s on s.id = cb.class_session_id
    join v_schedule_sessions v on v.id = s.id
    join players p on p.id = cb.player_id
    join v_player_recipients r on r.player_id = cb.player_id and r.may_receive
   where cb.status = 'booked' and s.status = 'scheduled'
     and s.starts_at > now() and s.starts_at <= now() + p_window $$;
create view public.v_upcoming_reminders as select * from v_upcoming_reminders_within(interval '24 hours');

-- (b) players at or below the low-credit threshold, with the lot that keys the nudge
create view public.v_low_credit_players with (security_invoker = true) as
  select b.player_id, p.full_name as player_name, b.credit_kind, b.balance, b.next_expiry,
         (select l.lot_id from v_lot_remaining l
           where l.player_id = b.player_id and l.credit_kind = b.credit_kind
           order by l.issued_at desc limit 1) as latest_lot_id,
         r.account_id, r.email
    from v_credit_balances b
    join players p on p.id = b.player_id
    join v_player_recipients r on r.player_id = b.player_id and r.may_receive_money
   cross join academy_settings st
   where b.balance <= st.low_credit_threshold;

-- (c) guardians who must re-sign, per published version
create view public.v_reconsent_needed with (security_invoker = true) as
  select w.player_id, p.full_name as player_name, w.document_id, w.title as document_title,
         w.current_version_id as version_id, w.current_version as version_number, w.published_at,
         r.account_id, r.email
    from v_player_waiver_status w
    join players p on p.id = w.player_id
    join v_player_recipients r on r.player_id = w.player_id and r.may_receive
   where w.required_for_participation and not w.satisfied;

-- (e) unsubscribe by token, no login: legally required to be easy
alter table marketing_consents add column token uuid not null default gen_random_uuid() unique;
create function public.unsubscribe_by_token(p_token uuid) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  update marketing_consents set subscribed = false, source = 'unsubscribe link', updated_at = now()
   where token = p_token;
  return found;
end $$;
create view public.v_marketing_recipients with (security_invoker = true) as
  select c.account_id, a.email, a.full_name, c.token
    from marketing_consents c join accounts a on a.id = c.account_id
   where c.subscribed;

-- (f) an issue of the newsletter — Artur's copy; the send is keyed newsletter:{issue}:{account}
create table newsletter_issues (
  id          uuid primary key default gen_random_uuid(),
  subject     text not null,
  headline    text not null,
  lead        text not null,
  body        text not null,
  this_week   text[] not null default '{}',
  created_by  uuid references accounts(id),
  created_at  timestamptz not null default now(),
  sent_at     timestamptz,
  sent_count  int not null default 0
);
create policy admin_newsletter on newsletter_issues for all to authenticated using (is_admin()) with check (is_admin());
create trigger audit_newsletter_issues after insert or update or delete on newsletter_issues for each row execute function audit_row();

-- grants: the views inherit the default table grants; the function is explicit
revoke execute on function public.v_upcoming_reminders_within(interval) from public, anon;
grant  execute on function public.v_upcoming_reminders_within(interval) to authenticated, service_role;
revoke execute on function public.unsubscribe_by_token(uuid) from public;
grant  execute on function public.unsubscribe_by_token(uuid) to anon, authenticated, service_role;
```

  Check the column names of `v_player_waiver_status` in 0001/0004 before writing (c) — the names above (`document_id`, `title`, `current_version_id`, `current_version`, `published_at`, `required_for_participation`, `satisfied`) must match what the view exposes; adjust the select, never the view. `audit_row` must tolerate this table (it keys `entity_id` on `id`).
- [ ] **Step 4: Run** `pnpm db:test` → `ALL CHECKS PASSED` (section 17, about 14 checks). **Step 5:** `pnpm db:types`, commit — `git commit -m "feat(db): 0011 notifications — reminder, low-credit, re-consent and marketing read models; unsubscribe token; newsletter issues; harness §17"`

### Task 2: Config — `MAILING_ADDRESS`; the mailer selector

**Files:** Modify `src/lib/server/config.ts` (+ test), `scripts/check-env.mjs`, `.env.example`, `wrangler.toml`, `config/dev.yaml`, `config/prod.yaml`; create `src/lib/server/domain/notify/mailer.runtime.ts`; modify `src/routes/(portal)/portal/book/notify.ts`, `src/lib/server/domain/payments/receipt.ts`.

- [ ] **Step 1: Failing tests** — `parseEnv(core).mailingAddress` is `undefined`; with `MAILING_ADDRESS: '123 Court St, Cupertino CA 95014'` it is that string; blank counts as unset.
- [ ] **Step 2–4:** implement (`optionalSecret`-style transform without the secret list); `check-env` lists it under "not configured yet" when blank; `mailerFor(cfg)` returns `resendMailer(key, cfg.emailFrom)` when `RESEND_API_KEY` is set, else `consoleMailer()`; the two existing call sites use it.
- [ ] **Step 5: Commit** — `git commit -m "feat(notify): mailing address for marketing mail; one mailer selector"`

### Task 3: Email ports — the four remaining templates

**Files:** Create `src/lib/ds/email/classReminder.ts`, `lowCredits.ts`, `reconsentRequest.ts`, `newsletter.ts`; modify `email.test.ts`.

- [ ] **Step 1: Failing tests** — each builder returns `{ subject, text, html }`; the text carries every fact the HTML does; no `!`; the CTA is the one amber pill; transactional footers carry the why-you-got-this line and **no** unsubscribe; the newsletter carries the consent line, the mailing address and the unsubscribe URL, and refuses to render without both (`throws`), because the README says the address is legally required.
  - `classReminder({ playerName, title, date, weekday, hours, location, bring, dayUrl })` → subject `Class tomorrow — <title> · <hours>`.
  - `lowCredits({ playerName, balance, kindLabel, expiresOn, storeUrl })` → subject `<Balance> credits left — <player>`.
  - `reconsentRequest({ playerName, documentTitle, versionNumber, publishedOn, signingAs, signUrl })` → subject `One signature needed — <document> V<n>`.
  - `newsletter({ issueNo, month, headline, lead, body, thisWeek, siteUrl, unsubscribeUrl, mailingAddress, consentLine })` → subject `Courtside · No. <n> · <month>`; `consentLine` is the **FROM LEGAL** text the admin form carries — the builder does not invent it.
- [ ] **Step 2–4:** RED → port each from `design-system/templates/email/*.html` the way `bookingConfirmation` and `paymentReceipt` were → GREEN.
- [ ] **Step 5: Commit** — `git commit -m "feat(email): class reminder, low credits, re-consent and newsletter ports"`

### Task 4: The job registry and the three mail jobs

**Files:** Modify `src/lib/server/domain/cron.ts`, `cron.test.ts`; create `src/lib/server/domain/notify/jobs/remindClasses.ts`, `nudgeLowCredits.ts`, `reconsentCampaign.ts` (+ tests); modify `src/routes/internal/cron/+server.ts`, `workers/cron/wrangler.toml`.

- [ ] **Step 1: Failing tests — cron.ts**
  - `jobsFor('*/15 * * * *')` → `['finalize_bookings']`; `jobsFor('0 * * * *')` → `['remind_classes']`; `jobsFor('0 9 * * *')` → `['expire_credits', 'nudge_low_credits', 'reconsent_campaign']`.
  - `runJobs(deps, jobs)` runs SQL jobs via `deps.db.rpc(name)` and TypeScript jobs via the registry (`{ name, run(deps) }`), reporting `{ job, ok, result | error }` per job; one failure does not stop the others (existing behaviour, re-asserted).
- [ ] **Step 2: Failing tests — jobs** (`deps = { db: fakeDb, store: memory SendStore, mailer: recording Mailer, cfg, now }`):
  - `remindClasses`: reads `v_upcoming_reminders`; one `sendTransactional` per row with key `class_reminder:{session}:{account}:{player}`, template `class-reminder`, `to: row.email`; returns `{ sent, duplicate }`; a second run over the same rows sends nothing.
  - `nudgeLowCredits`: reads `v_low_credit_players`; key `low_credits:{player}:{kind}:{lot}`; `CREDIT_LABELS` for the kind; the store URL is `cfg.siteUrl + '/store'`.
  - `reconsentCampaign`: reads `v_reconsent_needed`; key `reconsent:{version}:{account}:{player}`; `signingAs` is `Parent/guardian` unless the recipient's role is `self`; the sign URL is `/portal/waivers/{version}`.
  - Each job continues past one failed send (a mailer throw settles that key `failed` and is counted), never throws as a whole.
- [ ] **Step 3: Implement.** The cron route builds `deps` with the admin client, `supabaseSendStore(admin)`, `mailerFor(cfg)`, `cfg`, `now: new Date()`. `workers/cron/wrangler.toml` `crons` gains `"0 * * * *"`.
- [ ] **Step 4: Run** → PASS. **Step 5: Commit** — `git commit -m "feat(cron): job registry; reminder, low-credit and re-consent jobs"`

### Task 5: Consent, preferences, unsubscribe

**Files:** Create `src/lib/server/domain/notify/consent.ts` (+ test); `src/routes/(portal)/portal/preferences/+page.server.ts`, `+page.svelte`; `src/routes/unsubscribe/[token]/+page.server.ts`, `+page.svelte`; modify the portal layout, `e2e/smoke.test.ts`.

- [ ] **Step 1: Failing tests** — `setConsent(db, { accountId, subscribed, source })` upserts `marketing_consents` on `account_id`; `getConsent(db, accountId)` → `{ subscribed, token }` or `{ subscribed: false }`; `unsubscribeByToken(db, token)` calls `rpc('unsubscribe_by_token')` and returns the boolean. Smoke: `/portal/preferences` is guarded; `/unsubscribe/00000000-0000-4000-8000-000000000000` renders publicly with one button, and pressing it shows `NO SUBSCRIPTION FOUND FOR THIS LINK`.
- [ ] **Step 2: Implement.** Preferences: a `Checkbox` "Send me Courtside, the academy newsletter" with the consent copy marked `FROM LEGAL —` above it; action `save`; message `SAVED`. Unsubscribe: GET renders the page; POST calls the RPC through the **anon** client (no session needed) and shows `UNSUBSCRIBED — you will not receive the newsletter again` or the not-found line. Portal tabs gain `Preferences`.
- [ ] **Step 3: Run** → green. **Step 4: Commit** — `git commit -m "feat(notify): marketing consent, preference centre and one-click unsubscribe"`

### Task 6: Admin newsletter

**Files:** Modify `notify/consent.ts` (issues) or create `notify/newsletter.ts` (+ test); create `src/routes/admin/newsletter/+page.server.ts`, `+page.svelte`, `newsletter/[id]/+page.server.ts`, `+page.svelte`; modify the admin layout, `e2e/smoke.test.ts`.

- [ ] **Step 1: Failing tests** — `issueSchema` (subject ≤ 120, headline ≤ 120, lead ≤ 600, body ≤ 2000, `thisWeek` up to 6 lines ≤ 100 each); `saveIssue`, `listIssues`, `getIssue`; `sendIssue(deps, issueId)`: reads the issue and `v_marketing_recipients`, calls `sendMarketing` per recipient with `consent: { subscribed: true }` (the view already filtered) and key `newsletter:{issue}:{account}`, the unsubscribe URL `cfg.siteUrl + '/unsubscribe/' + token`, refuses with `not_configured` when `cfg.mailingAddress` is unset, updates `sent_at`/`sent_count`, and a second send sends nothing new. Smoke: `/admin/newsletter` refused anonymously.
- [ ] **Step 2: Implement.** List of issues (subject, created, sent, count) + `New issue`; `[id]`: the form with the **FROM LEGAL** consent line as a read-only field (from a constant in `consent.ts`, marked placeholder) and a `Send` action behind a `Dialog` whose consequence line is `SENDS TO n SUBSCRIBED ACCOUNTS · CANNOT BE UNSENT`. The send runs in the action with the admin client; note in the page that a large list takes a while (Workers CPU limits; batch later if needed).
- [ ] **Step 3: Run** → green. **Step 4: Commit** — `git commit -m "feat(admin): newsletter issues and send"`

### Task 7: Deploy the cron worker; e2e; the finish

**Files:** Modify `docs/OPERATIONS.md` (§5 cron, §7 phase-7 row), `docs/PLAN.md`, `AGENTS.md`; create the checklist; create `e2e/notifications.test.ts`.

- [ ] **Step 1:** Credentialed spec: log in → `/portal/preferences` opt in → `/admin/newsletter` new issue → send → the console mailer on dev prints (assert the page's `SENT · n`) → `/unsubscribe/<token>` (the token read from the preferences page) → `UNSUBSCRIBED`.
- [ ] **Step 2: Operator (documented, not run):** `pnpm cf secret put CRON_SHARED_SECRET --env dev` on the app **and** `--config workers/cron/wrangler.toml` on the worker; `pnpm cf deploy --env dev --config workers/cron/wrangler.toml`; `RESEND_API_KEY` after domain verification; `MAILING_ADDRESS` in `wrangler.toml` vars once Artur supplies it; the legal copy for consent/unsubscribe.
- [ ] **Step 3: Gates** — `pnpm env:check` · `pnpm check` · `pnpm lint` · `pnpm test` · `pnpm db:test` · `pnpm db:types` no diff · `pnpm build:dev`.
- [ ] **Step 4: Records and finish** — PLAN.md row and decisions (questions 1–8), AGENTS.md, OPERATIONS §5/§7, the checklist; merge, fast-forward `deploy/dev`, push, confirm 0011 on dev, report, **stop**.

---

## Self-review

**Spec coverage.** Brief task 1 (0011 read models, harness §17) → Task 1, with two more read models the jobs need (`v_reconsent_needed`, `v_marketing_recipients`) and the token/RPC the unsubscribe page needs. Task 2 (jobs in `cron.ts`) → Task 4. Task 3 (Resend adapter, templates) → Tasks 2–3 (the adapter exists; the selector is new). Task 4 (preferences, unsubscribe) → Task 5, plus the admin newsletter the PLAN row requires → Task 6. Task 5 (deploy the cron worker) → Task 7. PLAN exit "overlapping cron runs cannot double-send" is §17 (d) plus every job test's second-run assertion; "marketing and transactional fully separated" is `send.ts`'s types plus `v_marketing_recipients` being the only source of newsletter addresses.

**Placeholders.** The legal copy is a marked placeholder by rule, not by omission; `v_player_waiver_status` column names are flagged for verification against 0001/0004 rather than guessed silently.

**Type consistency.** Keys: `class_reminder:{session}:{account}:{player}`, `low_credits:{player}:{kind}:{lot}`, `reconsent:{version}:{account}:{player}`, `newsletter:{issue}:{account}` — used identically in Tasks 1, 4 and 6. `mailerFor(cfg)` (Task 2) is what Tasks 4 and 6 inject. `deps` for jobs is `{ db, store, mailer, cfg, now }` throughout.
