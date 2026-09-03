# Phase 1 — Identity & Profiles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking. Read `AGENTS.md` first — its prime directives override taste.

**Goal:** A guardian signs up, adds the players in their family (name, birthdate, ball level), switches between them in the portal, and corrects a mistake — while an admin grants staff roles. The adult player is the same shape as a child, not a special case.

**Architecture:** One additive migration (`0002_identity.sql`) adds the two writes the schema is missing — `update_player` and `archive_player` — as SECURITY DEFINER RPCs, because `players` and `guardianships` deliberately have no write policies. One domain module (`identity/players.ts`) wraps every RPC and returns `Result`; `identity/age.ts` mirrors `player_is_adult()` in TypeScript for display only. Routes stay thin and follow the account-form exemplar. The portal layout gains a player context (`?player=<uuid>`) that phases 2–6 will read.

**Tech Stack:** No new dependencies. SvelteKit routes + superforms/zod4, the ported design system (`$lib/ds`), PGlite for schema tests, vitest for units.

---

## Decisions this phase must respect

- **M** — a guardian sets the ball level at creation; only staff change it afterwards (`set_player_level`). The player form therefore offers a level on create and shows it read-only on edit.
- **G** — guardianship links persist after 18; `can_view_financials()` flips on its own. Nothing in this phase ends a link because of age.
- The DB refuses a minor as their own guardian (`minor_self_link`). Phase 1 keeps that invariant true under edits, too.

## Open questions (recommended default first — see the report accompanying this plan)

- **Q1 — how a restricted minor login is created.** Not built in this phase. Recommendation: a guardian-initiated invite (guardian enters the child's email → Supabase invite → on first sign-in an RPC links that account to the named player with `role='self'`, which is the one path allowed to create a minor `self` link, and only for a player the inviting guardian already guards). Alternatives: no child login at all (families share the guardian login), or staff-created logins. Blocked on the answer because it creates an account for a minor.
- **Q2 — what a guardian may edit after the player turns 18.** Recommendation: unchanged — the link persists per decision G, so the guardian keeps edit rights until the link is ended. Alternative: freeze guardian edits at 18 and require the player's own account.
- **Q3 — birthdate correction.** Recommendation: guardians may correct it (audited on `players`), because otherwise a typo has no fix without support. Refused when it would turn a `self`-guardianship holder into a minor.

## File map

| Path | Responsibility | New? |
|---|---|---|
| `supabase/migrations/0002_identity.sql` | `update_player`, `archive_player` RPCs + grants | new |
| `supabase/tests/validate.mjs` | section 2b: edit/archive checks | extend |
| `src/lib/server/domain/result.ts` | add refusal codes raised by identity RPCs | extend |
| `src/lib/server/domain/identity/age.ts` | `isAdultOn()` mirroring `player_is_adult()` | new |
| `src/lib/server/domain/identity/players.ts` | list/create/update/archive/setLevel + zod schemas | new |
| `src/lib/server/domain/identity/staff.ts` | add `listStaff`, `grantRole`, `revokeRole` | extend |
| `src/lib/components/PlayerSwitcher.svelte` | portal-flows.jsx port (app composite) | new |
| `src/routes/(portal)/portal/+layout.server.ts` | load players + resolve `?player=` | extend |
| `src/routes/(portal)/portal/+layout.svelte` | Players tab + switcher in the header | extend |
| `src/routes/(portal)/portal/+page.svelte` | onboarding when empty; player summary when not | rewrite |
| `src/routes/(portal)/portal/players/+page.svelte` | roster list | new |
| `src/routes/(portal)/portal/players/new/+page.{server.ts,svelte}` | add a player | new |
| `src/routes/(portal)/portal/players/[id]/+page.{server.ts,svelte}` | edit + archive | new |
| `src/routes/admin/staff/+page.{server.ts,svelte}` | grant/revoke staff roles | new |
| `e2e/smoke.test.ts` | guarded-route coverage for the new paths | extend |

## Tasks

### Task 1: Migration 0002 — the two missing writes

**Files:** Create `supabase/migrations/0002_identity.sql`; Modify `supabase/tests/validate.mjs`

- [x] **Step 1: Write the failing schema checks** — append a new section to `supabase/tests/validate.mjs` immediately after the `2. actors` section (before `console.log('3. facilities…')`):

```js
console.log('2b. player edits + archive (phase 1)');
await asUser(PARENT);
await expectOk('guardian corrects a name typo', () =>
	q(`select update_player($1, 'Maya Ramesh', '2015-03-01')`, [maya])
);
const renamed = (await q(`select full_name from players where id = $1`, [maya])).rows[0].full_name;
if (renamed === 'Maya Ramesh') ok('name updated');
else {
	console.log('  ✗ rename', renamed);
	failures++;
}
await expectErr(
	'blank name refused',
	() => q(`select update_player($1, '   ', '2015-03-01')`, [maya]),
	'validation'
);
await asUser(PARENT2);
await expectErr(
	"cannot edit another family's player",
	() => q(`select update_player($1, 'Hijack', '2015-03-01')`, [maya]),
	'not_authorized'
);
await asUser(PARENT);
// an adult self-player may not be edited into a minor — the DB keeps minor_self_link true
const adult = (await q(`select create_player('Ann A.', '1990-04-04', 'self') as id`)).rows[0].id;
await expectErr(
	'self-guardian cannot be edited into a minor',
	() => q(`select update_player($1, 'Ann A.', '2015-04-04')`, [adult]),
	'minor_self_link'
);
await expectOk('archiving a player ends the guardianship', () =>
	q(`select archive_player($1)`, [adult])
);
const gone = (
	await q(`select count(*)::int as n from guardianships where player_id = $1 and ended_at is null`, [
		adult
	])
).rows[0].n;
if (gone === 0) ok('guardianship ended, player row and history preserved');
else {
	console.log('  ✗ archive', gone);
	failures++;
}
await expectErr(
	'archiving twice refused',
	() => q(`select archive_player($1)`, [adult]),
	'not_authorized'
);
```

- [x] **Step 2: Run the harness to verify it fails**

Run: `pnpm db:test`
Expected: FAIL with `function update_player(...) does not exist`

- [x] **Step 3: Write the migration**

```sql
-- ═══════════════════════════════════════════════════════════════════════════
-- 0002 — identity writes (phase 1)
-- players and guardianships carry no write policies by design; these two
-- SECURITY DEFINER RPCs are the only guardian-facing mutations.
-- ═══════════════════════════════════════════════════════════════════════════

-- Q3: a guardian corrects the facts they supplied. Ball level stays staff-only (decision M).
create function public.update_player(p_player uuid, p_full_name text, p_birthdate date)
returns void language plpgsql security definer set search_path = public as $$
declare v_account uuid := auth.uid();
begin
  if v_account is null then raise exception 'not_authenticated'; end if;
  if not (is_staff() or guards(p_player)) then raise exception 'not_authorized'; end if;
  if btrim(coalesce(p_full_name, '')) = '' then
    raise exception 'validation: name required' using errcode = 'check_violation';
  end if;
  if p_birthdate is null or p_birthdate > academy_local(now())::date then
    raise exception 'validation: birthdate must be in the past' using errcode = 'check_violation';
  end if;
  -- keep minor_self_link true under edits: an account may not end up self-guarding a minor
  if p_birthdate > (academy_local(now())::date - interval '18 years')::date
     and exists (select 1 from guardianships g
                 where g.player_id = p_player and g.role = 'self' and g.ended_at is null) then
    raise exception 'minor_self_link' using errcode = 'check_violation';
  end if;
  update players set full_name = btrim(p_full_name), birthdate = p_birthdate where id = p_player;
end $$;

-- Undo for a mis-added player. The player row, its signatures and any history survive —
-- only this account's link ends. Refused once money or bookings exist: that is a staff matter.
create function public.archive_player(p_player uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_account uuid := auth.uid();
begin
  if v_account is null then raise exception 'not_authenticated'; end if;
  if not exists (select 1 from guardianships g
                 where g.player_id = p_player and g.account_id = v_account and g.ended_at is null) then
    raise exception 'not_authorized';
  end if;
  if exists (select 1 from credit_ledger where player_id = p_player)
     or exists (select 1 from class_bookings where player_id = p_player)
     or exists (select 1 from lesson_bookings where player_id = p_player)
     or exists (select 1 from camp_registrations where player_id = p_player) then
    raise exception 'player_has_history' using errcode = 'check_violation';
  end if;
  update guardianships set ended_at = now()
   where player_id = p_player and account_id = v_account and ended_at is null;
end $$;

grant execute on function public.update_player(uuid, text, date) to authenticated;
grant execute on function public.archive_player(uuid)            to authenticated;
```

- [x] **Step 4: Run the harness to verify it passes**

Run: `pnpm db:test`
Expected: `ALL CHECKS PASSED` with the new 2b checks listed

- [x] **Step 5: Regenerate types and commit**

```bash
pnpm db:types
git add supabase/migrations/0002_identity.sql supabase/tests/validate.mjs src/lib/server/db/database.types.ts
git commit -m "feat(db): update_player and archive_player RPCs with schema checks"
```

### Task 2: Refusal codes

**Files:** Modify `src/lib/server/domain/result.ts`; Test `src/lib/server/domain/result.test.ts`

- [x] **Step 1: Write the failing test** — append to `result.test.ts`:

```ts
describe('identity refusals map to codes, not to unexpected', () => {
	it('maps the tokens the identity RPCs raise', () => {
		expect(fromPostgres({ message: 'staff_only' }).code).toBe('staff_only');
		expect(fromPostgres({ message: 'minor_self_link' }).code).toBe('minor_self_link');
		expect(fromPostgres({ message: 'unknown_skill_level: purple' }).code).toBe('unknown_skill_level');
		expect(fromPostgres({ message: 'player_has_history' }).code).toBe('player_has_history');
		expect(fromPostgres({ message: 'validation: name required' }).code).toBe('validation');
	});
});
```

- [x] **Step 2: Run to verify it fails** — `pnpm exec vitest run src/lib/server/domain/result.test.ts`; expected FAIL: received `'unexpected'`.

- [x] **Step 3: Add the codes** — add `'staff_only'`, `'admin_only'`, `'minor_self_link'`, `'unknown_skill_level'`, `'player_has_history'` to `CODES`, and to `COPY`:

```ts
	staff_only: 'Only academy staff can do that.',
	admin_only: 'Only an administrator can do that.',
	minor_self_link: 'A player under 18 cannot be their own guardian.',
	unknown_skill_level: 'That ball level is not one the academy offers.',
	player_has_history: 'This player has bookings or credits. The academy has to remove them.',
```

- [x] **Step 4: Run to verify it passes** (the existing "sentence for every known code" loop covers the new copy).
- [x] **Step 5: Commit** — `git commit -m "feat(server): map identity refusals to typed codes"`

### Task 3: Age helper

**Files:** Create `src/lib/server/domain/identity/age.ts`, `age.test.ts`

- [x] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { isAdultOn } from './age';

const LA = 'America/Los_Angeles';

describe('isAdultOn — mirrors player_is_adult() in SQL', () => {
	it('is true on the 18th birthday, false the day before', () => {
		expect(isAdultOn('2008-09-02', LA, '2026-09-02T18:00:00Z')).toBe(true);
		expect(isAdultOn('2008-09-03', LA, '2026-09-02T18:00:00Z')).toBe(false);
	});
	it('uses the academy-local date, not UTC', () => {
		// 2026-09-03T05:00Z is still 2026-09-02 in Los Angeles
		expect(isAdultOn('2008-09-03', LA, '2026-09-03T05:00:00Z')).toBe(false);
	});
	it('handles a leap-day birthdate', () => {
		expect(isAdultOn('2008-02-29', LA, '2026-02-28T18:00:00Z')).toBe(false);
		expect(isAdultOn('2008-02-29', LA, '2026-03-01T18:00:00Z')).toBe(true);
	});
});
```

- [x] **Step 2: Run to verify it fails** — module not found.
- [x] **Step 3: Implement** using `academyDate()` from `../time` so the local-date rule is shared:

```ts
import { academyDate } from '../time';

/** Adult iff birthdate <= (academy-local today − 18 years) — the SQL rule, verbatim. */
export function isAdultOn(birthdate: string, tz: string, at: string | Date = new Date()): boolean {
	const [y, m, d] = academyDate(at, tz).split('-').map(Number);
	const cutoff = `${String(y - 18).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
	return birthdate <= cutoff;
}
```

- [x] **Step 4: Run to verify it passes.**
- [x] **Step 5: Commit** with Task 4.

### Task 4: Players domain module

**Files:** Create `src/lib/server/domain/identity/players.ts`, `players.test.ts`

- [x] **Step 1: Write the failing tests** — cover: `createPlayer` passes the four RPC arguments and returns the id; a blank level key is sent as `null` (not `''`, which the RPC would reject as unknown); `updatePlayer` and `archivePlayer` pass their arguments; `setPlayerLevel` maps `staff_only`; `listPlayers` selects only the caller's active players and returns level key/label; every refusal maps through `fromPostgres`. Use the narrow-fake pattern from `account.test.ts`.
- [x] **Step 2: Run to verify they fail** — module not found.
- [x] **Step 3: Implement** — zod schemas (`newPlayerSchema`, `editPlayerSchema`) colocated; functions take `PlayersDb = Pick<SupabaseClient<Database>, 'from' | 'rpc'>`; all return `Result`.
- [x] **Step 4: Run to verify they pass.**
- [x] **Step 5: Commit** — `git commit -m "feat(identity): players domain module and age helper"`

### Task 5: PlayerSwitcher composite

**Files:** Create `src/lib/components/PlayerSwitcher.svelte`, `src/lib/components/components.test.ts`

- [x] **Step 1: Write the failing SSR contract test** — a `role="group"` labelled Player; one button per player; the current one carries `aria-pressed="true"`; names render; hrefs preserve the current path with `?player=<id>` when rendered as links.
- [x] **Step 2: Run to verify it fails.**
- [x] **Step 3: Implement** — port `PlayerSwitcher` from `design-system/ui_kits/portal/portal-flows.jsx` verbatim (44px targets, mono 0.6875rem caps, court-050 fill + ink border when current, hairline otherwise), as links so switching works without JS.
- [x] **Step 4: Run to verify it passes.**
- [x] **Step 5: Commit** — `git commit -m "feat(ui): player switcher composite"`

### Task 6: Portal — onboarding, roster, add, edit

**Files:** Modify `(portal)/portal/+layout.server.ts`, `+layout.svelte`, `+page.svelte`; create `players/+page.svelte`, `players/new/+page.{server.ts,svelte}`, `players/[id]/+page.{server.ts,svelte}`

- [x] **Step 1: Layout load** — fetch the caller's active players (id, name, birthdate, level key/label) ordered by name; resolve `?player=` against that list, falling back to the first; expose `players`, `currentPlayer`, `tz`.
- [x] **Step 2: Layout shell** — add the Players tab; render `PlayerSwitcher` under the title when `players.length > 1`.
- [x] **Step 3: Overview** — zero players: an `EmptyState` with one primary action, "Add your first player". One or more: a summary per current player — name, mono `BALL LEVEL · <LABEL>` (or `LEVEL NOT SET`), mono `AGE <n> · <MINOR|ADULT>` — and honest mono notes that credits and bookings arrive in later phases.
- [x] **Step 4: Roster** — `players/+page.svelte` lists every player with level and an edit link, plus "Add a player".
- [x] **Step 5: Add** — `players/new` with the superforms exemplar: name, birthdate (`DateField`), relationship (`SegmentedControl`: myself / my child / I am their guardian), ball level (`Select`, optional, help text "The academy sets the level after that"). Calls `createPlayer`, redirects to the roster with the new player selected.
- [x] **Step 6: Edit** — `players/[id]` edits name and birthdate; shows the level read-only with mono `SET BY THE ACADEMY`; archive as a `Dialog` confirm whose consequence line is mono and whose confirm is a secondary button (never amber).
- [x] **Step 7: Verify** — `pnpm check && pnpm lint && pnpm test` green.
- [x] **Step 8: Commit** — `git commit -m "feat(portal): guardian onboarding, player roster, add and edit"`

### Task 7: Admin staff roles

**Files:** Create `src/routes/admin/staff/+page.server.ts`, `+page.svelte`; modify `identity/staff.ts`, `staff.test.ts`, `admin/+layout.svelte`

- [x] **Step 1: Write the failing tests** for `listStaff`, `grantRole`, `revokeRole` (narrow fakes; `grantRole` upserts `(account_id, role)`; a failure maps through `fromPostgres`).
- [x] **Step 2: Run to verify they fail.**
- [x] **Step 3: Implement** the three functions; the page lists staff with `StatusChip`, grants a role by email (resolved against `accounts`, which staff may read), and revokes with a `Dialog` confirm.
- [x] **Step 4: Run to verify they pass;** add the Staff tab to the admin layout.
- [x] **Step 5: Commit** — `git commit -m "feat(admin): staff role management"`

### Task 8: E2E, docs, final gate

- [x] **Step 1:** extend `e2e/smoke.test.ts` — `/portal/players` and `/admin/staff` redirect anonymous users to login with `next`.
- [x] **Step 2:** update `docs/PLAN.md` (phase 1 row → built, decision log entry) and `AGENTS.md` (status, repo map).
- [x] **Step 3:** run the full gate: `pnpm check && pnpm lint && pnpm test && pnpm build`.
- [x] **Step 4:** commit — `git commit -m "chore: e2e coverage and docs for phase 1"`

## Exit criteria

- `pnpm check` (0 errors, 0 warnings), `pnpm lint`, `pnpm test`, `pnpm build` all green.
- The schema harness passes with the new 2b checks.
- A guardian can sign up, add two children with ball levels, switch between them, correct a name, and archive a mistake; an adult can add themselves as `self`; an admin can grant and revoke staff roles.
- Verified end-to-end on the dev deployment once the operator steps from phase 0 are done (`pnpm test:e2e`) — the one criterion this session cannot close.

## Status (end of session 2026-09-02)

Built and committed on `phase-1/identity`. `pnpm check` (0 errors, 0 warnings), `pnpm lint`,
`pnpm test` (93 unit/contract + 83 schema checks) and `pnpm build` all green.

Deliberately not built:
- The restricted minor login (question O) — it creates an account for a minor, so it waits
  for an answer. Everything else in the phase-1 row shipped.

Known limitations, by choice:
- Removing a player needs JavaScript: the confirm is a `Dialog`, and without JS it never
  opens. It fails closed (the destructive action simply is not offered), and every other
  form on the page works without JS.
- `pnpm test:e2e` still cannot run — it needs a reachable Supabase, which is a phase-0
  operator step. The new specs are written and will run as soon as dev exists.

Two defects found while building, both fixed here:
- `supabase/tests/validate.mjs` applied only `0001_schema.sql`, so it would have silently
  ignored 0002 and every later migration. It now applies the whole directory in order.
- `scripts/check-adherence.mjs` reported a legal `font-family: var(--font-sans)`: the
  optional whitespace in its rule could match zero characters, letting the negative
  lookahead see the space instead of the value.
