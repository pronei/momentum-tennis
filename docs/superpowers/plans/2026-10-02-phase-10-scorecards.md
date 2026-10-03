# Phase 10 — JTT scorecards — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A coach or admin records a USTA Junior Team Tennis match on the site, on a phone, in the 2-court or 3-court shape, finalizes it, and exports it as the observed-card JSON the TennisLink automation ingests.

**Architecture:** Migration 0010 adds `scorecards` and `scorecard_lines`: the eight lines are seeded by a trigger, the finalize gate is a trigger, and RLS admits staff only. A `scorecards/` domain module (pure format rules, the form contract, data access, the export) sits behind `/coach/scorecards` (list, `new`, `[id]`), an export endpoint and the `/scorecard` redirect. Two app composites on `FieldShell` carry the fields the design system lacks; a handoff document asks Claude Design for the real components.

**Tech Stack:** No new dependencies. SvelteKit 2 / Svelte 5 runes, zod 4, superforms (the `new` page only), Supabase RLS client, PGlite harness, vitest, Playwright.

**Branch:** `phase-10/scorecards` from `main` (exists; holds the spec). **Migration:** `0010_scorecards.sql`. **Harness:** section 16. **Spec:** `docs/superpowers/specs/2026-10-02-scorecards-design.md` — every decision is there; this plan only builds it.

---

## Conventions

- Commands run from the repository root. One commit per task, ending with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- RED before GREEN: run the test, read the failure, then implement.
- Domain functions take the Supabase client; tests use `fakeDb` and `called` from `src/lib/server/domain/schedule/fakes.ts` (`called` compares arguments by `JSON.stringify`, so pass the exact object or find the call and use `toMatchObject`).
- Data strings are mono and uppercase; no raw px or hex (`pnpm lint` runs `scripts/check-adherence.mjs`); `/* ds-allow <reason> */` only for the 44px target.
- Fictional names everywhere — tests, fixtures, the dev seed, the handoff. No real player's name.

## File structure

**Docs (renumbering, Task 0)** — modify `docs/superpowers/plans/2026-10-01-phase-9-google-sign-in.md`, `2026-09-08-phase-6-ratings.md`, `2026-09-08-phase-7-notifications.md`, `docs/HANDOFF-opus5.md`, `docs/PLAN.md`.

**Migration & harness** — create `supabase/migrations/0010_scorecards.sql`; modify `supabase/tests/validate.mjs` (section 16); regenerate `src/lib/server/db/database.types.ts`.

**Domain** — `src/lib/server/domain/result.ts` (+ test) gains three codes. Create `src/lib/server/domain/scorecards/`:
- `format.ts` — positions, the two round tables, labels, result and winner suggestions, `resolveLine`, `fromScore`, `totals`, `completeness`. Pure.
- `form.ts` — zod schemas, the field names, `parseHeader`, `parseLines`, `fieldValues`, `submittedFields`. Pure.
- `cards.ts` — `listScorecards`, `getScorecard`, `createScorecard`, `saveCard`, `finalize`, `reopen`, `deleteDraft`, `teamMatches`, `linkRoster`.
- `export.ts` — `observedCard`, `dateText`, `timeText`, `exportFilename`. Pure.
- One `.test.ts` beside each.

**Design system** — modify `src/lib/ds/index.ts` (export `FieldShell`), `src/lib/ds/forms/FieldShell.svelte` (its comment), `src/lib/ds/core/Button.svelte` (`formaction` prop). Create `src/lib/components/NameField.svelte`, `ScoreField.svelte`; modify `src/lib/components/components.test.ts`, `src/routes/styleguide/+page.svelte`, `e2e/smoke.test.ts`.

**Routes** — create `src/routes/scorecard/+server.ts`; `src/routes/coach/scorecards/+page.server.ts`, `+page.svelte`; `new/+page.server.ts`, `+page.svelte`; `[id]/+page.server.ts`, `+page.svelte`; `[id]/export/+server.ts`; `src/routes/coach/scorecards/pages.test.ts`. Modify `src/routes/coach/+layout.svelte`, `src/routes/admin/+layout.svelte`.

**Operator** — the seed script in the scratchpad (not committed); modify `.env.example`.

**Tests & docs** — create `e2e/coach-scorecard.test.ts`, `docs/design-handoffs/2026-10-02-scorecard-components.md`; modify `docs/PLAN.md`, `AGENTS.md`, `docs/HANDOFF-opus5.md`, `docs/OPERATIONS.md`; create the checklist.

---

### Task 0: Renumber phases 9, 6 and 7 behind this one

**Files:** Modify the three plans, `docs/HANDOFF-opus5.md`, `docs/PLAN.md`.

- [ ] **Step 1: Apply the renumbering.** Every `0010` in the phase-9 plan is its own migration; every `0011` in the phase-7 plan is its own. Run:

```bash
P9=docs/superpowers/plans/2026-10-01-phase-9-google-sign-in.md
P6=docs/superpowers/plans/2026-09-08-phase-6-ratings.md
P7=docs/superpowers/plans/2026-09-08-phase-7-notifications.md
sed -i '' -e 's/harness sections 17 and 18 (renumbered 2026-10-01)/harness sections 18 and 19 (renumbered 2026-10-02, after phase 10 — scorecards — took 0010 and section 16)/' -e 's/0010/0011/g' -e 's/section 16/section 17/g' -e 's/§16/§17/g' -e "s/'16\. a new account/'17. a new account/" "$P9"
sed -i '' -e "s/Migration 0011 only if an RPC is preferred over a direct insert\*\* (phase 9 took 0010; phase 7's would then become 0012)/Migration 0012 only if an RPC is preferred over a direct insert** (phases 10 and 9 took 0010 and 0011; phase 7's would then become 0013)/" -e 's/section 17/section 18/g' -e 's/§17/§18/g' -e "s/'17\. ratings/'18. ratings/" "$P6"
sed -i '' -e 's/0011/0012/g' -e 's/section 18/section 19/g' -e 's/§18/§19/g' -e "s/'18\. notifications/'19. notifications/" "$P7"
sed -i '' -e 's/0010 is next after 0009/0011 is next after 0010/' -e 's/0010 is next\./0011 is next./' -e 's/0010 gives a new account the name its sign-up already knows (harness §16)/0011 gives a new account the name its sign-up already knows (harness §17)/' -e 's/no migration; harness §17 pins/no migration; harness §18 pins/' -e 's/0011 read models, the/0012 read models, the/' docs/HANDOFF-opus5.md
sed -i '' -e 's/migration 0010 — a new account takes the name its sign-up knows/migration 0011 — a new account takes the name its sign-up knows/' docs/PLAN.md
```

- [ ] **Step 2: Check.** `grep -n "0010\|§16\|section 16" "$P9" "$P6" "$P7"` → no output. `grep -n "0010\|0011\|0012\|§1[6-9]" docs/HANDOFF-opus5.md` → 0011 for phase 9 (§17), §18 for phase 6, 0012 for phase 7. `grep -n "^| 9 " docs/PLAN.md` → says `migration 0011`. The 2026-10-01 decision-log entry keeps its "17 and 18" — it is history; Task 14 adds today's entry.
- [ ] **Step 3: Commit** — `git commit -am "docs: phases 9, 6 and 7 renumbered behind phase 10 (scorecards)"`

### Task 1: Migration 0010 and harness §16

**Files:** Modify `supabase/tests/validate.mjs`; create `supabase/migrations/0010_scorecards.sql`; regenerate `src/lib/server/db/database.types.ts`.

- [ ] **Step 1: The failing section.** Append before the final two lines of `validate.mjs` (`console.log(failures ? …` and `process.exit`). `ADMIN`, `COACH`, `PARENT` and the players `maya`, `zoe`, `leo`, `kai` are the harness's fixtures from its head.

```js
console.log('16. scorecards — eight lines by construction, the finalize gate, staff-only (0010)');
// A fictional team with four of the harness's players; the admin builds the roster (phase 3).
await db.exec('set role authenticated');
await asUser(ADMIN);
const p10team = (
	await q(`insert into teams (name, season) values ('Harness 12U', 'Fall 2026') returning id`)
).rows[0].id;
await q(`insert into team_members (team_id, player_id) values ($1,$2),($1,$3),($1,$4),($1,$5)`, [
	p10team,
	maya,
	zoe,
	leo,
	kai
]);

// (a) a coach creates a card and the trigger seeds exactly the eight lines
await asUser(COACH);
const p10card = (
	await q(
		`insert into scorecards (team_id, played_on, home_team, away_team, momentum_side, format, set_games, created_by)
		 values ($1, '2026-10-04', 'Harness 12U', 'Visitors 12U', 'home', 'three_court', 6, $2) returning id`,
		[p10team, COACH]
	)
).rows[0].id;
const p10lines = (
	await q(`select position from scorecard_lines where scorecard_id = $1 order by position`, [p10card])
).rows.map((r) => r.position);
if (p10lines.join(' ') === '1D 1S 2D 2S 3D 3S 4D 4S') ok('a new card has exactly the eight JTT lines');
else {
	console.log('  ✗ seeded lines', p10lines);
	failures++;
}
await expectErr(
	'a coach cannot sign a card as someone else',
	() =>
		q(
			`insert into scorecards (team_id, played_on, home_team, away_team, momentum_side, format, set_games, created_by)
			 values ($1, '2026-10-04', 'a', 'b', 'home', 'two_court', 4, $2)`,
			[p10team, ADMIN]
		),
	'row-level security'
);
await expectErr(
	'a ninth line cannot be added',
	() => q(`insert into scorecard_lines (scorecard_id, position) values ($1, '1S')`, [p10card]),
	'row-level security'
);
await q(`delete from scorecard_lines where scorecard_id = $1`, [p10card]);
const p10still = (
	await q(`select count(*)::int as n from scorecard_lines where scorecard_id = $1`, [p10card])
).rows[0].n;
if (p10still === 8) ok('lines cannot be deleted — there is no policy for it');
else {
	console.log('  ✗ lines after delete', p10still);
	failures++;
}

// (b) a family sees nothing
await asUser(PARENT);
const p10family = (await q(`select count(*)::int as n from scorecards`)).rows[0].n;
if (p10family === 0) ok('a family sees no scorecards');
else {
	console.log('  ✗ family read', p10family);
	failures++;
}

// (c) the column checks: a singles line has one player a side; a played result needs a winner
await asUser(COACH);
await expectErr(
	'a singles line refuses a second player',
	() =>
		q(`update scorecard_lines set home_player2_name = 'Extra' where scorecard_id = $1 and position = '1S'`, [
			p10card
		]),
	'check constraint'
);
await expectErr(
	'a played result without a winner is refused',
	() =>
		q(
			`update scorecard_lines set home_games = 3, away_games = 3, result = 'timed' where scorecard_id = $1 and position = '1S'`,
			[p10card]
		),
	'check constraint'
);

// (d) finalize refuses an incomplete card with the token
await expectErr(
	'an incomplete card cannot be finalized',
	() => q(`update scorecards set status = 'final' where id = $1`, [p10card]),
	'scorecard_incomplete'
);

// (e) a complete card finalizes and records who and when
await q(`update scorecards set match_id = '2743999' where id = $1`, [p10card]);
for (const p of ['1S', '2S', '3S', '4S'])
	await q(
		`update scorecard_lines set home_player1_name = 'Maya R.', away_player1_name = 'Vera V.',
		        home_games = 6, away_games = 2, result = 'completed', winner = 'home'
		  where scorecard_id = $1 and position = $2`,
		[p10card, p]
	);
for (const p of ['1D', '2D', '3D'])
	await q(
		`update scorecard_lines set home_player1_name = 'Maya R.', home_player2_name = 'Zoe R.',
		        away_player1_name = 'Vera V.', away_player2_name = 'Wren W.',
		        home_games = 4, away_games = 6, result = 'completed', winner = 'away'
		  where scorecard_id = $1 and position = $2`,
		[p10card, p]
	);
await q(
	`update scorecard_lines set result = 'double_default' where scorecard_id = $1 and position = '4D'`,
	[p10card]
);
const p10final = (
	await q(`update scorecards set status = 'final' where id = $1 returning finalized_at, finalized_by`, [
		p10card
	])
).rows[0];
if (p10final.finalized_at && p10final.finalized_by === COACH)
	ok('a complete card finalizes, signed by the coach who did it');
else {
	console.log('  ✗ finalize', p10final);
	failures++;
}

// (f) a coach cannot touch a final card — the update matches no row
const p10touch = (
	await q(`update scorecard_lines set home_games = 5 where scorecard_id = $1 and position = '1S' returning id`, [
		p10card
	])
).rows.length;
const p10touchCard = (await q(`update scorecards set notes = 'x' where id = $1 returning id`, [p10card])).rows
	.length;
if (p10touch === 0 && p10touchCard === 0) ok('a coach cannot change a final card');
else {
	console.log('  ✗ final card changed', p10touch, p10touchCard);
	failures++;
}

// (g) an admin reopens it, and the finalize stamp clears
await asUser(ADMIN);
const p10reopen = (
	await q(`update scorecards set status = 'draft' where id = $1 returning finalized_at, finalized_by`, [p10card])
).rows[0];
if (p10reopen.finalized_at === null && p10reopen.finalized_by === null) ok('an admin reopens a final card');
else {
	console.log('  ✗ reopen', p10reopen);
	failures++;
}

// (h) one card per USTA match
await asUser(COACH);
await expectErr(
	'a second card for the same match id is refused',
	() =>
		q(
			`insert into scorecards (team_id, match_id, played_on, home_team, away_team, momentum_side, format, set_games, created_by)
			 values ($1, '2743999', '2026-10-04', 'a', 'b', 'home', 'two_court', 4, $2)`,
			[p10team, COACH]
		),
	'duplicate key'
);

// (i) audited
const p10audit = (
	await q(
		`select count(*)::int as n from audit_log where entity_type in ('scorecards', 'scorecard_lines') and (entity_id = $1 or entity_id in (select id from scorecard_lines where scorecard_id = $1))`,
		[p10card]
	)
).rows[0].n;
if (p10audit >= 18) ok('every card and line change is audited');
else {
	console.log('  ✗ audit rows', p10audit);
	failures++;
}
await db.exec('reset role');
```

- [ ] **Step 2: Run** `pnpm db:test`. Expected: the run stops in section 16 with `relation "scorecards" does not exist` and exits 1.

- [ ] **Step 3: The migration.** Create `supabase/migrations/0010_scorecards.sql`:

```sql
-- ═══════════════════════════════════════════════════════════════════════════
-- Momentum Tennis — 0010: JTT scorecards (phase 10)
--
-- A USTA Junior Team Tennis match as the paper scorecard records it: one card,
-- exactly eight lines (#1–#4 singles, #1–#4 doubles), games per side and a
-- result per line. Staff write it on court; a final card exports to the
-- TennisLink automation. Families never see it. Which round a line plays in is
-- a function of the card's format and is derived by the app, never stored.
--
--   • scorecards — the header the card prints, Momentum's side, the format,
--     the set length, draft or final, who finalized it and when;
--   • scorecard_lines — seeded eight at a time by a trigger, so a card can
--     never have seven or nine; no insert or delete policy exists for them;
--   • finalize_scorecard — the gate: draft → final only when the match id and
--     every line are complete, raising scorecard_incomplete otherwise;
--   • RLS: staff read and write drafts; only an admin changes a final card.
-- ═══════════════════════════════════════════════════════════════════════════

create type scorecard_format as enum ('two_court', 'three_court');
create type scorecard_status as enum ('draft', 'final');
create type line_result      as enum ('completed', 'timed', 'retired', 'default', 'double_default');

create table scorecards (
  id                  uuid primary key default gen_random_uuid(),
  team_id             uuid not null references teams(id),
  session_id          uuid unique references sessions(id),      -- the scheduled match, when there is one
  match_id            text check (match_id ~ '^\d+$'),          -- USTA's id; required to finalize
  played_on           date not null,                            -- what the card prints, not a scheduling instant
  start_time          time,
  division            text not null default '',
  home_team           text not null,
  away_team           text not null,
  location            text not null default '',
  momentum_side       text not null check (momentum_side in ('home', 'away')),
  format              scorecard_format not null,
  set_games           smallint not null check (set_games in (4, 6)),
  status              scorecard_status not null default 'draft',
  home_sportsmanship  text,
  away_sportsmanship  text,
  notes               text,
  created_by          uuid not null references accounts(id),
  finalized_at        timestamptz,
  finalized_by        uuid references accounts(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create unique index scorecards_match_id_key on scorecards (match_id) where match_id is not null;
create index idx_scorecards_team on scorecards (team_id, played_on desc);

create table scorecard_lines (
  id                 uuid primary key default gen_random_uuid(),
  scorecard_id       uuid not null references scorecards(id) on delete cascade,
  position           text not null check (position in ('1S','2S','3S','4S','1D','2D','3D','4D')),
  home_player1_id    uuid references players(id),              -- set when a typed name matched one roster player
  home_player1_name  text not null default '',
  home_player2_id    uuid references players(id),
  home_player2_name  text not null default '',
  away_player1_id    uuid references players(id),
  away_player1_name  text not null default '',
  away_player2_id    uuid references players(id),
  away_player2_name  text not null default '',
  home_games         smallint check (home_games between 0 and 7),
  away_games         smallint check (away_games between 0 and 7),
  result             line_result,                              -- null until chosen or derived
  winner             text check (winner in ('home', 'away')),
  updated_at         timestamptz not null default now(),
  unique (scorecard_id, position),
  check ((home_games is null) = (away_games is null)),
  -- a singles line has one player a side
  check (position not like '%S'
         or (home_player2_id is null and home_player2_name = '' and away_player2_id is null and away_player2_name = '')),
  -- a double default records nothing; a played result records games and a winner; a default names its winner
  check (result is distinct from 'double_default' or (winner is null and home_games is null)),
  check (result is null or result not in ('completed', 'timed', 'retired') or (home_games is not null and winner is not null)),
  check (result is distinct from 'default' or winner is not null)
);

-- Exactly eight lines, by construction. Security definer: lines have no insert policy.
create function public.seed_scorecard_lines() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  insert into scorecard_lines (scorecard_id, position)
  select new.id, p from unnest(array['1S','2S','3S','4S','1D','2D','3D','4D']) as p;
  return new;
end $$;
create trigger scorecard_seed_lines after insert on scorecards
  for each row execute function seed_scorecard_lines();

-- The gate. Runs as the caller: staff can read the lines it checks.
create function public.finalize_scorecard() returns trigger
  language plpgsql set search_path = public as $$
declare l record; v_two boolean;
begin
  if old.status = 'final' and new.status = 'draft' then
    new.finalized_at := null;
    new.finalized_by := null;
    return new;
  end if;
  if not (old.status = 'draft' and new.status = 'final') then return new; end if;
  if new.match_id is null then
    raise exception 'scorecard_incomplete: the USTA match id is missing' using errcode = 'check_violation';
  end if;
  for l in select * from scorecard_lines where scorecard_id = new.id order by position loop
    v_two := l.position like '%D';
    if l.result is null then
      raise exception 'scorecard_incomplete: % has no result', l.position using errcode = 'check_violation';
    end if;
    if l.result in ('completed', 'timed', 'retired') then
      if l.home_player1_name = '' or l.away_player1_name = ''
         or (v_two and (l.home_player2_name = '' or l.away_player2_name = '')) then
        raise exception 'scorecard_incomplete: % is missing a player name', l.position using errcode = 'check_violation';
      end if;
    elsif l.result = 'default' then
      if (l.winner = 'home' and (l.home_player1_name = '' or (v_two and l.home_player2_name = '')))
         or (l.winner = 'away' and (l.away_player1_name = '' or (v_two and l.away_player2_name = ''))) then
        raise exception 'scorecard_incomplete: % names nobody on the winning side', l.position using errcode = 'check_violation';
      end if;
    end if;
  end loop;
  new.finalized_at := now();
  new.finalized_by := auth.uid();
  return new;
end $$;
create trigger scorecard_finalize before update of status on scorecards
  for each row execute function finalize_scorecard();

create trigger touch_scorecards      before update on scorecards      for each row execute function set_updated_at();
create trigger touch_scorecard_lines before update on scorecard_lines for each row execute function set_updated_at();
create trigger audit_scorecards      after insert or update or delete on scorecards      for each row execute function audit_row();
create trigger audit_scorecard_lines after insert or update or delete on scorecard_lines for each row execute function audit_row();

-- ── RLS: staff only; drafts are theirs to change, final cards an admin's ──
alter table scorecards      enable row level security;
alter table scorecard_lines enable row level security;
create policy staff_read_scorecards   on scorecards for select to authenticated using (is_staff());
create policy staff_insert_scorecards on scorecards for insert to authenticated
  with check (is_staff() and created_by = auth.uid());
create policy staff_update_scorecards on scorecards for update to authenticated
  using (is_staff() and (status = 'draft' or is_admin())) with check (is_staff());
create policy admin_delete_scorecards on scorecards for delete to authenticated
  using (is_admin() and status = 'draft');
create policy staff_read_lines   on scorecard_lines for select to authenticated using (is_staff());
create policy staff_update_lines on scorecard_lines for update to authenticated
  using (is_staff() and exists (select 1 from scorecards c where c.id = scorecard_id and (c.status = 'draft' or is_admin())))
  with check (is_staff());
```

- [ ] **Step 4: Run** `pnpm db:test` → `ALL CHECKS PASSED`, section 16 included (13 checks). If `'check constraint'` does not match PGlite's wording, use the text it prints. If `'duplicate key'` does not, use `unique`.
- [ ] **Step 5: Types.** `pnpm db:types` → `git diff --stat` shows `src/lib/server/db/database.types.ts` with `scorecards`, `scorecard_lines` and the three enums.
- [ ] **Step 6: Commit** — `git add supabase src/lib/server/db/database.types.ts && git commit -m "feat(db): 0010 — JTT scorecards with eight seeded lines and the finalize gate; harness §16"`

### Task 2: Error codes

**Files:** Modify `src/lib/server/domain/result.ts`, `result.test.ts`.

- [ ] **Step 1: Failing test.** Append to `result.test.ts`:

```ts
describe('phase 10 — scorecard refusals', () => {
	it('maps the finalize gate token with its detail', () => {
		const e = fromPostgres({ message: 'scorecard_incomplete: 2D has no result', code: '23514' });
		expect(e.code).toBe('scorecard_incomplete');
		expect(e.detail).toBe('2D has no result');
	});
	it('has copy for every scorecard code', () => {
		expect(describeError('scorecard_final')).toMatch(/administrator/);
		expect(describeError('unknown_scorecard')).toMatch(/does not exist/);
	});
});
```

- [ ] **Step 2: Run** `pnpm vitest run src/lib/server/domain/result.test.ts` → FAIL: `scorecard_incomplete` is not a code (it maps to `unexpected`) and `describeError` has no entry.
- [ ] **Step 3: Implement.** In `CODES`, before `'conflict'`, add `'scorecard_incomplete', 'scorecard_final', 'unknown_scorecard',`. In `COPY`, before `conflict:`, add:

```ts
	scorecard_incomplete: 'The card cannot be finalized yet.',
	scorecard_final: 'This card is final. An administrator can reopen it.',
	unknown_scorecard: 'That scorecard does not exist.',
```

- [ ] **Step 4: Run** the file → PASS. **Step 5: Commit** — `git commit -am "feat(result): scorecard refusal codes"`

### Task 3: `scorecards/format.ts` — the rules of the card

**Files:** Create `src/lib/server/domain/scorecards/format.ts`, `format.test.ts`.

- [ ] **Step 1: Failing tests.** Create `format.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
	completeness,
	fromScore,
	orderedPositions,
	positionLabel,
	resolveLine,
	roundOf,
	suggestResult,
	suggestWinner,
	totals,
	type Line
} from './format';

const line = (over: Partial<Line> = {}): Line => ({
	id: 'l1',
	position: '1S',
	names: { home1: 'Ada Lovelace', home2: '', away1: 'Grace Hopper', away2: '' },
	playerIds: { home1: null, home2: null, away1: null, away2: null },
	homeGames: 6,
	awayGames: 2,
	result: 'completed',
	winner: 'home',
	...over
});

describe('the two formats share eight lines and differ in rounds', () => {
	it('plays the 2-court card in four rounds and the 3-court card in three', () => {
		expect(orderedPositions('two_court')).toEqual(['1S', '4D', '2S', '3D', '3S', '2D', '4S', '1D']);
		expect(orderedPositions('three_court')).toEqual(['1S', '2S', '4D', '3S', '4S', '1D', '2D', '3D']);
		expect(roundOf('two_court', '1D')).toBe(4);
		expect(roundOf('three_court', '1D')).toBe(2);
	});
	it('labels positions the way the automation reads them', () => {
		expect(positionLabel('1S')).toBe('#1 Singles');
		expect(positionLabel('4D')).toBe('#4 Doubles');
	});
});

describe('result and winner from the score', () => {
	it('completed when one side reaches the set, timed when neither has', () => {
		expect(suggestResult({ home: 4, away: 2 }, 4)).toBe('completed');
		expect(suggestResult({ home: 3, away: 4 }, 4)).toBe('completed');
		expect(suggestResult({ home: 3, away: 3 }, 4)).toBe('timed');
		expect(suggestResult({ home: 2, away: 1 }, 4)).toBe('timed');
		expect(suggestResult({ home: 6, away: 4 }, 6)).toBe('completed');
		expect(suggestResult({ home: 6, away: 5 }, 6)).toBe('completed');
		expect(suggestResult({ home: 5, away: 4 }, 6)).toBe('timed');
	});
	it('suggests nothing for a score outside the set, or no score', () => {
		expect(suggestResult({ home: 5, away: 3 }, 4)).toBeNull();
		expect(suggestResult({ home: 7, away: 5 }, 6)).toBeNull();
		expect(suggestResult({ home: null, away: null }, 6)).toBeNull();
	});
	it('the side with more games wins; equal games decide nothing', () => {
		expect(suggestWinner({ home: 6, away: 2 })).toBe('home');
		expect(suggestWinner({ home: 2, away: 6 })).toBe('away');
		expect(suggestWinner({ home: 3, away: 3 })).toBeNull();
		expect(suggestWinner({ home: null, away: null })).toBeNull();
	});
});

describe('resolveLine — what a submission stores', () => {
	const input = (over = {}) => ({
		names: { home1: 'A', home2: '', away1: 'B', away2: '' },
		homeGames: 6 as number | null,
		awayGames: 2 as number | null,
		result: '' as const,
		winner: '' as const,
		...over
	});
	it('derives a completed line from the score', () => {
		expect(resolveLine(input(), 6)).toEqual({ result: 'completed', winner: 'home', homeGames: 6, awayGames: 2 });
	});
	it('keeps a chosen result and winner', () => {
		expect(resolveLine(input({ homeGames: 3, awayGames: 2, result: 'retired', winner: 'away' }), 6)).toEqual({
			result: 'retired',
			winner: 'away',
			homeGames: 3,
			awayGames: 2
		});
	});
	it('a played result without a winner is not a result yet', () => {
		expect(resolveLine(input({ homeGames: 3, awayGames: 3 }), 6)).toEqual({
			result: null,
			winner: null,
			homeGames: 3,
			awayGames: 3
		});
		expect(resolveLine(input({ homeGames: 3, awayGames: 3, winner: 'home' }), 6).result).toBe('timed');
	});
	it('a double default drops games and winner; a default needs a winner', () => {
		expect(resolveLine(input({ result: 'double_default', winner: 'home' }), 6)).toEqual({
			result: 'double_default',
			winner: null,
			homeGames: null,
			awayGames: null
		});
		expect(resolveLine(input({ homeGames: null, awayGames: null, result: 'default' }), 6).result).toBeNull();
		expect(resolveLine(input({ homeGames: null, awayGames: null, result: 'default', winner: 'away' }), 6)).toEqual(
			{ result: 'default', winner: 'away', homeGames: null, awayGames: null }
		);
	});
});

describe('fromScore — what the selects show', () => {
	it('shows FROM SCORE when the stored value is the derived one', () => {
		expect(fromScore(line(), 6)).toEqual({ result: '', winner: '' });
	});
	it('shows the chosen value when it differs from the score', () => {
		expect(fromScore(line({ homeGames: 7, awayGames: 5, result: 'completed' }), 6)).toEqual({
			result: 'completed',
			winner: ''
		});
		expect(fromScore(line({ result: 'retired' }), 6).result).toBe('retired');
	});
});

describe('totals and completeness', () => {
	it('sums games, treating no score as nothing', () => {
		expect(totals([line(), line({ homeGames: null, awayGames: null }), line({ homeGames: 2, awayGames: 6 })])).toEqual({
			home: 8,
			away: 8
		});
	});
	it('lists what finalize would refuse, in play order', () => {
		const lines: Line[] = [
			line({ position: '1S', result: null, homeGames: null, awayGames: null, winner: null }),
			line({ position: '4D', names: { home1: 'A', home2: '', away1: 'B', away2: 'C' } }),
			line({ position: '2S', result: null, homeGames: 3, awayGames: 3, winner: null }),
			line({ position: '3D', result: null, homeGames: 7, awayGames: 5 }),
			line({ position: '3S', result: 'default', winner: 'away', names: { home1: 'A', home2: '', away1: '', away2: '' } }),
			line({ position: '2D', result: 'double_default', homeGames: null, awayGames: null, winner: null, names: { home1: '', home2: '', away1: '', away2: '' } })
		];
		expect(completeness({ matchId: null, format: 'two_court' }, lines)).toEqual([
			'MATCH ID MISSING',
			'#1 SINGLES · NO SCORE',
			'#4 DOUBLES · MISSING A PLAYER NAME',
			'#2 SINGLES · NAME THE WINNER',
			'#3 DOUBLES · CHOOSE A RESULT',
			'#3 SINGLES · NAMES NOBODY ON THE WINNING SIDE'
		]);
	});
	it('is empty when the card is ready', () => {
		expect(completeness({ matchId: '2743999', format: 'two_court' }, [line()])).toEqual([]);
	});
});
```

- [ ] **Step 2: Run** `pnpm vitest run src/lib/server/domain/scorecards/format.test.ts` → FAIL: cannot find module `./format`.
- [ ] **Step 3: Implement.** Create `format.ts`:

```ts
// USTA Junior Team Tennis, as the paper scorecard records it. Pure: no database, no clock.
// Both card formats carry the same eight lines; they differ only in which lines play together.

export const POSITIONS = ['1S', '2S', '3S', '4S', '1D', '2D', '3D', '4D'] as const;
export type Position = (typeof POSITIONS)[number];
export type ScorecardFormat = 'two_court' | 'three_court';
export type Side = 'home' | 'away';
export type LineResult = 'completed' | 'timed' | 'retired' | 'default' | 'double_default';
export type SetGames = 4 | 6;

export const FORMATS: ScorecardFormat[] = ['two_court', 'three_court'];
export const RESULTS: LineResult[] = ['completed', 'timed', 'retired', 'default', 'double_default'];

/** Which lines play together. The 3-court card is the alternative both captains must agree to. */
export const ROUNDS: Record<ScorecardFormat, readonly (readonly Position[])[]> = {
	two_court: [
		['1S', '4D'],
		['2S', '3D'],
		['3S', '2D'],
		['4S', '1D']
	],
	three_court: [
		['1S', '2S', '4D'],
		['3S', '4S', '1D'],
		['2D', '3D']
	]
};

export const FORMAT_LABELS: Record<ScorecardFormat, string> = {
	two_court: '2 COURTS',
	three_court: '3 COURTS'
};
export const RESULT_LABELS: Record<LineResult, string> = {
	completed: 'Completed',
	timed: 'Timed match',
	retired: 'Retired',
	default: 'Default',
	double_default: 'Double default'
};

export const isPosition = (s: string): s is Position => (POSITIONS as readonly string[]).includes(s);
export const isDoubles = (p: Position): boolean => p.endsWith('D');
/** `1S` → `#1 Singles`: the form the automation's observed card uses. */
export const positionLabel = (p: Position): string =>
	`#${p[0]} ${isDoubles(p) ? 'Doubles' : 'Singles'}`;
export const roundOf = (format: ScorecardFormat, p: Position): number =>
	ROUNDS[format].findIndex((r) => r.includes(p)) + 1;
/** Positions in the order the card plays them: by round, then as printed. */
export const orderedPositions = (format: ScorecardFormat): Position[] => ROUNDS[format].flat();

export type Games = { home: number | null; away: number | null };

/** Completed when one side has exactly the set's games and the other fewer; timed when both have fewer. */
export function suggestResult(g: Games, setGames: SetGames): 'completed' | 'timed' | null {
	if (g.home === null || g.away === null) return null;
	const hi = Math.max(g.home, g.away);
	const lo = Math.min(g.home, g.away);
	if (hi === setGames && lo < setGames) return 'completed';
	if (hi < setGames) return 'timed';
	return null;
}

/** More games wins; equal games decide nothing. */
export function suggestWinner(g: Games): Side | null {
	if (g.home === null || g.away === null || g.home === g.away) return null;
	return g.home > g.away ? 'home' : 'away';
}

export type Slots = { home1: string; home2: string; away1: string; away2: string };
export type Line = {
	id: string;
	position: Position;
	names: Slots;
	playerIds: Record<keyof Slots, string | null>;
	homeGames: number | null;
	awayGames: number | null;
	result: LineResult | null;
	winner: Side | null;
};
/** What the form submits for a line. '' on result or winner means "from score". */
export type LineInput = {
	names: Slots;
	homeGames: number | null;
	awayGames: number | null;
	result: LineResult | '';
	winner: Side | '';
};
export type Resolved = Pick<Line, 'homeGames' | 'awayGames' | 'result' | 'winner'>;

/**
 * Turns a submission into what the row stores. A chosen result or winner stands; "from score"
 * derives one. A played result (completed, timed, retired) needs games and a winner to be a
 * result at all — until then it stays null and the readiness list says what is missing.
 */
export function resolveLine(input: LineInput, setGames: SetGames): Resolved {
	const games = { home: input.homeGames, away: input.awayGames };
	const result = input.result || suggestResult(games, setGames);
	if (result === 'double_default')
		return { result, winner: null, homeGames: null, awayGames: null };
	const winner = input.winner || suggestWinner(games);
	if (result === 'default')
		return {
			result: winner ? result : null,
			winner,
			homeGames: input.homeGames,
			awayGames: input.awayGames
		};
	const played = result !== null && games.home !== null && winner !== null;
	return {
		result: played ? result : null,
		winner,
		homeGames: input.homeGames,
		awayGames: input.awayGames
	};
}

/** The select values the card page shows: '' (from score) whenever the stored value is the derived one. */
export function fromScore(
	line: Pick<Line, 'homeGames' | 'awayGames' | 'result' | 'winner'>,
	setGames: SetGames
): { result: LineResult | ''; winner: Side | '' } {
	const games = { home: line.homeGames, away: line.awayGames };
	return {
		result: line.result === suggestResult(games, setGames) ? '' : (line.result ?? ''),
		winner: line.winner === suggestWinner(games) ? '' : (line.winner ?? '')
	};
}

export function totals(lines: Pick<Line, 'homeGames' | 'awayGames'>[]): {
	home: number;
	away: number;
} {
	return lines.reduce(
		(t, l) => ({ home: t.home + (l.homeGames ?? 0), away: t.away + (l.awayGames ?? 0) }),
		{ home: 0, away: 0 }
	);
}

const namesFilled = (line: Line, side: Side): boolean => {
	const one = side === 'home' ? line.names.home1 : line.names.away1;
	const two = side === 'home' ? line.names.home2 : line.names.away2;
	return one.trim() !== '' && (!isDoubles(line.position) || two.trim() !== '');
};

/** Mirrors the finalize trigger, in play order, as mono lines for the card page. Empty = ready. */
export function completeness(
	card: { matchId: string | null; format: ScorecardFormat },
	lines: Line[]
): string[] {
	const out: string[] = [];
	if (!card.matchId) out.push('MATCH ID MISSING');
	for (const p of orderedPositions(card.format)) {
		const line = lines.find((l) => l.position === p);
		if (!line) continue;
		const tag = positionLabel(p).toUpperCase();
		if (line.result === null) {
			if (line.homeGames === null) out.push(`${tag} · NO SCORE`);
			else if (line.winner === null) out.push(`${tag} · NAME THE WINNER`);
			else out.push(`${tag} · CHOOSE A RESULT`);
			continue;
		}
		if (line.result === 'double_default') continue;
		if (line.result === 'default') {
			if (line.winner && !namesFilled(line, line.winner))
				out.push(`${tag} · NAMES NOBODY ON THE WINNING SIDE`);
			continue;
		}
		if (!namesFilled(line, 'home') || !namesFilled(line, 'away'))
			out.push(`${tag} · MISSING A PLAYER NAME`);
	}
	return out;
}
```

- [ ] **Step 4: Run** the file → PASS (14 tests). **Step 5: Commit** — `git add src/lib/server/domain/scorecards && git commit -m "feat(scorecards): the card's rules — rounds, labels, derived results, readiness"`

### Task 4: `scorecards/form.ts` — the form contract

**Files:** Create `src/lib/server/domain/scorecards/form.ts`, `form.test.ts`.

The card page is one form. Header fields carry the schema's key as their name; line fields are `<position>_<slot>` with slots `home1 home2 away1 away2 hg ag result winner`. `fieldValues` turns a stored card into that flat map; `submittedFields` keeps a failed submission on screen; the two parsers turn a submission back into typed input.

- [ ] **Step 1: Failing tests.** Create `form.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { Line } from './format';
import { fieldValues, headerSchema, lineField, parseHeader, parseLines, submittedFields } from './form';

const form = (entries: Record<string, string>) => {
	const d = new FormData();
	for (const [k, v] of Object.entries(entries)) d.set(k, v);
	return d;
};
const header = {
	matchId: '2743999',
	playedOn: '2026-10-04',
	startTime: '14:00',
	division: '12U Green',
	homeTeam: 'Chippers',
	awayTeam: 'Momentum Tennis 12U Green A',
	location: 'Backesto Park',
	momentumSide: 'away',
	format: 'three_court',
	setGames: '6',
	homeSportsmanship: '',
	awaySportsmanship: '',
	notes: ''
};

describe('headerSchema', () => {
	it('accepts the card header and defaults the optional fields', () => {
		const r = headerSchema.safeParse({ ...header, teamId: '00000000-0000-4000-8000-000000000001' });
		expect(r.success).toBe(true);
		if (r.success) expect(r.data.sessionId).toBe('');
	});
	it('refuses a match id that is not digits and a missing team name', () => {
		const r = headerSchema.safeParse({ ...header, teamId: '00000000-0000-4000-8000-000000000001', matchId: '27-43', homeTeam: '' });
		expect(r.success).toBe(false);
		if (!r.success) expect(r.error.issues.map((i) => String(i.path[0])).sort()).toEqual(['homeTeam', 'matchId']);
	});
});

describe('parseHeader / parseLines', () => {
	it('parses the header without the team and match fields', () => {
		const r = parseHeader(form(header));
		expect(r.errors).toEqual({});
		expect(r.value?.setGames).toBe('6');
		expect(r.value?.momentumSide).toBe('away');
	});
	it('keys header errors by field name', () => {
		const r = parseHeader(form({ ...header, playedOn: 'Sunday' }));
		expect(r.value).toBeNull();
		expect(r.errors.playedOn).toBe('Use YYYY-MM-DD');
	});
	it('parses eight lines, blank games as no score, and FROM SCORE as empty', () => {
		const r = parseLines(form({ [lineField('1S', 'home1')]: 'Ada Lovelace', [lineField('1S', 'away1')]: 'Grace Hopper', [lineField('1S', 'hg')]: '6', [lineField('1S', 'ag')]: '2' }));
		expect(r.errors).toEqual({});
		expect(Object.keys(r.lines)).toHaveLength(8);
		expect(r.lines['1S']).toEqual({
			names: { home1: 'Ada Lovelace', home2: '', away1: 'Grace Hopper', away2: '' },
			homeGames: 6,
			awayGames: 2,
			result: '',
			winner: ''
		});
		expect(r.lines['2S'].homeGames).toBeNull();
	});
	it('refuses a games value outside 0–7 and a one-sided score, keyed by field', () => {
		const r = parseLines(form({ [lineField('1S', 'hg')]: '9', [lineField('1S', 'ag')]: '2', [lineField('2S', 'hg')]: '4' }));
		expect(r.errors[lineField('1S', 'hg')]).toBe('0 to 7');
		expect(r.errors[lineField('2S', 'hg')]).toBe('Enter both scores');
	});
});

describe('fieldValues / submittedFields', () => {
	const line: Line = {
		id: 'l1',
		position: '1S',
		names: { home1: 'Ada Lovelace', home2: '', away1: 'Grace Hopper', away2: '' },
		playerIds: { home1: null, home2: null, away1: null, away2: null },
		homeGames: 6,
		awayGames: 2,
		result: 'completed',
		winner: 'home'
	};
	it('flattens a stored card into field values, selects at FROM SCORE when derived', () => {
		const v = fieldValues({ ...header, matchId: '2743999', startTime: '14:00', momentumSide: 'away', format: 'three_court', setGames: 6 }, [line]);
		expect(v.matchId).toBe('2743999');
		expect(v.setGames).toBe('6');
		expect(v[lineField('1S', 'home1')]).toBe('Ada Lovelace');
		expect(v[lineField('1S', 'hg')]).toBe('6');
		expect(v[lineField('1S', 'result')]).toBe('');
		expect(v[lineField('1S', 'winner')]).toBe('');
	});
	it('renders a chosen result that the score does not derive', () => {
		const v = fieldValues({ ...header, matchId: null, startTime: null, momentumSide: 'away', format: 'three_court', setGames: 6 }, [{ ...line, result: 'retired' }]);
		expect(v[lineField('1S', 'result')]).toBe('retired');
		expect(v.matchId).toBe('');
	});
	it('keeps a submission as strings', () => {
		expect(submittedFields(form({ a: '1', b: '' }))).toEqual({ a: '1', b: '' });
	});
});
```

- [ ] **Step 2: Run** `pnpm vitest run src/lib/server/domain/scorecards/form.test.ts` → FAIL: cannot find module `./form`.
- [ ] **Step 3: Implement.** Create `form.ts`:

```ts
import { z } from 'zod';
import { localDate, localTime, uuid } from '$lib/server/domain/schedule/common';
import {
	fromScore,
	POSITIONS,
	type Line,
	type LineInput,
	type Position,
	type ScorecardFormat,
	type SetGames,
	type Side
} from './format';

// The card page is one form. Header fields carry the schema key as their name; line fields are
// `<position>_<slot>`. Everything here is pure so the contract is tested without a request.

const text = (max: number) => z.string().trim().max(max, 'Too long');

/** The header a coach types. `new` takes all of it; the card page everything but the team and match. */
export const headerSchema = z.object({
	teamId: uuid,
	sessionId: z.union([uuid, z.literal('')]).default(''),
	matchId: z.string().trim().regex(/^\d{0,12}$/, 'Digits only').default(''),
	playedOn: localDate,
	startTime: z.union([localTime, z.literal('')]).default(''),
	division: text(64).default(''),
	homeTeam: text(120).min(1, 'Name the home team'),
	awayTeam: text(120).min(1, 'Name the visiting team'),
	location: text(120).default(''),
	momentumSide: z.enum(['home', 'away']).default('home'),
	format: z.enum(['two_court', 'three_court']).default('two_court'),
	setGames: z.enum(['4', '6']).default('6'),
	homeSportsmanship: text(120).default(''),
	awaySportsmanship: text(120).default(''),
	notes: text(1000).default('')
});
export type HeaderInput = z.infer<typeof headerSchema>;
export const cardSchema = headerSchema.omit({ teamId: true, sessionId: true });
export type CardInput = z.infer<typeof cardSchema>;

const games = z
	.string()
	.trim()
	.regex(/^[0-7]?$/, '0 to 7')
	.default('')
	.transform((v) => (v === '' ? null : Number(v)));
export const lineSchema = z
	.object({
		home1: text(80).default(''),
		home2: text(80).default(''),
		away1: text(80).default(''),
		away2: text(80).default(''),
		homeGames: games,
		awayGames: games,
		result: z.enum(['', 'completed', 'timed', 'retired', 'default', 'double_default']).default(''),
		winner: z.enum(['', 'home', 'away']).default('')
	})
	.refine((l) => (l.homeGames === null) === (l.awayGames === null), {
		message: 'Enter both scores',
		path: ['homeGames']
	});

export type LineSlot = 'home1' | 'home2' | 'away1' | 'away2' | 'hg' | 'ag' | 'result' | 'winner';
export const lineField = (p: Position, slot: LineSlot): string => `${p}_${slot}`;

/** What the stored card looks like to the form: the header the page edits. */
export type CardHeader = {
	matchId: string | null;
	playedOn: string;
	startTime: string | null;
	division: string;
	homeTeam: string;
	awayTeam: string;
	location: string;
	momentumSide: Side;
	format: ScorecardFormat;
	setGames: SetGames;
	homeSportsmanship: string;
	awaySportsmanship: string;
	notes: string;
};

const issues = (error: z.ZodError, rename: Record<string, string> = {}) => {
	const out: Record<string, string> = {};
	for (const issue of error.issues) {
		const key = String(issue.path[0] ?? '');
		out[rename[key] ?? key] ??= issue.message;
	}
	return out;
};

export function parseHeader(data: FormData): { value: CardInput | null; errors: Record<string, string> } {
	const parsed = cardSchema.safeParse(Object.fromEntries(data));
	return parsed.success ? { value: parsed.data, errors: {} } : { value: null, errors: issues(parsed.error) };
}

const EMPTY: LineInput = {
	names: { home1: '', home2: '', away1: '', away2: '' },
	homeGames: null,
	awayGames: null,
	result: '',
	winner: ''
};

export function parseLines(data: FormData): {
	lines: Record<Position, LineInput>;
	errors: Record<string, string>;
} {
	const lines = {} as Record<Position, LineInput>;
	const errors: Record<string, string> = {};
	const get = (p: Position, slot: LineSlot) => String(data.get(lineField(p, slot)) ?? '');
	for (const p of POSITIONS) {
		const parsed = lineSchema.safeParse({
			home1: get(p, 'home1'),
			home2: get(p, 'home2'),
			away1: get(p, 'away1'),
			away2: get(p, 'away2'),
			homeGames: get(p, 'hg'),
			awayGames: get(p, 'ag'),
			result: get(p, 'result'),
			winner: get(p, 'winner')
		});
		if (parsed.success) {
			const l = parsed.data;
			lines[p] = {
				names: { home1: l.home1, home2: l.home2, away1: l.away1, away2: l.away2 },
				homeGames: l.homeGames,
				awayGames: l.awayGames,
				result: l.result,
				winner: l.winner
			};
		} else {
			lines[p] = EMPTY;
			for (const [key, message] of Object.entries(issues(parsed.error, { homeGames: 'hg', awayGames: 'ag' })))
				errors[`${p}_${key}`] = message;
		}
	}
	return { lines, errors };
}

/** Every field the card page renders, as strings, from the stored card. */
export function fieldValues(card: CardHeader, lines: Line[]): Record<string, string> {
	const v: Record<string, string> = {
		matchId: card.matchId ?? '',
		playedOn: card.playedOn,
		startTime: card.startTime ?? '',
		division: card.division,
		homeTeam: card.homeTeam,
		awayTeam: card.awayTeam,
		location: card.location,
		momentumSide: card.momentumSide,
		format: card.format,
		setGames: String(card.setGames),
		homeSportsmanship: card.homeSportsmanship,
		awaySportsmanship: card.awaySportsmanship,
		notes: card.notes
	};
	for (const l of lines) {
		const shown = fromScore(l, card.setGames);
		v[lineField(l.position, 'home1')] = l.names.home1;
		v[lineField(l.position, 'home2')] = l.names.home2;
		v[lineField(l.position, 'away1')] = l.names.away1;
		v[lineField(l.position, 'away2')] = l.names.away2;
		v[lineField(l.position, 'hg')] = l.homeGames === null ? '' : String(l.homeGames);
		v[lineField(l.position, 'ag')] = l.awayGames === null ? '' : String(l.awayGames);
		v[lineField(l.position, 'result')] = shown.result;
		v[lineField(l.position, 'winner')] = shown.winner;
	}
	return v;
}

/** A failed submission, kept on screen as typed. */
export const submittedFields = (data: FormData): Record<string, string> =>
	Object.fromEntries([...data.entries()].map(([k, val]) => [k, String(val)]));
```

- [ ] **Step 4: Run** the file → PASS (9 tests). If zod reports the regex message under a different path for `games` (the `default` wraps it), check `parsed.error.issues[0].path` and adjust `issues()`'s key, not the tests. **Step 5: Commit** — `git add src/lib/server/domain/scorecards && git commit -m "feat(scorecards): the form contract — schemas, field names, parsing, values"`

### Task 5: `scorecards/export.ts` — the observed card

**Files:** Create `src/lib/server/domain/scorecards/export.ts`, `export.test.ts`.

- [ ] **Step 1: Failing tests.** Create `export.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { Line } from './format';
import { dateText, exportFilename, observedCard, timeText } from './export';

const header = {
	id: '0d6e2f3a-0000-4000-8000-000000000001',
	matchId: '2743978',
	playedOn: '2026-10-04',
	startTime: '14:00',
	division: '12U Green',
	homeTeam: 'Chippers',
	awayTeam: 'Momentum Tennis 12U Green A',
	location: 'Backesto Park',
	format: 'three_court' as const,
	setGames: 6 as const
};
const line = (position: Line['position'], over: Partial<Line> = {}): Line => ({
	id: `l-${position}`,
	position,
	names: { home1: 'Ada Lovelace', home2: '', away1: 'Grace Hopper', away2: '' },
	playerIds: { home1: null, home2: null, away1: null, away2: null },
	homeGames: 4,
	awayGames: 6,
	result: 'completed',
	winner: 'away',
	...over
});

describe('the digital card text forms', () => {
	it('prints the date as MM/DD/YY and the time as h:mm AM', () => {
		expect(dateText('2026-10-04')).toBe('10/04/26');
		expect(timeText('14:00')).toBe('2:00 PM');
		expect(timeText('09:30:00')).toBe('9:30 AM');
		expect(timeText('00:15')).toBe('12:15 AM');
		expect(timeText(null)).toBe('');
	});
});

describe('observedCard', () => {
	it('is the automation shape plus result and winner, lines in play order, totals computed', () => {
		const doc = observedCard(
			header,
			[
				line('2D', { names: { home1: 'Ada Lovelace', home2: 'Edsger Dijkstra', away1: 'Grace Hopper', away2: 'Barbara Liskov' } }),
				line('1S', { homeGames: 6, awayGames: 2, winner: 'home' })
			],
			'2026-10-04T23:10:00.000Z'
		);
		expect(doc.source).toBe('momentum-tennis-platform');
		expect(doc.format).toBe('three_court');
		expect(doc.set_games).toBe(6);
		expect(doc.card.match_id).toBe('2743978');
		expect(doc.card.date_text).toBe('10/04/26');
		expect(doc.card.time_text).toBe('2:00 PM');
		expect(doc.card.lines.map((l) => l.position_text)).toEqual(['#1 Singles', '#2 Doubles']);
		expect(doc.card.lines[0]).toEqual({
			round: 1,
			position_text: '#1 Singles',
			home_names: ['Ada Lovelace'],
			away_names: ['Grace Hopper'],
			home_games: 6,
			away_games: 2,
			result: 'completed',
			winner: 'home'
		});
		expect(doc.card.lines[1].round).toBe(3);
		expect(doc.card.lines[1].home_names).toEqual(['Ada Lovelace', 'Edsger Dijkstra']);
		expect(doc.card.printed_home_total).toBe(10);
		expect(doc.card.printed_away_total).toBe(8);
	});
	it('exports a line without games as nulls and empty names, never invented zeros', () => {
		const doc = observedCard(header, [line('4D', { names: { home1: '', home2: '', away1: '', away2: '' }, homeGames: null, awayGames: null, result: 'double_default', winner: null })], '2026-10-04T23:10:00.000Z');
		expect(doc.card.lines[0]).toMatchObject({ home_names: [], away_names: [], home_games: null, away_games: null, winner: null });
	});
	it('names the file after the match', () => {
		expect(exportFilename(header)).toBe('scorecard-2743978.json');
		expect(exportFilename({ ...header, matchId: null })).toBe('scorecard-0d6e2f3a.json');
	});
});
```

- [ ] **Step 2: Run** → FAIL: cannot find module `./export`.
- [ ] **Step 3: Implement.** Create `export.ts`:

```ts
import {
	orderedPositions,
	positionLabel,
	roundOf,
	totals,
	type Line,
	type LineResult,
	type ScorecardFormat,
	type SetGames,
	type Side
} from './format';

// The observed card the TennisLink automation ingests (tennislink-automation/outputs/momentum-tennis,
// src/pipeline/dry-run.ts ObservedCardSchema) without its three PDF render fields, plus the result
// and winner per line. Dates and times use the digital card's text forms. A line without games
// exports nulls and empty names: honest data, never invented zeros.

export type ExportHeader = {
	id: string;
	matchId: string | null;
	playedOn: string;
	startTime: string | null;
	division: string;
	homeTeam: string;
	awayTeam: string;
	location: string;
	format: ScorecardFormat;
	setGames: SetGames;
};
export type ObservedLine = {
	round: number;
	position_text: string;
	home_names: string[];
	away_names: string[];
	home_games: number | null;
	away_games: number | null;
	result: LineResult | null;
	winner: Side | null;
};
export type ExportDocument = {
	source: 'momentum-tennis-platform';
	scorecard_id: string;
	exported_at: string;
	format: ScorecardFormat;
	set_games: SetGames;
	card: {
		match_id: string | null;
		date_text: string;
		time_text: string;
		division: string;
		home_team: string;
		away_team: string;
		location: string;
		lines: ObservedLine[];
		printed_home_total: number;
		printed_away_total: number;
	};
};

/** 2026-10-04 → 10/04/26 */
export function dateText(playedOn: string): string {
	const [y, m, d] = playedOn.split('-');
	return `${m}/${d}/${y.slice(2)}`;
}

/** 14:00 or 14:00:00 → 2:00 PM; nothing → '' */
export function timeText(startTime: string | null): string {
	if (!startTime) return '';
	const [h, m] = startTime.split(':').map(Number);
	const hour = h % 12 === 0 ? 12 : h % 12;
	return `${hour}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

const names = (a: string, b: string): string[] => [a, b].map((n) => n.trim()).filter(Boolean);

export function observedCard(card: ExportHeader, lines: Line[], exportedAt: string): ExportDocument {
	const ordered = orderedPositions(card.format).flatMap((p) => lines.filter((l) => l.position === p));
	const t = totals(lines);
	return {
		source: 'momentum-tennis-platform',
		scorecard_id: card.id,
		exported_at: exportedAt,
		format: card.format,
		set_games: card.setGames,
		card: {
			match_id: card.matchId,
			date_text: dateText(card.playedOn),
			time_text: timeText(card.startTime),
			division: card.division,
			home_team: card.homeTeam,
			away_team: card.awayTeam,
			location: card.location,
			lines: ordered.map((l) => ({
				round: roundOf(card.format, l.position),
				position_text: positionLabel(l.position),
				home_names: names(l.names.home1, l.names.home2),
				away_names: names(l.names.away1, l.names.away2),
				home_games: l.homeGames,
				away_games: l.awayGames,
				result: l.result,
				winner: l.winner
			})),
			printed_home_total: t.home,
			printed_away_total: t.away
		}
	};
}

export const exportFilename = (card: Pick<ExportHeader, 'id' | 'matchId'>): string =>
	`scorecard-${card.matchId ?? card.id.slice(0, 8)}.json`;
```

- [ ] **Step 4: Run** → PASS (4 tests). **Step 5: Commit** — `git add src/lib/server/domain/scorecards && git commit -m "feat(scorecards): the observed-card export"`

### Task 6: `scorecards/cards.ts` — data access

**Files:** Create `src/lib/server/domain/scorecards/cards.ts`, `cards.test.ts`.

- [ ] **Step 1: Failing tests.** Create `cards.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { called, fakeDb } from '$lib/server/domain/schedule/fakes';
import type { HeaderInput } from './form';
import type { LineInput, Position } from './format';
import {
	createScorecard,
	deleteDraft,
	finalize,
	getScorecard,
	linkRoster,
	listScorecards,
	reopen,
	saveCard,
	teamMatches
} from './cards';

const TEAM = '00000000-0000-4000-8000-000000000001';
const header: HeaderInput = {
	teamId: TEAM,
	sessionId: '',
	matchId: '2743999',
	playedOn: '2026-10-04',
	startTime: '14:00',
	division: '12U Green',
	homeTeam: 'Chippers',
	awayTeam: 'Momentum Tennis 12U Green A',
	location: 'Backesto Park',
	momentumSide: 'away',
	format: 'three_court',
	setGames: '6',
	homeSportsmanship: '',
	awaySportsmanship: '',
	notes: ''
};
const cardRow = {
	id: 'c1',
	team_id: TEAM,
	session_id: null,
	match_id: '2743999',
	played_on: '2026-10-04',
	start_time: '14:00:00',
	division: '12U Green',
	home_team: 'Chippers',
	away_team: 'Momentum Tennis 12U Green A',
	location: 'Backesto Park',
	momentum_side: 'away',
	format: 'three_court',
	set_games: 6,
	status: 'draft',
	home_sportsmanship: null,
	away_sportsmanship: null,
	notes: null,
	finalized_at: null,
	created_at: '2026-10-02T00:00:00Z',
	teams: { name: 'Momentum Tennis 12U Green A' }
};
const lineRow = (position: string) => ({
	id: `l-${position}`,
	position,
	home_player1_id: null,
	home_player1_name: '',
	home_player2_id: null,
	home_player2_name: '',
	away_player1_id: null,
	away_player1_name: '',
	away_player2_id: null,
	away_player2_name: '',
	home_games: null,
	away_games: null,
	result: null,
	winner: null
});
const insertCall = (calls: unknown[], method: string) =>
	(calls.find((c) => Array.isArray(c) && c[0] === method) as unknown[] | undefined)?.[1];

describe('reads', () => {
	it('lists cards newest first with the team name', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ tables: { scorecards: { data: [cardRow] } }, calls });
		const r = await listScorecards(db);
		expect(r.ok && r.value[0]).toMatchObject({ id: 'c1', teamName: 'Momentum Tennis 12U Green A', startTime: '14:00', status: 'draft' });
		expect(called(calls, 'order', 'played_on', { ascending: false })).toBe(true);
	});
	it('reads a card with its lines in play order, or null', async () => {
		const db = fakeDb({
			tables: {
				scorecards: { data: cardRow },
				scorecard_lines: { data: ['1S', '2S', '3S', '4S', '1D', '2D', '3D', '4D'].map(lineRow) }
			}
		});
		const r = await getScorecard(db, 'c1');
		expect(r.ok && r.value?.lines.map((l) => l.position)).toEqual(['1S', '2S', '4D', '3S', '4S', '1D', '2D', '3D']);
		const none = await getScorecard(fakeDb({ tables: { scorecards: { data: null } } }), 'c1');
		expect(none).toEqual({ ok: true, value: null });
	});
	it('maps a refused read', async () => {
		const r = await listScorecards(fakeDb({ tables: { scorecards: { error: { message: 'denied', code: '42501' } } } }));
		expect(!r.ok && r.error.code).toBe('not_authorized');
	});
});

describe('createScorecard', () => {
	it('inserts the header with the caller as author and returns the id', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ tables: { scorecards: { data: { id: 'c1' } } }, calls });
		const r = await createScorecard(db, header, 'acct-1');
		expect(r).toEqual({ ok: true, value: { id: 'c1' } });
		expect(insertCall(calls, 'insert')).toEqual({
			team_id: TEAM,
			session_id: null,
			match_id: '2743999',
			played_on: '2026-10-04',
			start_time: '14:00',
			division: '12U Green',
			home_team: 'Chippers',
			away_team: 'Momentum Tennis 12U Green A',
			location: 'Backesto Park',
			momentum_side: 'away',
			format: 'three_court',
			set_games: 6,
			home_sportsmanship: null,
			away_sportsmanship: null,
			notes: null,
			created_by: 'acct-1'
		});
	});
	it('a second card for the same match is a conflict', async () => {
		const r = await createScorecard(fakeDb({ tables: { scorecards: { error: { message: 'duplicate', code: '23505' } } } }), header, 'acct-1');
		expect(!r.ok && r.error.code).toBe('conflict');
	});
});

describe('linkRoster', () => {
	const roster = [
		{ playerId: 'p1', fullName: 'Ada Lovelace' },
		{ playerId: 'p2', fullName: 'Grace Hopper' },
		{ playerId: 'p3', fullName: 'Grace Hopper' }
	];
	it('links an exact name ignoring case and accents, never an ambiguous or absent one', () => {
		expect(linkRoster('ada lovelace', roster)).toBe('p1');
		expect(linkRoster('Ada  Lovelace ', roster)).toBe('p1');
		expect(linkRoster('Grace Hopper', roster)).toBeNull();
		expect(linkRoster('Alan Turing', roster)).toBeNull();
		expect(linkRoster('', roster)).toBeNull();
	});
});

describe('saveCard', () => {
	const lines = Object.fromEntries(
		['1S', '2S', '3S', '4S', '1D', '2D', '3D', '4D'].map((p) => [
			p,
			{ names: { home1: '', home2: '', away1: '', away2: '' }, homeGames: null, awayGames: null, result: '', winner: '' }
		])
	) as Record<Position, LineInput>;
	const roster = [{ playerId: 'p1', fullName: 'Ada Lovelace' }];
	it('updates the draft header, then every line with the resolved result and the roster link on our side', async () => {
		const calls: unknown[] = [];
		const db = fakeDb({ tables: { scorecards: { data: [{ id: 'c1' }] }, scorecard_lines: { data: [] } }, calls });
		const r = await saveCard(db, 'c1', header, {
			...lines,
			'1S': { names: { home1: 'Grace Hopper', home2: '', away1: 'Ada Lovelace', away2: '' }, homeGames: 2, awayGames: 6, result: '', winner: '' }
		}, roster);
		expect(r).toEqual({ ok: true, value: null });
		expect(called(calls, 'eq', 'status', 'draft')).toBe(true);
		const updates = calls.filter((c) => Array.isArray(c) && c[0] === 'update') as unknown[][];
		expect(updates).toHaveLength(9);
		expect(updates[1][1]).toMatchObject({
			home_player1_name: 'Grace Hopper',
			home_player1_id: null,
			away_player1_name: 'Ada Lovelace',
			away_player1_id: 'p1',
			home_games: 2,
			away_games: 6,
			result: 'completed',
			winner: 'away'
		});
		expect(called(calls, 'eq', 'position', '1S')).toBe(true);
	});
	it('a final card is refused before any line is touched', async () => {
		const calls: unknown[] = [];
		const r = await saveCard(fakeDb({ tables: { scorecards: { data: [] } }, calls }), 'c1', header, lines, roster);
		expect(!r.ok && r.error.code).toBe('scorecard_final');
		expect(calls.filter((c) => Array.isArray(c) && c[0] === 'from' && c[1] === 'scorecard_lines')).toHaveLength(0);
	});
});

describe('finalize / reopen / deleteDraft', () => {
	it('finalize flips a draft and surfaces the gate token with its detail', async () => {
		const ok = await finalize(fakeDb({ tables: { scorecards: { data: [{ id: 'c1' }] } } }), 'c1');
		expect(ok).toEqual({ ok: true, value: null });
		const gate = await finalize(fakeDb({ tables: { scorecards: { error: { message: 'scorecard_incomplete: 2D has no result', code: '23514' } } } }), 'c1');
		expect(!gate.ok && gate.error.code).toBe('scorecard_incomplete');
		expect(!gate.ok && gate.error.detail).toBe('2D has no result');
		const already = await finalize(fakeDb({ tables: { scorecards: { data: [] } } }), 'c1');
		expect(!already.ok && already.error.code).toBe('scorecard_final');
	});
	it('reopen and delete match no row for a coach — admin only', async () => {
		const r = await reopen(fakeDb({ tables: { scorecards: { data: [] } } }), 'c1');
		expect(!r.ok && r.error.code).toBe('admin_only');
		const d = await deleteDraft(fakeDb({ tables: { scorecards: { data: [] } } }), 'c1');
		expect(!d.ok && d.error.code).toBe('admin_only');
	});
});

describe('teamMatches', () => {
	it('lists a team’s scheduled matches in academy time, newest first, for the prefill', async () => {
		const db = fakeDb({
			tables: {
				team_sessions: {
					data: [
						{ session_id: 's1', opponent: 'Chippers', home_away: 'away', sessions: { starts_at: '2026-10-04T21:00:00Z', status: 'scheduled', venue_note: 'Chippers home courts', courts: null } },
						{ session_id: 's2', opponent: 'Alpine Hills', home_away: 'home', sessions: { starts_at: '2026-09-13T21:00:00Z', status: 'scheduled', venue_note: null, courts: { name: 'BP-1', locations: { name: 'Backesto Park' } } } },
						{ session_id: 's3', opponent: 'Gone', home_away: 'home', sessions: { starts_at: '2026-09-20T21:00:00Z', status: 'cancelled', venue_note: null, courts: null } }
					]
				}
			}
		});
		const r = await teamMatches(db, TEAM, 'America/Los_Angeles');
		expect(r.ok && r.value.map((m) => m.sessionId)).toEqual(['s1', 's2']);
		expect(r.ok && r.value[0]).toMatchObject({ playedOn: '2026-10-04', startTime: '14:00', opponent: 'Chippers', homeAway: 'away', location: 'Chippers home courts', label: '2026-10-04 · 14:00 · VS CHIPPERS · AWAY' });
		expect(r.ok && r.value[1].location).toBe('BP-1 · Backesto Park');
	});
});
```

- [ ] **Step 2: Run** `pnpm vitest run src/lib/server/domain/scorecards/cards.test.ts` → FAIL: cannot find module `./cards`.
- [ ] **Step 3: Implement.** Create `cards.ts`:

```ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/server/db/database.types';
import { AppError, err, fromPostgres, ok, type Result } from '$lib/server/domain/result';
import { academyDate, academyTime } from '$lib/server/domain/time';
import type { CardHeader, CardInput, HeaderInput } from './form';
import {
	isPosition,
	orderedPositions,
	POSITIONS,
	resolveLine,
	type Line,
	type LineInput,
	type LineResult,
	type Position,
	type ScorecardFormat,
	type SetGames,
	type Side
} from './format';

// Reads and writes under the caller's RLS. Staff see every card; a coach's write to a final card
// matches no row, which is how `scorecard_final` is detected. The eight lines exist from the
// insert (0010's trigger), so saving is always an update.

export type ScorecardsDb = Pick<SupabaseClient<Database>, 'from'>;
export type ScorecardStatus = 'draft' | 'final';

export type Scorecard = CardHeader & {
	id: string;
	teamId: string;
	teamName: string;
	sessionId: string | null;
	status: ScorecardStatus;
	finalizedAt: string | null;
	createdAt: string;
};

type CardRow = {
	id: string;
	team_id: string;
	session_id: string | null;
	match_id: string | null;
	played_on: string;
	start_time: string | null;
	division: string;
	home_team: string;
	away_team: string;
	location: string;
	momentum_side: Side;
	format: ScorecardFormat;
	set_games: number;
	status: ScorecardStatus;
	home_sportsmanship: string | null;
	away_sportsmanship: string | null;
	notes: string | null;
	finalized_at: string | null;
	created_at: string;
	teams: { name: string } | null;
};
type LineRow = {
	id: string;
	position: string;
	home_player1_id: string | null;
	home_player1_name: string;
	home_player2_id: string | null;
	home_player2_name: string;
	away_player1_id: string | null;
	away_player1_name: string;
	away_player2_id: string | null;
	away_player2_name: string;
	home_games: number | null;
	away_games: number | null;
	result: LineResult | null;
	winner: Side | null;
};

const CARD_COLUMNS =
	'id, team_id, session_id, match_id, played_on, start_time, division, home_team, away_team, location, momentum_side, format, set_games, status, home_sportsmanship, away_sportsmanship, notes, finalized_at, created_at, teams ( name )';
const LINE_COLUMNS =
	'id, position, home_player1_id, home_player1_name, home_player2_id, home_player2_name, away_player1_id, away_player1_name, away_player2_id, away_player2_name, home_games, away_games, result, winner';

const toCard = (r: CardRow): Scorecard => ({
	id: r.id,
	teamId: r.team_id,
	teamName: r.teams?.name ?? '',
	sessionId: r.session_id,
	matchId: r.match_id,
	playedOn: r.played_on,
	startTime: r.start_time ? r.start_time.slice(0, 5) : null,
	division: r.division,
	homeTeam: r.home_team,
	awayTeam: r.away_team,
	location: r.location,
	momentumSide: r.momentum_side,
	format: r.format,
	setGames: r.set_games as SetGames,
	status: r.status,
	homeSportsmanship: r.home_sportsmanship ?? '',
	awaySportsmanship: r.away_sportsmanship ?? '',
	notes: r.notes ?? '',
	finalizedAt: r.finalized_at,
	createdAt: r.created_at
});

const toLine = (r: LineRow): Line | null =>
	isPosition(r.position)
		? {
				id: r.id,
				position: r.position,
				names: {
					home1: r.home_player1_name,
					home2: r.home_player2_name,
					away1: r.away_player1_name,
					away2: r.away_player2_name
				},
				playerIds: {
					home1: r.home_player1_id,
					home2: r.home_player2_id,
					away1: r.away_player1_id,
					away2: r.away_player2_id
				},
				homeGames: r.home_games,
				awayGames: r.away_games,
				result: r.result,
				winner: r.winner
			}
		: null;

export async function listScorecards(db: ScorecardsDb): Promise<Result<Scorecard[]>> {
	const { data, error } = await db
		.from('scorecards')
		.select(CARD_COLUMNS)
		.order('played_on', { ascending: false })
		.order('created_at', { ascending: false });
	if (error) return err(fromPostgres(error));
	return ok(((data ?? []) as unknown as CardRow[]).map(toCard));
}

export async function getScorecard(
	db: ScorecardsDb,
	id: string
): Promise<Result<{ card: Scorecard; lines: Line[] } | null>> {
	const { data, error } = await db.from('scorecards').select(CARD_COLUMNS).eq('id', id).maybeSingle();
	if (error) return err(fromPostgres(error));
	if (!data) return ok(null);
	const card = toCard(data as unknown as CardRow);
	const rows = await db.from('scorecard_lines').select(LINE_COLUMNS).eq('scorecard_id', id);
	if (rows.error) return err(fromPostgres(rows.error));
	const byPosition = new Map<Position, Line>();
	for (const r of (rows.data ?? []) as unknown as LineRow[]) {
		const l = toLine(r);
		if (l) byPosition.set(l.position, l);
	}
	return ok({ card, lines: orderedPositions(card.format).flatMap((p) => byPosition.get(p) ?? []) });
}

const headerRow = (input: CardInput) => ({
	match_id: input.matchId || null,
	played_on: input.playedOn,
	start_time: input.startTime || null,
	division: input.division,
	home_team: input.homeTeam,
	away_team: input.awayTeam,
	location: input.location,
	momentum_side: input.momentumSide,
	format: input.format,
	set_games: Number(input.setGames),
	home_sportsmanship: input.homeSportsmanship || null,
	away_sportsmanship: input.awaySportsmanship || null,
	notes: input.notes || null
});

/** The insert policy wants `created_by = auth.uid()`; the trigger seeds the eight lines. */
export async function createScorecard(
	db: ScorecardsDb,
	input: HeaderInput,
	createdBy: string
): Promise<Result<{ id: string }>> {
	const { data, error } = await db
		.from('scorecards')
		.insert({
			...headerRow(input),
			team_id: input.teamId,
			session_id: input.sessionId || null,
			created_by: createdBy
		})
		.select('id')
		.single();
	if (error) return err(fromPostgres(error));
	return ok({ id: (data as { id: string }).id });
}

export type RosterName = { playerId: string; fullName: string };
const fold = (s: string) =>
	s
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.toLowerCase()
		.replace(/\s+/g, ' ')
		.trim();

/** A typed name links to a roster player only when exactly one full name matches, ignoring case and accents. */
export function linkRoster(name: string, roster: RosterName[]): string | null {
	const key = fold(name);
	if (!key) return null;
	const hits = roster.filter((r) => fold(r.fullName) === key);
	return hits.length === 1 ? hits[0].playerId : null;
}

/**
 * The header and all eight lines, one update each. A draft needs no transaction — finalize is the
 * atomic gate — and the header goes first: when it matches no row the card is final and nothing
 * else is touched.
 */
export async function saveCard(
	db: ScorecardsDb,
	id: string,
	header: CardInput,
	lines: Record<Position, LineInput>,
	roster: RosterName[]
): Promise<Result<null>> {
	const head = await db
		.from('scorecards')
		.update(headerRow(header))
		.eq('id', id)
		.eq('status', 'draft')
		.select('id');
	if (head.error) return err(fromPostgres(head.error));
	if (!head.data?.length) return err(new AppError('scorecard_final'));
	const setGames = Number(header.setGames) as SetGames;
	const link = (side: Side, name: string) =>
		side === header.momentumSide ? linkRoster(name, roster) : null;
	for (const p of POSITIONS) {
		const l = lines[p];
		const r = resolveLine(l, setGames);
		const { error } = await db
			.from('scorecard_lines')
			.update({
				home_player1_name: l.names.home1,
				home_player1_id: link('home', l.names.home1),
				home_player2_name: l.names.home2,
				home_player2_id: link('home', l.names.home2),
				away_player1_name: l.names.away1,
				away_player1_id: link('away', l.names.away1),
				away_player2_name: l.names.away2,
				away_player2_id: link('away', l.names.away2),
				home_games: r.homeGames,
				away_games: r.awayGames,
				result: r.result,
				winner: r.winner
			})
			.eq('scorecard_id', id)
			.eq('position', p);
		if (error) return err(fromPostgres(error));
	}
	return ok(null);
}

/** Draft → final. The trigger refuses an incomplete card with `scorecard_incomplete: <detail>`. */
export async function finalize(db: ScorecardsDb, id: string): Promise<Result<null>> {
	const { data, error } = await db
		.from('scorecards')
		.update({ status: 'final' })
		.eq('id', id)
		.eq('status', 'draft')
		.select('id');
	if (error) return err(fromPostgres(error));
	if (!data?.length) return err(new AppError('scorecard_final'));
	return ok(null);
}

/** Final → draft. RLS lets only an admin touch a final card, so a coach matches no row. */
export async function reopen(db: ScorecardsDb, id: string): Promise<Result<null>> {
	const { data, error } = await db
		.from('scorecards')
		.update({ status: 'draft' })
		.eq('id', id)
		.eq('status', 'final')
		.select('id');
	if (error) return err(fromPostgres(error));
	if (!data?.length) return err(new AppError('admin_only'));
	return ok(null);
}

/** Only an admin, only a draft (the delete policy); lines cascade. */
export async function deleteDraft(db: ScorecardsDb, id: string): Promise<Result<null>> {
	const { data, error } = await db
		.from('scorecards')
		.delete()
		.eq('id', id)
		.eq('status', 'draft')
		.select('id');
	if (error) return err(fromPostgres(error));
	if (!data?.length) return err(new AppError('admin_only'));
	return ok(null);
}

export type MatchOption = {
	sessionId: string;
	label: string;
	playedOn: string;
	startTime: string;
	opponent: string;
	homeAway: Side | null;
	location: string;
};
type MatchRow = {
	session_id: string;
	opponent: string | null;
	home_away: Side | null;
	sessions: {
		starts_at: string;
		status: string;
		venue_note: string | null;
		courts: { name: string; locations: { name: string } | null } | null;
	} | null;
};

/** A team's scheduled matches, newest first, in academy time — the prefill on `new`. */
export async function teamMatches(
	db: ScorecardsDb,
	teamId: string,
	tz: string
): Promise<Result<MatchOption[]>> {
	const { data, error } = await db
		.from('team_sessions')
		.select(
			'session_id, opponent, home_away, sessions ( starts_at, status, venue_note, courts ( name, locations ( name ) ) )'
		)
		.eq('team_id', teamId)
		.eq('kind', 'match');
	if (error) return err(fromPostgres(error));
	const options = ((data ?? []) as unknown as MatchRow[])
		.filter((m) => m.sessions?.status === 'scheduled')
		.map((m) => {
			const s = m.sessions!;
			const playedOn = academyDate(s.starts_at, tz);
			const startTime = academyTime(s.starts_at, tz);
			const location = s.courts
				? [s.courts.name, s.courts.locations?.name].filter(Boolean).join(' · ')
				: (s.venue_note ?? '');
			const opponent = m.opponent ?? '';
			return {
				sessionId: m.session_id,
				playedOn,
				startTime,
				opponent,
				homeAway: m.home_away,
				location,
				label: `${playedOn} · ${startTime} · VS ${opponent.toUpperCase() || '?'} · ${(m.home_away ?? 'home').toUpperCase()}`
			};
		});
	return ok(options.sort((a, b) => b.playedOn.localeCompare(a.playedOn)));
}
```

- [ ] **Step 4: Run** → PASS (11 tests). `pnpm check` must also be clean: the `insert`/`update` objects are typed against the generated `Database`, so a column name typo fails here, not in production. **Step 5: Commit** — `git add src/lib/server/domain/scorecards && git commit -m "feat(scorecards): cards — list, read, create, save, finalize, reopen, delete, match prefill"`

### Task 7: The two composites — `NameField`, `ScoreField`

**Files:** Modify `src/lib/ds/index.ts`, `src/lib/ds/forms/FieldShell.svelte`, `src/lib/ds/core/Button.svelte`; create `src/lib/components/NameField.svelte`, `src/lib/components/ScoreField.svelte`; modify `src/lib/components/components.test.ts`, `src/routes/styleguide/+page.svelte`, `e2e/smoke.test.ts`.

- [ ] **Step 1: Failing tests.** Append to `components.test.ts` (add the two imports beside `PlayerSwitcher`):

```ts
import NameField from './NameField.svelte';
import ScoreField from './ScoreField.svelte';

describe('NameField — a typed name with the roster as suggestions', () => {
	it('labels the input, offers the roster as a datalist, and needs no JavaScript', () => {
		const out = html(NameField, {
			label: 'Player 1',
			name: '1S_home1',
			value: 'Ada',
			suggestions: ['Ada Lovelace', 'Grace Hopper']
		});
		expect(out).toMatch(/<label[^>]*for="([^"]+)"[^>]*>Player 1<\/label>/);
		expect(out).toContain('name="1S_home1"');
		expect(out).toContain('value="Ada"');
		expect(out).toMatch(/<datalist id="[^"]+-list">/);
		expect(out).toContain('<option value="Ada Lovelace">');
	});
	it('carries the dual-channel error', () => {
		const out = html(NameField, { label: 'Player 1', name: 'x', error: 'Too long' });
		expect(out).toContain('ERROR: Too long');
		expect(out).toContain('aria-invalid="true"');
	});
	it('omits the datalist when there is nothing to suggest', () => {
		expect(html(NameField, { label: 'Player 1', name: 'x' })).not.toContain('<datalist');
	});
});

describe('ScoreField — one games box', () => {
	it('is a one-digit numeric box bound to its name', () => {
		const out = html(ScoreField, { label: 'Games', name: '1S_hg', value: '6' });
		expect(out).toContain('inputmode="numeric"');
		expect(out).toContain('maxlength="1"');
		expect(out).toContain('name="1S_hg"');
		expect(out).toContain('value="6"');
	});
	it('renders disabled on a final card', () => {
		expect(html(ScoreField, { label: 'Games', name: 'x', disabled: true })).toContain('disabled');
	});
});
```

- [ ] **Step 2: Run** `pnpm vitest run src/lib/components/components.test.ts` → FAIL: cannot find module `./NameField.svelte`.
- [ ] **Step 3: Three small design-system edits.**
  - `src/lib/ds/index.ts`: after the `FormSection` export add `export { default as FieldShell } from './forms/FieldShell.svelte';` with the comment `// The shared form anatomy, for app composites that add a control the system lacks.`
  - `src/lib/ds/forms/FieldShell.svelte`: change the comment's last sentence from `Not exported from the barrel.` to `Exported from the barrel for app composites (src/lib/components) that add a control the system lacks.`
  - `src/lib/ds/core/Button.svelte`: in `type Props`, after `type?: 'button' | 'submit';` add `/** Submit to another action than the form's (a second submit in the same form) */ formaction?: string;`. It reaches the `<button>` through `...rest` already.
- [ ] **Step 4: Create `NameField.svelte`:**

```svelte
<script lang="ts">
	import { FieldShell } from '$lib/ds';

	/* A typed name with the roster as suggestions: a native datalist, so a match-day substitute
	   who is not on the roster can still be entered, and nothing needs JavaScript. The shared
	   anatomy comes from FieldShell; the box matches TextField's without the ball caret.
	   A composite until the design system exports a NameField (docs/design-handoffs). */
	let {
		label,
		help,
		error,
		name,
		value = '',
		suggestions = [],
		disabled = false,
		id
	}: {
		label: string;
		help?: string;
		error?: string;
		name: string;
		value?: string;
		suggestions?: string[];
		disabled?: boolean;
		id?: string;
	} = $props();
	const uid = $props.id();
	const fieldId = $derived(id ?? `mtn-${uid}`);
	const listId = $derived(`${fieldId}-list`);
</script>

<FieldShell id={fieldId} {label} {help} {error}>
	{#snippet children({ describedBy, invalid })}
		<input
			id={fieldId}
			{name}
			{value}
			{disabled}
			type="text"
			class="nf__input"
			class:nf__input--error={invalid}
			autocomplete="off"
			list={suggestions.length ? listId : undefined}
			aria-invalid={invalid || undefined}
			aria-describedby={describedBy}
		/>
		{#if suggestions.length}
			<datalist id={listId}>
				{#each suggestions as s (s)}<option value={s}></option>{/each}
			</datalist>
		{/if}
	{/snippet}
</FieldShell>

<style>
	.nf__input {
		width: 100%;
		box-sizing: border-box;
		height: var(--size-action);
		padding: 0 var(--space-3);
		background: var(--white);
		border: var(--hairline);
		border-radius: var(--radius-none);
		font-family: var(--font-sans);
		font-size: var(--size-body);
		color: var(--ink);
	}
	.nf__input:focus {
		outline: none;
		border-color: var(--court-500);
	}
	.nf__input--error {
		border-color: var(--state-error);
	}
	.nf__input[disabled] {
		opacity: 0.45;
	}
</style>
```

- [ ] **Step 5: Create `ScoreField.svelte`:**

```svelte
<script lang="ts">
	import { FieldShell } from '$lib/ds';

	/* One games box of a score line: a square mono digit, 0–7, the numeric keypad on a phone.
	   A composite until the design system exports a ScoreBox (docs/design-handoffs). */
	let {
		label,
		error,
		name,
		value = '',
		disabled = false,
		id
	}: {
		label: string;
		error?: string;
		name: string;
		value?: string;
		disabled?: boolean;
		id?: string;
	} = $props();
	const uid = $props.id();
	const fieldId = $derived(id ?? `mtsc-${uid}`);
</script>

<FieldShell id={fieldId} {label} {error}>
	{#snippet children({ describedBy, invalid })}
		<input
			id={fieldId}
			{name}
			{value}
			{disabled}
			type="text"
			inputmode="numeric"
			pattern="[0-7]"
			maxlength={1}
			class="sf__input"
			class:sf__input--error={invalid}
			autocomplete="off"
			aria-invalid={invalid || undefined}
			aria-describedby={describedBy}
		/>
	{/snippet}
</FieldShell>

<style>
	.sf__input {
		width: var(--size-action);
		height: var(--size-action);
		box-sizing: border-box;
		padding: 0;
		text-align: center;
		background: var(--white);
		border: var(--hairline);
		border-radius: var(--radius-none);
		font-family: var(--font-mono);
		font-size: var(--size-body-lg);
		color: var(--ink);
	}
	.sf__input:focus {
		outline: none;
		border-color: var(--court-500);
	}
	.sf__input--error {
		border-color: var(--state-error);
	}
	.sf__input[disabled] {
		opacity: 0.45;
	}
</style>
```

- [ ] **Step 6: Run** the test file → PASS (5 new tests). If `maxlength` renders as `maxlength="1"` under another spelling, match what the SSR output prints.
- [ ] **Step 7: Styleguide.** In `src/routes/styleguide/+page.svelte` add `import NameField from '$lib/components/NameField.svelte';` and `import ScoreField from '$lib/components/ScoreField.svelte';` after the `$lib/ds` import, and a section before `</main>`:

```svelte
	<section class="sg__block">
		<Eyebrow>Composites — scorecard fields</Eyebrow>
		<div class="sg__grid">
			<NameField
				label="Momentum player"
				name="demo_home1"
				suggestions={['Ada Lovelace', 'Grace Hopper', 'Alan Turing']}
				help="TYPE A NAME · THE ROSTER SUGGESTS"
			/>
			<ScoreField label="Home" name="demo_hg" value="6" />
			<ScoreField label="Away" name="demo_ag" value="4" error="0 to 7" />
		</div>
	</section>
```

  In `e2e/smoke.test.ts`, inside `styleguide renders every ported component group`, add at the end: `// phase 10: the scorecard composites` and `await expect(page.getByLabel('Momentum player')).toBeVisible();`.
- [ ] **Step 8: Gates** — `pnpm check` and `pnpm lint` clean. **Step 9: Commit** — `git add -A src/lib e2e/smoke.test.ts src/routes/styleguide && git commit -m "feat(components): NameField and ScoreField on the shared field anatomy"`

### Task 8: `/scorecard` redirect and the list page

**Files:** Create `src/routes/scorecard/+server.ts`, `src/routes/coach/scorecards/+page.server.ts`, `+page.svelte`, `src/routes/coach/scorecards/pages.test.ts`.

- [ ] **Step 1: Failing test.** Create `pages.test.ts` (the pattern of `src/routes/coach/coach-pages.test.ts`; the `new` and card pages join it in Tasks 9 and 10):

```ts
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/stores', async () => {
	const { readable } = await import('svelte/store');
	const page = readable({
		url: new URL('http://localhost/coach/scorecards'),
		params: {},
		route: { id: null },
		status: 200,
		error: null,
		data: {},
		form: null,
		state: {}
	});
	const navigating = readable(null);
	const updated = { subscribe: readable(false).subscribe, check: async () => false };
	return { page, navigating, updated, getStores: () => ({ page, navigating, updated }) };
});
vi.mock('$app/state', () => ({
	page: { url: new URL('http://localhost/coach/scorecards'), params: {}, data: {}, form: null },
	navigating: {},
	updated: { current: false }
}));

const { default: List } = await import('./+page.svelte');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const html = (Component: any, data: any, form: any = null) =>
	render(Component, { props: { data, form } }).body;

describe('/coach/scorecards — the list', () => {
	it('lists cards with their status and links each to its page', () => {
		const out = html(List, {
			rows: [{ id: 'c1', on: '2026-10-04', team: 'Momentum Tennis 12U Green A', match: 'at Chippers', matchId: '2743978', status: 'DRAFT' }],
			loadError: null
		});
		expect(out).toContain('2743978');
		expect(out).toContain('at Chippers');
		expect(out).toMatch(/href="\/coach\/scorecards\/c1"/);
		expect(out).toMatch(/href="\/coach\/scorecards\/new"/);
	});
	it('says when there are none', () => {
		expect(html(List, { rows: [], loadError: null })).toContain('NO SCORECARDS YET');
	});
});
```

- [ ] **Step 2: Run** `pnpm vitest run src/routes/coach/scorecards/pages.test.ts` → FAIL: cannot find `./+page.svelte`.
- [ ] **Step 3: The redirect.** Create `src/routes/scorecard/+server.ts`:

```ts
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/** The short address a coach types on a phone. The target is guarded; this is not. */
export const GET: RequestHandler = () => {
	redirect(303, '/coach/scorecards');
};
```

- [ ] **Step 4: The list.** Create `src/routes/coach/scorecards/+page.server.ts`:

```ts
import { describeError } from '$lib/server/domain/result';
import { listScorecards } from '$lib/server/domain/scorecards/cards';
import type { PageServerLoad } from './$types';

// hooks.server.ts has already refused anyone who is not staff.

export const load: PageServerLoad = async ({ locals }) => {
	const cards = await listScorecards(locals.supabase);
	return {
		rows: (cards.ok ? cards.value : []).map((c) => ({
			id: c.id,
			on: c.playedOn,
			team: c.teamName,
			match: c.momentumSide === 'home' ? `vs ${c.awayTeam}` : `at ${c.homeTeam}`,
			matchId: c.matchId ?? '—',
			status: c.status.toUpperCase()
		})),
		loadError: cards.ok ? null : describeError(cards.error.code)
	};
};
```

  Create `+page.svelte`:

```svelte
<script lang="ts">
	import { resolve } from '$app/paths';
	import { Banner, Button, DataTable, Eyebrow, StatusChip } from '$lib/ds';

	let { data } = $props();
	const columns = [
		{ key: 'on', label: 'Date', mono: true },
		{ key: 'team', label: 'Team' },
		{ key: 'match', label: 'Match' },
		{ key: 'matchId', label: 'USTA id', mono: true },
		{ key: 'status', label: 'Status' }
	];
</script>

<svelte:head><title>Scorecards · Momentum Tennis</title></svelte:head>

<div class="scl">
	<div class="scl__bar">
		<Eyebrow ticks>Junior Team Tennis scorecards</Eyebrow>
		<Button href={resolve('/coach/scorecards/new')}>New scorecard</Button>
	</div>

	{#if data.loadError}<Banner tone="error">{data.loadError}</Banner>{/if}

	<DataTable
		{columns}
		rows={data.rows}
		empty="NO SCORECARDS YET"
		mobileTitleKey="match"
		rowHref={(row) => resolve('/coach/scorecards/[id]', { id: String(row.id) })}
	>
		{#snippet cell(row, column)}
			{#if column.key === 'status'}
				<StatusChip status={String(row.status)} />
			{:else if column.key === 'match'}
				<a class="scl__link" href={resolve('/coach/scorecards/[id]', { id: String(row.id) })}
					>{row.match}</a
				>
			{:else}
				{String(row[column.key] ?? '')}
			{/if}
		{/snippet}
	</DataTable>
</div>

<style>
	.scl {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}
	.scl__bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		flex-wrap: wrap;
	}
	.scl__link {
		color: var(--link);
	}
</style>
```

- [ ] **Step 5: Run** the test → PASS. `pnpm check` clean (the typed `resolve` needs `[id]/+page.svelte` to exist: create an empty placeholder `src/routes/coach/scorecards/[id]/+page.svelte` containing `<p>Card</p>` and `new/+page.svelte` containing `<p>New</p>` now; Tasks 9 and 10 replace them).
- [ ] **Step 6: Commit** — `git add src/routes && git commit -m "feat(scorecards): the list and the /scorecard address"`

### Task 9: `/coach/scorecards/new` — team, match, header

**Files:** Create `src/routes/coach/scorecards/new/+page.server.ts`; replace the placeholder `new/+page.svelte`; modify `pages.test.ts`.

Two GET steps, no JavaScript: pick the team; then, with `?team=`, pick a scheduled match or none and fill the header. `?session=` prefills the header from that match. POST `?/create` makes the card and lands on it.

- [ ] **Step 1: Failing tests.** In `pages.test.ts` add after the `List` import: `const { default: New } = await import('./new/+page.svelte');` and the imports `import { superValidate } from 'sveltekit-superforms'; import { zod4 } from 'sveltekit-superforms/adapters'; import { headerSchema } from '$lib/server/domain/scorecards/form';` at the top (after the mocks). Append:

```ts
describe('/coach/scorecards/new — two steps', () => {
	const teams = [{ value: 't1', label: 'Momentum Test 12U Green · Fall 2026' }];
	it('asks for the team first', async () => {
		const out = html(New, { teams, team: null, matches: [], sessionId: '', form: await superValidate(zod4(headerSchema)), loadError: null });
		expect(out).toContain('Momentum Test 12U Green · Fall 2026');
		expect(out).toContain('Choose team');
		expect(out).not.toContain('Create card');
	});
	it('then offers the scheduled matches and the header, prefilled', async () => {
		const form = await superValidate(
			{ teamId: 't1', sessionId: 's1', playedOn: '2026-10-04', startTime: '14:00', momentumSide: 'away', homeTeam: 'Chippers', awayTeam: 'Momentum Test 12U Green', location: 'Chippers home courts' },
			zod4(headerSchema),
			{ errors: false }
		);
		const out = html(New, {
			teams,
			team: { id: 't1', name: 'Momentum Test 12U Green' },
			matches: [{ value: 's1', label: '2026-10-04 · 14:00 · VS CHIPPERS · AWAY' }],
			sessionId: 's1',
			form,
			loadError: null
		});
		expect(out).toContain('VS CHIPPERS');
		expect(out).toContain('value="Chippers"');
		expect(out).toContain('value="2026-10-04"');
		expect(out).toContain('Create card');
		expect(out).toMatch(/name="teamId"[^>]*value="t1"|value="t1"[^>]*name="teamId"/);
	});
});
```

- [ ] **Step 2: Run** → FAIL: the placeholder page prints `New`.
- [ ] **Step 3: Server.** Create `new/+page.server.ts`:

```ts
import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { describeError } from '$lib/server/domain/result';
import { createScorecard, teamMatches } from '$lib/server/domain/scorecards/cards';
import { headerSchema } from '$lib/server/domain/scorecards/form';
import { listTeams } from '$lib/server/domain/schedule/teams';
import { getAcademySettings } from '$lib/server/domain/settings';
import { academyDate } from '$lib/server/domain/time';
import type { Actions, PageServerLoad } from './$types';

// Two GET steps, no JavaScript: the team, then the scheduled match (or none) and the header.

export const load: PageServerLoad = async ({ url, locals }) => {
	const [settings, teams] = await Promise.all([
		getAcademySettings(locals.supabase),
		listTeams(locals.supabase)
	]);
	const tz = settings.timezone;
	const all = teams.ok ? teams.value : [];
	const team = all.find((t) => t.id === url.searchParams.get('team')) ?? null;
	const matches = team ? await teamMatches(locals.supabase, team.id, tz) : null;
	const options = matches?.ok ? matches.value : [];
	const match = options.find((m) => m.sessionId === url.searchParams.get('session')) ?? null;
	const side = match?.homeAway ?? 'home';
	const initial = team
		? {
				teamId: team.id,
				sessionId: match?.sessionId ?? '',
				playedOn: match?.playedOn ?? academyDate(new Date(), tz),
				startTime: match?.startTime ?? '',
				momentumSide: side,
				homeTeam: side === 'home' ? team.name : (match?.opponent ?? ''),
				awayTeam: side === 'home' ? (match?.opponent ?? '') : team.name,
				location: match?.location ?? ''
			}
		: undefined;
	return {
		teams: all.map((t) => ({ value: t.id, label: `${t.name} · ${t.season}` })),
		team: team ? { id: team.id, name: team.name } : null,
		matches: options.map((m) => ({ value: m.sessionId, label: m.label })),
		sessionId: match?.sessionId ?? '',
		form: await superValidate(initial, zod4(headerSchema), { errors: false }),
		loadError: !teams.ok
			? describeError(teams.error.code)
			: matches && !matches.ok
				? describeError(matches.error.code)
				: null
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(headerSchema));
		if (!form.valid) return fail(400, { form });
		const made = await createScorecard(locals.supabase, form.data, locals.user!.id);
		if (!made.ok)
			return setError(
				form,
				'',
				made.error.code === 'conflict'
					? 'A card for that match or session already exists.'
					: describeError(made.error.code),
				{ status: 400 }
			);
		redirect(303, `/coach/scorecards/${made.value.id}`);
	}
};
```

- [ ] **Step 4: Page.** Replace `new/+page.svelte`:

```svelte
<script lang="ts">
	import { resolve } from '$app/paths';
	import { superForm } from 'sveltekit-superforms';
	import {
		Banner,
		Button,
		DateField,
		Eyebrow,
		FormSection,
		SegmentedControl,
		Select,
		TextField,
		TimeField
	} from '$lib/ds';

	let { data } = $props();
	// superforms takes the initial form value by design
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message } = superForm(data.form, { resetForm: false });
</script>

<svelte:head><title>New scorecard · Momentum Tennis</title></svelte:head>

<div class="scn">
	<div>
		<Eyebrow ticks>New scorecard</Eyebrow>
		<a class="scn__back" href={resolve('/coach/scorecards')}>All scorecards</a>
	</div>

	{#if data.loadError}<Banner tone="error">{data.loadError}</Banner>{/if}

	<form method="GET" class="scn__step">
		<Select label="Team" name="team" options={data.teams} placeholder="Choose a team" value={data.team?.id ?? ''} />
		<Button variant="secondary" size="sm" type="submit">Choose team</Button>
	</form>

	{#if data.team}
		<form method="GET" class="scn__step">
			<input type="hidden" name="team" value={data.team.id} />
			<Select
				label="Scheduled match"
				name="session"
				options={data.matches}
				placeholder="None — type the header"
				value={data.sessionId}
				help="PICKING ONE FILLS THE HEADER BELOW"
			/>
			<Button variant="secondary" size="sm" type="submit">Use this match</Button>
		</form>

		<form method="POST" action="?/create" use:enhance>
			<input type="hidden" name="teamId" value={$form.teamId} />
			<input type="hidden" name="sessionId" value={$form.sessionId} />
			<FormSection eyebrow="The card" description="What the paper card prints at the top. Everything can be changed on the card itself.">
				{#if $message}<Banner tone="error">{$message}</Banner>{/if}
				{#if $errors._errors?.[0]}<Banner tone="error">{$errors._errors[0]}</Banner>{/if}
				<div class="scn__grid">
					<SegmentedControl
						label="Format"
						name="format"
						options={[{ value: 'two_court', label: '2 COURTS' }, { value: 'three_court', label: '3 COURTS' }]}
						bind:value={$form.format}
					/>
					<SegmentedControl
						label="Set to"
						name="setGames"
						options={[{ value: '4', label: '4 GAMES' }, { value: '6', label: '6 GAMES' }]}
						bind:value={$form.setGames}
					/>
					<SegmentedControl
						label="Momentum is"
						name="momentumSide"
						options={[{ value: 'home', label: 'HOME' }, { value: 'away', label: 'VISITING' }]}
						bind:value={$form.momentumSide}
					/>
					<TextField label="USTA match id" name="matchId" inputmode="numeric" bind:value={$form.matchId} error={$errors.matchId?.[0]} help="FROM THE SCORECARD HEADER · NEEDED TO FINALIZE" ballCaret={false} />
					<DateField label="Date" name="playedOn" bind:value={$form.playedOn} error={$errors.playedOn?.[0]} />
					<TimeField label="Time" name="startTime" bind:value={$form.startTime} error={$errors.startTime?.[0]} />
					<TextField label="Division" name="division" bind:value={$form.division} error={$errors.division?.[0]} ballCaret={false} />
					<TextField label="Home team" name="homeTeam" bind:value={$form.homeTeam} error={$errors.homeTeam?.[0]} ballCaret={false} />
					<TextField label="Visiting team" name="awayTeam" bind:value={$form.awayTeam} error={$errors.awayTeam?.[0]} ballCaret={false} />
					<TextField label="Location" name="location" bind:value={$form.location} error={$errors.location?.[0]} ballCaret={false} />
				</div>
				<div><Button type="submit">Create card</Button></div>
			</FormSection>
		</form>
	{/if}
</div>

<style>
	.scn {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		max-width: 760px;
	}
	.scn__back {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--link);
		display: block;
		margin-top: var(--space-2);
	}
	.scn__step {
		display: flex;
		align-items: flex-end;
		gap: var(--space-3);
		flex-wrap: wrap;
	}
	.scn__grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
	}
	@media (max-width: 760px) {
		.scn__grid {
			grid-template-columns: 1fr;
		}
	}
</style>
```

  The three `SegmentedControl`s submit through their hidden `name` inputs; the superforms `bind:value` keeps them in step when JavaScript is on. `max-width: 760px` is the breakpoint literal the adherence rule allows.

- [ ] **Step 5: Run** the tests → PASS. `pnpm check` clean (if `superValidate(initial, …)` complains about the partial object, cast `initial` with `as Partial<HeaderInput>` and import the type from `form.ts`; if it refuses `undefined` data, branch: `initial ? superValidate(initial, zod4(headerSchema), { errors: false }) : superValidate(zod4(headerSchema))`).
- [ ] **Step 6: Commit** — `git add src/routes/coach/scorecards && git commit -m "feat(scorecards): new card — team, scheduled match, header"`

### Task 10: `/coach/scorecards/[id]` — the card, and its export

**Files:** Create `src/routes/coach/scorecards/[id]/+page.server.ts`, `[id]/export/+server.ts`; replace the placeholder `[id]/+page.svelte`; modify `pages.test.ts`.

One form carries the header and the eight lines. Save posts to `?/save`; Finalize is a second submit of the same form to `?/finalize`, which saves and then finalizes, so nothing typed is lost and the gate's own message comes back when something is missing. Reopen and Delete are admin forms of their own.

- [ ] **Step 1: Failing tests.** In `pages.test.ts` add `const { default: Card } = await import('./[id]/+page.svelte');` and append:

```ts
describe('/coach/scorecards/[id] — the card', () => {
	const fields = (over: Record<string, string> = {}) => ({
		matchId: '2743978',
		playedOn: '2026-10-04',
		startTime: '14:00',
		division: '12U Green',
		homeTeam: 'Chippers',
		awayTeam: 'Momentum Test 12U Green',
		location: '',
		momentumSide: 'away',
		format: 'three_court',
		setGames: '6',
		homeSportsmanship: '',
		awaySportsmanship: '',
		notes: '',
		'1S_home1': 'Theo B.',
		'1S_away1': 'Ada Lovelace',
		'1S_hg': '4',
		'1S_ag': '6',
		'1S_result': '',
		'1S_winner': '',
		...over
	});
	const data = (over: Record<string, unknown> = {}) => ({
		card: { id: 'c1', status: 'draft', matchId: '2743978', playedOn: '2026-10-04', teamName: 'Momentum Test 12U Green', title: 'Chippers vs Momentum Test 12U Green', finalizedOn: null },
		rounds: [
			{ round: 1, lines: [{ position: '1S', label: '#1 SINGLES', doubles: false }, { position: '4D', label: '#4 DOUBLES', doubles: true }] },
			{ round: 2, lines: [{ position: '3S', label: '#3 SINGLES', doubles: false }] }
		],
		fields: fields(),
		suggestions: ['Ada Lovelace', 'Grace Hopper'],
		totals: { home: 4, away: 6 },
		readiness: ['#4 DOUBLES · NO SCORE'],
		results: [{ value: 'completed', label: 'Completed' }, { value: 'timed', label: 'Timed match' }],
		isAdmin: false,
		loadError: null,
		...over
	});

	it('groups the lines by round, suggests the roster on Momentum’s side only, and shows readiness', () => {
		const out = html(Card, data());
		expect(out).toContain('ROUND 1');
		expect(out).toContain('#1 SINGLES');
		expect(out).toContain('value="Theo B."');
		expect(out).toContain('value="Ada Lovelace"');
		expect(out).toMatch(/name="1S_away1"[^>]*list=|list=[^>]*name="1S_away1"/);
		expect(out).not.toMatch(/name="1S_home1"[^>]*list=/);
		expect(out).toContain('name="4D_home2"');
		expect(out).not.toContain('name="1S_home2"');
		expect(out).toContain('GAMES WON · CHIPPERS 4 · MOMENTUM TEST 12U GREEN 6');
		expect(out).toContain('#4 DOUBLES · NO SCORE');
		expect(out).toContain('formaction="?/finalize"');
		expect(out).not.toContain('Export JSON');
	});
	it('renders a final card read-only with the export, and the reopen for an admin', () => {
		const out = html(Card, data({ card: { id: 'c1', status: 'final', matchId: '2743978', playedOn: '2026-10-04', teamName: 'Momentum Test 12U Green', title: 'Chippers vs Momentum Test 12U Green', finalizedOn: '2026-10-04' }, readiness: [], isAdmin: true }));
		expect(out).toMatch(/href="\/coach\/scorecards\/c1\/export"/);
		expect(out).toContain('action="?/reopen"');
		expect(out).not.toContain('formaction="?/finalize"');
		expect(out).toMatch(/name="1S_hg"[^>]*disabled/);
	});
	it('keeps a failed submission on screen with its errors', () => {
		const out = html(Card, data(), { fields: fields({ '1S_hg': '9' }), errors: { '1S_hg': '0 to 7' }, saveError: 'Check the highlighted fields.' });
		expect(out).toContain('value="9"');
		expect(out).toContain('ERROR: 0 to 7');
		expect(out).toContain('Check the highlighted fields.');
	});
});
```

- [ ] **Step 2: Run** → FAIL: the placeholder prints `Card`.
- [ ] **Step 3: Server.** Create `[id]/+page.server.ts`:

```ts
import { error, fail, redirect } from '@sveltejs/kit';
import { describeError } from '$lib/server/domain/result';
import {
	deleteDraft,
	finalize,
	getScorecard,
	reopen,
	saveCard,
	type RosterName
} from '$lib/server/domain/scorecards/cards';
import {
	fieldValues,
	parseHeader,
	parseLines,
	submittedFields
} from '$lib/server/domain/scorecards/form';
import {
	completeness,
	isDoubles,
	positionLabel,
	RESULT_LABELS,
	RESULTS,
	ROUNDS,
	totals
} from '$lib/server/domain/scorecards/format';
import { roster } from '$lib/server/domain/schedule/teams';
import type { Actions, PageServerLoad, RequestEvent } from './$types';

// hooks.server.ts has already refused anyone who is not staff. RLS decides the rest: a coach's
// write to a final card matches no row and comes back as `scorecard_final`.

async function cardAndRoster(event: Pick<RequestEvent, 'params' | 'locals'>) {
	const found = await getScorecard(event.locals.supabase, event.params.id);
	if (!found.ok) error(500, describeError(found.error.code));
	if (!found.value) error(404, 'No such scorecard');
	const names = await roster(event.locals.supabase, found.value.card.teamId);
	const members: RosterName[] = names.ok
		? names.value.map((m) => ({ playerId: m.playerId, fullName: m.fullName }))
		: [];
	return { ...found.value, members, rosterError: names.ok ? null : describeError(names.error.code) };
}

export const load: PageServerLoad = async (event) => {
	const { card, lines, members, rosterError } = await cardAndRoster(event);
	// The card prints home first whichever side Momentum is.
	const title = `${card.homeTeam} vs ${card.awayTeam}`;
	return {
		card: {
			id: card.id,
			status: card.status,
			matchId: card.matchId,
			playedOn: card.playedOn,
			teamName: card.teamName,
			title,
			finalizedOn: card.finalizedAt ? card.finalizedAt.slice(0, 10) : null
		},
		rounds: ROUNDS[card.format].map((positions, i) => ({
			round: i + 1,
			lines: positions.map((p) => ({
				position: p,
				label: positionLabel(p).toUpperCase(),
				doubles: isDoubles(p)
			}))
		})),
		fields: fieldValues(card, lines),
		suggestions: [...new Set(members.map((m) => m.fullName))].sort(),
		totals: totals(lines),
		readiness: completeness(card, lines),
		results: RESULTS.map((r) => ({ value: r, label: RESULT_LABELS[r] })),
		isAdmin: event.locals.roles.isAdmin,
		loadError: rosterError
	};
};

/** Parse and save the whole form. Returns the `fail` to send back, or null when saved. */
async function save(event: RequestEvent, data: FormData) {
	const header = parseHeader(data);
	const lines = parseLines(data);
	const errors = { ...header.errors, ...lines.errors };
	const fields = submittedFields(data);
	if (!header.value || Object.keys(errors).length)
		return fail(400, { fields, errors, saveError: describeError('validation') });
	const { members } = await cardAndRoster(event);
	const saved = await saveCard(event.locals.supabase, event.params.id, header.value, lines.lines, members);
	if (!saved.ok) return fail(400, { fields, errors: {}, saveError: describeError(saved.error.code) });
	return null;
}

export const actions: Actions = {
	save: async (event) => {
		const failed = await save(event, await event.request.formData());
		return failed ?? { saved: true };
	},

	// Save first, so what the coach sees is what the gate judges; then the trigger decides.
	finalize: async (event) => {
		const failed = await save(event, await event.request.formData());
		if (failed) return failed;
		const done = await finalize(event.locals.supabase, event.params.id);
		if (!done.ok)
			return fail(400, {
				finalizeError: [describeError(done.error.code), done.error.detail?.toUpperCase()]
					.filter(Boolean)
					.join(' ')
			});
		return { finalized: true };
	},

	reopen: async ({ params, locals }) => {
		const done = await reopen(locals.supabase, params.id);
		if (!done.ok) return fail(400, { actionError: describeError(done.error.code) });
		return { reopened: true };
	},

	delete: async ({ params, locals }) => {
		const done = await deleteDraft(locals.supabase, params.id);
		if (!done.ok) return fail(400, { actionError: describeError(done.error.code) });
		redirect(303, '/coach/scorecards');
	}
};
```

- [ ] **Step 4: Export.** Create `[id]/export/+server.ts`:

```ts
import { error, json } from '@sveltejs/kit';
import { describeError } from '$lib/server/domain/result';
import { getScorecard } from '$lib/server/domain/scorecards/cards';
import { exportFilename, observedCard } from '$lib/server/domain/scorecards/export';
import type { RequestHandler } from './$types';

/** The observed card the TennisLink automation imports. Final cards only. */
export const GET: RequestHandler = async ({ params, locals }) => {
	const found = await getScorecard(locals.supabase, params.id);
	if (!found.ok) error(500, describeError(found.error.code));
	if (!found.value) error(404, 'No such scorecard');
	const { card, lines } = found.value;
	if (card.status !== 'final') error(409, 'Only a final card exports');
	return json(observedCard(card, lines, new Date().toISOString()), {
		headers: { 'content-disposition': `attachment; filename="${exportFilename(card)}"` }
	});
};
```

- [ ] **Step 5: Page.** Replace `[id]/+page.svelte`:

```svelte
<script lang="ts">
	import { resolve } from '$app/paths';
	import NameField from '$lib/components/NameField.svelte';
	import ScoreField from '$lib/components/ScoreField.svelte';
	import {
		Banner,
		Button,
		DateField,
		Dialog,
		Eyebrow,
		FormSection,
		SegmentedControl,
		Select,
		StatusChip,
		TextArea,
		TextField,
		TimeField
	} from '$lib/ds';

	let { data, form } = $props();
	let deleting = $state(false);

	const fields = $derived(form?.fields ?? data.fields);
	const errors = $derived((form?.errors ?? {}) as Record<string, string | undefined>);
	const v = (k: string) => fields[k] ?? '';
	const final = $derived(data.card.status === 'final');
	const sides = ['home', 'away'] as const;
	const teamName = (side: 'home' | 'away') =>
		(side === 'home' ? v('homeTeam') : v('awayTeam')) || side.toUpperCase();
	const ours = (side: 'home' | 'away') => side === v('momentumSide');
	const resultOptions = $derived([{ value: '', label: 'From score' }, ...data.results]);
	const winnerOptions = $derived([
		{ value: '', label: 'From score' },
		{ value: 'home', label: teamName('home') },
		{ value: 'away', label: teamName('away') }
	]);
</script>

<svelte:head><title>{data.card.title} · Scorecards · Momentum Tennis</title></svelte:head>

<div class="sc">
	<div>
		<Eyebrow ticks>{data.card.playedOn} · {data.card.teamName}</Eyebrow>
		<h2 class="sc__title">{data.card.title}</h2>
		<a class="sc__back" href={resolve('/coach/scorecards')}>All scorecards</a>
	</div>

	<div class="sc__top">
		<StatusChip status={data.card.status.toUpperCase()} />
		{#if data.card.matchId}<span class="sc__mono">USTA {data.card.matchId}</span>{/if}
		{#if data.card.finalizedOn}<span class="sc__mono">FINAL · {data.card.finalizedOn}</span>{/if}
	</div>

	{#if data.loadError}<Banner tone="error">{data.loadError}</Banner>{/if}
	{#if form?.saveError}<Banner tone="error">{form.saveError}</Banner>{/if}
	{#if form?.finalizeError}<Banner tone="error">{form.finalizeError}</Banner>{/if}
	{#if form?.actionError}<Banner tone="error">{form.actionError}</Banner>{/if}
	{#if form?.saved}<Banner>SAVED</Banner>{/if}
	{#if form?.finalized}<Banner>FINAL · READY TO EXPORT</Banner>{/if}
	{#if form?.reopened}<Banner>REOPENED · DRAFT</Banner>{/if}

	<form method="POST" action="?/save" class="sc__form">
		<FormSection eyebrow="Match" description="What the card prints at the top.">
			<div class="sc__grid">
				<SegmentedControl
					label="Format"
					name="format"
					options={[{ value: 'two_court', label: '2 COURTS' }, { value: 'three_court', label: '3 COURTS' }]}
					value={v('format')}
					disabled={final}
				/>
				<SegmentedControl
					label="Set to"
					name="setGames"
					options={[{ value: '4', label: '4 GAMES' }, { value: '6', label: '6 GAMES' }]}
					value={v('setGames')}
					disabled={final}
				/>
				<SegmentedControl
					label="Momentum is"
					name="momentumSide"
					options={[{ value: 'home', label: 'HOME' }, { value: 'away', label: 'VISITING' }]}
					value={v('momentumSide')}
					disabled={final}
				/>
				<TextField label="USTA match id" name="matchId" inputmode="numeric" value={v('matchId')} error={errors.matchId} disabled={final} ballCaret={false} />
				<DateField label="Date" name="playedOn" value={v('playedOn')} error={errors.playedOn} disabled={final} />
				<TimeField label="Time" name="startTime" value={v('startTime')} error={errors.startTime} disabled={final} />
				<TextField label="Division" name="division" value={v('division')} error={errors.division} disabled={final} ballCaret={false} />
				<TextField label="Home team" name="homeTeam" value={v('homeTeam')} error={errors.homeTeam} disabled={final} ballCaret={false} />
				<TextField label="Visiting team" name="awayTeam" value={v('awayTeam')} error={errors.awayTeam} disabled={final} ballCaret={false} />
				<TextField label="Location" name="location" value={v('location')} error={errors.location} disabled={final} ballCaret={false} />
			</div>
		</FormSection>

		{#each data.rounds as round (round.round)}
			<FormSection eyebrow="Round {round.round}">
				{#each round.lines as line (line.position)}
					<fieldset class="sc__line">
						<legend class="sc__pos">{line.label}</legend>
						{#each sides as side (side)}
							<div class="sc__side">
								<span class="sc__team">{teamName(side)}{ours(side) ? ' · MOMENTUM' : ''}</span>
								<NameField
									label="Player 1"
									name="{line.position}_{side}1"
									value={v(`${line.position}_${side}1`)}
									error={errors[`${line.position}_${side}1`]}
									suggestions={ours(side) ? data.suggestions : []}
									disabled={final}
								/>
								{#if line.doubles}
									<NameField
										label="Player 2"
										name="{line.position}_{side}2"
										value={v(`${line.position}_${side}2`)}
										error={errors[`${line.position}_${side}2`]}
										suggestions={ours(side) ? data.suggestions : []}
										disabled={final}
									/>
								{/if}
								<ScoreField
									label="Games"
									name="{line.position}_{side === 'home' ? 'hg' : 'ag'}"
									value={v(`${line.position}_${side === 'home' ? 'hg' : 'ag'}`)}
									error={errors[`${line.position}_${side === 'home' ? 'hg' : 'ag'}`]}
									disabled={final}
								/>
							</div>
						{/each}
						<div class="sc__result">
							<Select label="Result" name="{line.position}_result" options={resultOptions} value={v(`${line.position}_result`)} error={errors[`${line.position}_result`]} disabled={final} />
							<Select label="Winner" name="{line.position}_winner" options={winnerOptions} value={v(`${line.position}_winner`)} error={errors[`${line.position}_winner`]} disabled={final} />
						</div>
					</fieldset>
				{/each}
			</FormSection>
		{/each}

		<FormSection eyebrow="Sportsmanship and notes">
			<div class="sc__grid">
				<TextField label="Home nominee" name="homeSportsmanship" value={v('homeSportsmanship')} error={errors.homeSportsmanship} disabled={final} ballCaret={false} />
				<TextField label="Visiting nominee" name="awaySportsmanship" value={v('awaySportsmanship')} error={errors.awaySportsmanship} disabled={final} ballCaret={false} />
			</div>
			<TextArea label="Notes" name="notes" rows={2} value={v('notes')} disabled={final} />
		</FormSection>

		<p class="sc__totals">
			GAMES WON · {teamName('home').toUpperCase()} {data.totals.home} · {teamName('away').toUpperCase()} {data.totals.away}
		</p>

		{#if !final}
			<ul class="sc__ready" aria-label="Before finalizing">
				{#if data.readiness.length === 0}<li>READY TO FINALIZE</li>{/if}
				{#each data.readiness as r (r)}<li>{r}</li>{/each}
			</ul>
			<div class="sc__actions">
				<Button type="submit" variant="secondary">Save</Button>
				<Button type="submit" formaction="?/finalize">Finalize</Button>
				{#if data.isAdmin}
					<Button type="button" variant="ghost" onclick={() => (deleting = true)}>Delete draft</Button>
				{/if}
			</div>
			<p class="sc__note">FINALIZING SAVES THE CARD AND LOCKS IT · ONLY AN ADMINISTRATOR CAN REOPEN IT</p>
		{/if}
	</form>

	{#if final}
		<div class="sc__actions">
			<Button href={resolve('/coach/scorecards/[id]/export', { id: data.card.id })}>Export JSON</Button>
			{#if data.isAdmin}
				<form method="POST" action="?/reopen">
					<Button type="submit" variant="secondary">Reopen</Button>
				</form>
			{/if}
		</div>
	{/if}
</div>

<Dialog bind:open={deleting} title="Delete this draft" consequence="THE CARD AND ITS EIGHT LINES ARE REMOVED">
	<p class="sc__body">A draft nobody needs. A final card cannot be deleted; reopen it first.</p>
	{#snippet actions()}
		<Button variant="ghost" onclick={() => (deleting = false)}>Keep it</Button>
		<form method="POST" action="?/delete">
			<Button type="submit" variant="secondary">Delete draft</Button>
		</form>
	{/snippet}
</Dialog>

<style>
	.sc {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		max-width: 760px;
	}
	.sc__title {
		margin: var(--space-2) 0;
		font-size: var(--size-h4);
	}
	.sc__back,
	.sc__mono,
	.sc__pos,
	.sc__team,
	.sc__totals,
	.sc__ready,
	.sc__note {
		font-family: var(--font-mono);
		font-size: var(--size-label-sm);
		letter-spacing: 0.07em;
		text-transform: uppercase;
	}
	.sc__back {
		color: var(--link);
		display: block;
		margin-top: var(--space-2);
	}
	.sc__mono,
	.sc__team,
	.sc__ready,
	.sc__note {
		color: var(--text-secondary);
	}
	.sc__top {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		flex-wrap: wrap;
	}
	.sc__form {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}
	.sc__grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
	}
	.sc__line {
		margin: 0;
		padding: var(--space-4) 0;
		border: 0;
		border-top: var(--hairline);
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
	}
	.sc__pos {
		padding: 0;
		color: var(--ink);
		font-weight: var(--weight-bold);
	}
	.sc__side {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
	.sc__result {
		grid-column: 1 / -1;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
	}
	.sc__totals {
		margin: 0;
		color: var(--ink);
		border-top: var(--hairline);
		padding-top: var(--space-4);
	}
	.sc__ready {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
	.sc__note {
		margin: 0;
	}
	.sc__actions {
		display: flex;
		gap: var(--space-3);
		flex-wrap: wrap;
	}
	.sc__body {
		font-size: var(--size-body);
		color: var(--ink);
		margin: 0 0 var(--space-4);
	}
	@media (max-width: 760px) {
		.sc__grid,
		.sc__line,
		.sc__result {
			grid-template-columns: 1fr;
		}
	}
</style>
```

  Amber appears once: Finalize on a draft, Export on a final card. `TextArea` takes `value`; if the port only binds, use `bind:value` on a local `$state` seeded from `v('notes')`.

- [ ] **Step 6: Run** the page tests → PASS. `pnpm check` and `pnpm lint` clean.
- [ ] **Step 7: Commit** — `git add src/routes/coach/scorecards && git commit -m "feat(scorecards): the card — save, finalize through the gate, reopen, delete, export"`

### Task 11: The tabs

**Files:** Modify `src/routes/coach/+layout.svelte`, `src/routes/admin/+layout.svelte`, `src/routes/coach/coach-pages.test.ts`.

- [ ] **Step 1: Coach shell.** In `src/routes/coach/+layout.svelte` the `tabs` array becomes:

```ts
	const tabs = [
		{ id: '/coach/sessions', label: 'Sessions', href: '/coach/sessions' },
		{ id: '/coach/scorecards', label: 'Scorecards', href: '/coach/scorecards' }
	];
```

- [ ] **Step 2: Admin shell.** In `src/routes/admin/+layout.svelte` add after the `Teams` tab: `{ id: '/coach/scorecards', label: 'Scorecards', href: '/coach/scorecards' },` — an admin passes the `/coach` guard, and the active-tab derivation simply never matches it from `/admin`.
- [ ] **Step 3: Check** `pnpm check` and `pnpm test` stay green (the layout tests, if any, assert the tab list — update the expectation to include `Scorecards`). **Step 4: Commit** — `git commit -am "feat(scorecards): a Scorecards tab in the coach and admin shells"`

### Task 12: The coach login and a fictional team on dev

**Files:** The seed script in the scratchpad (not committed); modify `.env.example`.

The Supabase connector in this session belongs to another account; this runs against the dev project with `PUBLIC_SUPABASE_URL` from `.env.development` and `SUPABASE_SECRET_KEY` from `.env.local`. The password is generated and appended to `.env.local`; it is never printed.

- [ ] **Step 1: The script.** Write `$SCRATCH/seed-coach.mjs` (`$SCRATCH` is this session's scratchpad directory):

```js
// One-off, dev only: a confirmed coach login and a fictional team with a roster, so the scorecard
// page has names to suggest. Run from the repo root so the import resolves from its node_modules:
//   node --env-file=.env.development --env-file=.env.local --input-type=module < $SCRATCH/seed-coach.mjs
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import { appendFileSync } from 'node:fs';

const url = process.env.PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) throw new Error('PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required');
if (!/rjiagjfvsaaxezsxfuzq/.test(url)) throw new Error(`Refusing: ${url} is not the dev project`);
const admin = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });

const email = process.env.COACH_EMAIL ?? 'pranayrs+coach@hotmail.com';
const password = randomBytes(18).toString('base64url');
const created = await admin.auth.admin.createUser({
	email,
	password,
	email_confirm: true,
	user_metadata: { full_name: 'Test Coach' }
});
if (created.error) throw new Error(`createUser: ${created.error.message}`);
const accountId = created.data.user.id;
// 0001's trigger copies only the email; phase 9 will fix that for everyone.
const named = await admin.from('accounts').update({ full_name: 'Test Coach' }).eq('id', accountId);
if (named.error) throw new Error(`accounts: ${named.error.message}`);
const role = await admin.from('staff_members').upsert({ account_id: accountId, role: 'coach' });
if (role.error) throw new Error(`staff_members: ${role.error.message}`);

const team = await admin
	.from('teams')
	.upsert(
		{ name: 'Momentum Test 12U Green', season: 'Fall 2026', description: 'Fictional roster for the scorecard page' },
		{ onConflict: 'name,season' }
	)
	.select('id')
	.single();
if (team.error) throw new Error(`teams: ${team.error.message}`);
const existing = await admin
	.from('team_members')
	.select('players ( full_name )')
	.eq('team_id', team.data.id);
const have = new Set((existing.data ?? []).map((m) => m.players?.full_name));
for (const full_name of ['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Edsger Dijkstra', 'Barbara Liskov', 'Donald Knuth']) {
	if (have.has(full_name)) continue;
	const player = await admin.from('players').insert({ full_name, birthdate: '2015-03-01' }).select('id').single();
	if (player.error) throw new Error(`players: ${player.error.message}`);
	const member = await admin.from('team_members').insert({ team_id: team.data.id, player_id: player.data.id });
	if (member.error) throw new Error(`team_members: ${member.error.message}`);
}

appendFileSync('.env.local', `\n# phase 10 — the dev coach for /coach/scorecards and e2e/coach-scorecard.test.ts\nE2E_COACH_EMAIL=${email}\nE2E_COACH_PASSWORD=${password}\n`);
console.log(`coach ${email} created and granted; team seeded; password appended to .env.local`);
```

- [ ] **Step 2: Run it** from the repo root with the command in its header. Expected: the one `console.log` line. If `createUser` says the email exists, the login was made before: pick another with `COACH_EMAIL=… node …`, or delete the user in the dashboard first.
- [ ] **Step 3: `.env.example`.** Under `# ── operator-only` add:

```
E2E_ADMIN_EMAIL=                 # Playwright: the dev admin (credentialed specs)
E2E_ADMIN_PASSWORD=
E2E_COACH_EMAIL=                 # Playwright: the dev coach (phase 10) — made by the seed script in the phase-10 plan
E2E_COACH_PASSWORD=
```

- [ ] **Step 4: Prove it** — `pnpm env:check` still passes; then log in on the dev site as the coach (the email and password are in `.env.local`) and open `/scorecard`: it lands on `/coach/scorecards`. **Step 5: Commit** — `git commit -am "docs(env): the e2e admin and coach names"`

### Task 13: The coach's walk, end to end

**Files:** Create `e2e/coach-scorecard.test.ts`.

- [ ] **Step 1: The spec.** It needs the coach login and the fictional team from Task 12 on dev, and skips without the credentials, as the other credentialed specs do. Each run leaves one final card behind with a stamped match id; Artur can reopen and delete them from the list.

```ts
import { expect, test } from '@playwright/test';

// Phase 10's exit criterion end to end: a coach records a match on a phone-sized window, the gate
// refuses the card until every line is complete, and a final card exports the observed-card JSON.
//
// Needs the dev coach and the fictional team the phase-10 seed script makes (docs/OPERATIONS.md
// §7). Without the credentials the spec skips rather than failing CI.
const EMAIL = process.env.E2E_COACH_EMAIL;
const PASSWORD = process.env.E2E_COACH_PASSWORD;
const stamp = Date.now();
const SINGLES = ['#1 SINGLES', '#2 SINGLES', '#3 SINGLES', '#4 SINGLES'];
const DOUBLES = ['#1 DOUBLES', '#2 DOUBLES', '#3 DOUBLES', '#4 DOUBLES'];

test.describe('a coach records a match', () => {
	test.skip(!EMAIL || !PASSWORD, 'Set E2E_COACH_EMAIL and E2E_COACH_PASSWORD to run this against dev');
	test.setTimeout(120_000);
	test.use({ viewport: { width: 390, height: 844 } });

	test('new card → lines → the gate → finalize → export', async ({ page }) => {
		await page.goto('/scorecard');
		await expect(page).toHaveURL(/\/login\?next=%2Fcoach%2Fscorecards/);
		await page.getByLabel('Email').fill(EMAIL!);
		await page.getByLabel('Password').fill(PASSWORD!);
		await page.getByRole('button', { name: 'Log in' }).click();
		await expect(page).toHaveURL(/\/coach\/scorecards$/);

		await page.getByRole('link', { name: 'New scorecard' }).click();
		await page.getByLabel('Team').selectOption({ label: /Momentum Test 12U Green/ });
		await page.getByRole('button', { name: 'Choose team' }).click();
		await expect(page.getByRole('button', { name: 'Create card' })).toBeVisible();
		const matchId = String(9_000_000 + (stamp % 1_000_000));
		await page.getByLabel('USTA match id').fill(matchId);
		await page.getByLabel('Visiting team').fill(`E2E Visitors ${stamp}`);
		await page.getByRole('button', { name: 'Create card' }).click();
		await expect(page).toHaveURL(/\/coach\/scorecards\/[0-9a-f-]{36}$/);

		// One line, then the gate refuses: seven lines have no score yet.
		const line1 = page.getByRole('group', { name: '#1 SINGLES' });
		await line1.getByLabel('Player 1').nth(0).fill('Ada Lovelace');
		await line1.getByLabel('Player 1').nth(1).fill('Theo B.');
		await line1.getByLabel('Games').nth(0).fill('6');
		await line1.getByLabel('Games').nth(1).fill('2');
		await page.getByRole('button', { name: 'Finalize' }).click();
		await expect(page.getByText(/cannot be finalized yet/)).toBeVisible();
		await expect(page.getByText('#2 SINGLES · NO SCORE')).toBeVisible();

		// The rest of the card: our side wins every line.
		for (const name of SINGLES.slice(1)) {
			const g = page.getByRole('group', { name });
			await g.getByLabel('Player 1').nth(0).fill('Grace Hopper');
			await g.getByLabel('Player 1').nth(1).fill('Kai V.');
			await g.getByLabel('Games').nth(0).fill('6');
			await g.getByLabel('Games').nth(1).fill('3');
		}
		for (const name of DOUBLES) {
			const g = page.getByRole('group', { name });
			await g.getByLabel('Player 1').nth(0).fill('Alan Turing');
			await g.getByLabel('Player 2').nth(0).fill('Barbara Liskov');
			await g.getByLabel('Player 1').nth(1).fill('Wren W.');
			await g.getByLabel('Player 2').nth(1).fill('Vera V.');
			await g.getByLabel('Games').nth(0).fill('6');
			await g.getByLabel('Games').nth(1).fill('1');
		}
		await page.getByRole('button', { name: 'Save' }).click();
		await expect(page.getByText('SAVED')).toBeVisible();
		await expect(page.getByText('READY TO FINALIZE')).toBeVisible();

		await page.getByRole('button', { name: 'Finalize' }).click();
		await expect(page.getByText('FINAL · READY TO EXPORT')).toBeVisible();
		await expect(page.getByLabel('USTA match id')).toBeDisabled();

		const download = page.waitForEvent('download');
		await page.getByRole('link', { name: 'Export JSON' }).click();
		const file = await download;
		expect(file.suggestedFilename()).toBe(`scorecard-${matchId}.json`);
		const body = JSON.parse(await (await file.createReadStream()).toArray().then((c) => Buffer.concat(c).toString()));
		expect(body.card.match_id).toBe(matchId);
		expect(body.card.lines).toHaveLength(8);
		expect(body.card.printed_home_total).toBe(48);
	});
});
```

  The home side is Momentum here (the `new` page defaults to HOME without a scheduled match), so `.nth(0)` is ours and the datalist is on it; `printed_home_total` is 6 + 6·3 + 6·4 = 48.

- [ ] **Step 2: Run** `E2E_COACH_EMAIL=… E2E_COACH_PASSWORD=… pnpm test:e2e e2e/coach-scorecard.test.ts` with the values from `.env.local` (export them in the shell; never paste them into a committed file) → 1 passed. Without them → 1 skipped.
- [ ] **Step 3: Commit** — `git add e2e && git commit -m "test(e2e): a coach records, finalizes and exports a match"`

### Task 14: The Claude Design handoff

**Files:** Create `docs/design-handoffs/2026-10-02-scorecard-components.md`.

The two composites are stand-ins. This document is pasted into a Claude Design session that holds the Momentum Tennis design system, and asks for the real components in the export's own convention, so a later export is ported verbatim and the composites retire. Fictional names only.

- [ ] **Step 1: Write the file:**

````markdown
# Handoff to Claude Design — JTT scorecard components

Paste everything below the rule into a Claude Design session that has the Momentum Tennis design
system loaded (`design-system/SKILL.md`). The platform already ships the scorecard page on two
app-level stand-ins (`NameField`, `ScoreField`); this asks for the real components so the next
export ports verbatim and the stand-ins retire.

---

You are extending the Momentum Tennis design system (Cupertino tennis academy; most players are
minors). Read `readme.md`, `PRODUCT.md` §11 and §14, `components/forms/` and `ui_kits/admin/coach.html`
first. Everything you make follows the system's laws without exception: tokens only (no raw hex, no
off-scale px); Chivo Black display, IBM Plex Sans body, IBM Plex Mono for every time, score, count,
status and reference, uppercase; caps ≤22px tracked 0.107em; one radius — the 48px action pill —
everything else square; flat, no shadows; amber is the present frame and the ONE primary CTA per
view; `--state-error` is the only state color, always dual-channel (color + a mono `ERROR:` line);
there is no success color (success is ink plus a mono confirmation line); no icons, no emoji, no
exclamation points; one breakpoint at 760px; 44px minimum targets; meaning never in color alone;
`prefers-reduced-motion` honored; SegmentedControl instead of radios and switches; statuses through
StatusChip; forms follow the shared anatomy (tracked-caps label, mono help, dual-channel error).

## What the surface is

A coach records a USTA Junior Team Tennis match on a phone, court-side, in the shape of the official
paper scorecard, then finalizes it. The paper card has eight lines — #1 to #4 Singles, #1 to #4
Doubles — each with the players on both sides and the games each side won in one short set (to 4 or
to 6 games). Two formats exist and differ only in which lines play together:

| format | round 1 | round 2 | round 3 | round 4 |
|---|---|---|---|---|
| 2 courts | 1S, 4D | 2S, 3D | 3S, 2D | 4S, 1D |
| 3 courts | 1S, 2S, 4D | 3S, 4S, 1D | 2D, 3D | — |

The card's header: USTA match id, date, time, division, home team, visiting team, location, format,
set length, and which side is Momentum (home or visiting). Momentum's players are typed with the
team roster as suggestions; opponents are typed names. Each line has a result (Completed, Timed
match, Retired, Default, Double default) that is derived from the score unless the coach chooses
one, and a winner, likewise. Under the lines: computed team totals (games won per side), a
sportsmanship nominee per team, notes. A card is a draft until the coach taps Finalize; the database
refuses to finalize an incomplete card and names what is missing (the page lists these before the
tap as mono readiness lines, e.g. `#4 DOUBLES · NO SCORE`). A final card is read-only and exports as
JSON; only an administrator reopens it.

Three states of one card to design: a proposed lineup before the match (names only, no scores); in
progress (some scores); final (read-only, the export action is the one amber control).

## Components wanted

Deliver each as the export convention does: `components/scorecard/<Name>.jsx` (reference
implementation, inline styles from tokens), `<Name>.d.ts` (the props contract — this is what the
port reproduces), `<Name>.prompt.md` (one-paragraph usage note with a JSX example), plus one
`components/scorecard/scorecard.card.html` specimen card, and a mobile coach-kit page
`ui_kits/admin/scorecard.html` at 390×844 showing the whole card in the three states. Register
them in the manifest as the compiler does; do not hand-edit `_ds_manifest.json` or
`_adherence.oxlintrc.json` — regenerate. Add the group to `readme.md` under "Intentional additions".

1. **`NameField`** — a text input with suggestions (native `<datalist>`; must work with JavaScript
   off), the shared form anatomy, no caret animation. Props: `label`, `help?`, `error?`, `name`,
   `value?`, `suggestions?: string[]`, `disabled?`. A free-typed name that is not a suggestion is
   normal, not an error (a match-day substitute).
2. **`ScoreBox`** — one games input: a 48px square, mono digit 0–7, numeric keypad on a phone
   (`inputmode="numeric"`), the anatomy's label above, dual-channel error. Props: `label`, `name`,
   `value?`, `error?`, `disabled?`. Also a display-only variant for the final state.
3. **`ScoreLine`** — one line of the card: the position tag in mono (`#1 SINGLES`), the two sides
   (team name as a column head; a mono `MOMENTUM` tag on ours), one or two `NameField`s per side,
   a `ScoreBox` per side, the result and winner selects (`Select`, first option `FROM SCORE`). Lays
   out side by side above 760px and stacked below. Props: `position: '1S'…'4D'`, `homeTeam`,
   `awayTeam`, `momentumSide: 'home' | 'away'`, `suggestions`, `values` (every field's string),
   `errors?`, `disabled?`, `resultOptions`, `name` prefix for the fields (`<position>_<slot>` with
   slots `home1 home2 away1 away2 hg ag result winner`).
4. **`RoundGroup`** — an eyebrow `ROUND N` over its `ScoreLine`s, hairline-ruled. Props: `round`,
   `children`.
5. **`CardHeader`** — the match facts as a mono block: status chip, `USTA 2743978`, date, time,
   division, both team names, location, format, set length; editable (the form controls:
   SegmentedControl for format, set length and Momentum's side; TextField, DateField, TimeField for
   the rest) and read-only variants. Props mirror the fields.
6. **`TotalsBar`** — `GAMES WON · CHIPPERS 23 · MOMENTUM TENNIS 12U GREEN A 36` in mono, computed,
   never typed; and the readiness list under it on a draft (mono lines; `READY TO FINALIZE` when
   empty). Props: `homeTeam`, `awayTeam`, `home`, `away`, `readiness: string[]`, `final`.
7. **`LineupSheet`** — the composition: `CardHeader`, the `RoundGroup`s for the chosen format, the
   sportsmanship and notes fields, `TotalsBar`, and the action row — Save (secondary pill), Finalize
   (the one primary pill on a draft) with a mono consequence line under it, Export JSON (the one
   primary on a final card), Reopen (secondary, admin), Delete draft (ghost, admin, confirmed in a
   `Dialog` with a mono consequence). Props: `format`, `state: 'lineup' | 'scoring' | 'final'`,
   `isAdmin`, and the data above.

Use fictional names in every specimen: Ada Lovelace, Grace Hopper, Alan Turing, Edsger Dijkstra,
Barbara Liskov, Donald Knuth for Momentum; Theo B., Kai V., Wren W., Vera V. for the opponents;
teams "Momentum Tennis 12U Green A" and "Chippers"; match id 2743978; division "12U Green". Never a
real player's name.

What I will do with it: port each `.jsx` against its `.d.ts` into `src/lib/ds/scorecard/` in the
SvelteKit app, values verbatim, inline styles swapped for classes, layouts reproduced; then replace
`src/lib/components/NameField.svelte` and `ScoreField.svelte` with the ports.
````

- [ ] **Step 2: Commit** — `git add docs/design-handoffs && git commit -m "docs(design): handoff for the scorecard components"`

### Task 15: Records, gates, the ritual

**Files:** Modify `docs/PLAN.md`, `AGENTS.md`, `docs/HANDOFF-opus5.md`, `docs/OPERATIONS.md`; create `docs/superpowers/plans/2026-10-02-phase-10-scorecards.checklist.md`.

- [ ] **Step 1: `docs/PLAN.md`.** After row 9 of the phase table add:

```
| 10 | JTT scorecards — **built 2026-10-0N** (`phase-10/scorecards`), runs before 9 | the coach's scorecard page for USTA Junior Team Tennis in the 2-court and 3-court shapes: migration 0010 (`scorecards`, eight `scorecard_lines` seeded by trigger, the finalize gate, staff-only RLS), the `scorecards/` domain module, `/coach/scorecards` (list, new, card) and `/scorecard`, the observed-card JSON export the TennisLink automation imports, `NameField` and `ScoreField` composites, the Claude Design handoff | 1, 3 | met in code: a coach records a match line by line, the database refuses to finalize an incomplete card and says which line, and a final card exports the automation's observed-card shape. N unit/contract tests, M schema checks |
```

  Replace `N` and `M` with the counts the gates print. In the decision log, before the 2026-10-01 entry, add:

```
- 2026-10-02 — Phase 10 built (branch `phase-10/scorecards`): migration 0010. Asked and answered
  (spec `docs/superpowers/specs/2026-10-02-scorecards-design.md`): the page exports the
  automation's observed-card JSON and the automation imports it (its JSON import is a follow-up in
  its own repository); scorecards land before phase 9, so 9, 6 and 7 are renumbered (0011/§17,
  §18, 0012/§19); any staff finalizes and only an admin reopens; opponents' names are stored as
  written, staff-only. Decided while building: columns are home/away as the paper card is, with
  `momentum_side` saying which is ours; the round of a line is derived from the format, never
  stored; a line's result is derived from the score unless chosen, and `FROM SCORE` shows whenever
  the stored value is the derived one; Finalize is a second submit of the card's form, so it saves
  and then meets the gate; a line without games exports nulls, never invented zeros.
```

- [ ] **Step 2: `AGENTS.md`.** In the status paragraph: `Phases 0–5 and 8` → `Phases 0–5, 8 and 10`; `Migrations 0001–0009` → `0001–0010`; the parenthesis gains `0010 scorecards`; after the PhotoSwipe sentence add: `**JTT scorecards** (phase 10) live at /coach/scorecards: staff-only, eight lines by construction, the finalize gate in the database, and a JSON export in the TennisLink automation's observed-card shape (the automation's import is a follow-up in its own repo).` Change `Phases 9, 6 and 7 are planned, in that order` to name the renumbering (`phase 9 now takes 0011 and harness §17`). In **Domain invariants** add:
  `- **A scorecard is staff-only and complete or draft.** `scorecards` has exactly eight `scorecard_lines`, seeded by trigger — there is no insert or delete policy for lines. Draft → final runs the finalize trigger, which refuses an incomplete card by position (`scorecard_incomplete`); a coach's write to a final card matches no row, and only an admin reopens. Opponents' names are minors' names from another club: never on a public page.`
  In **Repo map**, under `src/lib/server/domain/`, add `scorecards/` (`format.ts` the card's rules, `form.ts` the form contract, `cards.ts` data, `export.ts` the observed card); under `src/routes/`, add `coach/scorecards` (list, `new`, `[id]`, `[id]/export`) and `scorecard` (the redirect); under `src/lib/components/`, add `NameField`, `ScoreField` (stand-ins; `docs/design-handoffs/`).
- [ ] **Step 3: `docs/HANDOFF-opus5.md`.** §1 state: phases built, `0001–0010`, `0011 is next`; §3 order: 9, 6, 7 with their renumbered migrations and sections; the prompt in §0: `Phases 0–5, 8 and 10 are built`.
- [ ] **Step 4: `docs/OPERATIONS.md` §7.** After the phase-8 row add: `| phase 10 | a team with a roster on dev — the seed script in the phase-10 plan (Task 12) makes a fictional one and the coach login `E2E_COACH_EMAIL`; real players' names stay out of dev | plan Task 12 |`.
- [ ] **Step 5: Gates.** `pnpm env:check` · `pnpm check` (0 errors, 0 warnings) · `pnpm lint` · `pnpm test` · `pnpm db:test` · `pnpm db:types` leaves no diff · `pnpm build:dev`. Fix what fails; never weaken a constraint.
- [ ] **Step 6: Checklist.** Write `docs/superpowers/plans/2026-10-02-phase-10-scorecards.checklist.md` in the shape of `2026-09-08-phase-8-public-site.checklist.md`: the task table cited by commit subject, what the phase waits on (the automation's JSON import; the Claude Design components; Artur's word on whether coaches may delete their own drafts), and what was learned building it.
- [ ] **Step 7: Commit, merge, deploy** — `git commit -am "docs(phase-10): records and the checklist"`; then the ritual: `git checkout main && git merge --ff-only phase-10/scorecards && git branch -f deploy/dev main && git push origin main deploy/dev`; confirm 0010 on the dev project (dashboard → Database → Migrations, or the curl in `docs/OPERATIONS.md` §2); run `pnpm test:e2e` against dev with the coach credentials. Report and stop.

---

## Self-review against the spec

- Data model, triggers, RLS → Task 1. Domain module (`format`, `form`, `cards`, `export`) → Tasks 3–6. Refusal codes → Task 2. Routes, the redirect, the export endpoint → Tasks 8–10. Composites, barrel export, styleguide, smoke line → Task 7. Tabs → Task 11. Coach login, fictional team, `.env.example` → Task 12. e2e walk → Task 13. Handoff document → Task 14. Records, renumbering, checklist, ritual → Tasks 0 and 15.
- Names used across tasks: `headerSchema`/`cardSchema`/`lineSchema`/`lineField`/`parseHeader`/`parseLines`/`fieldValues`/`submittedFields`/`CardHeader` (form.ts); `POSITIONS`/`ROUNDS`/`RESULTS`/`RESULT_LABELS`/`isPosition`/`isDoubles`/`positionLabel`/`roundOf`/`orderedPositions`/`suggestResult`/`suggestWinner`/`resolveLine`/`fromScore`/`totals`/`completeness`/`Line`/`LineInput` (format.ts); `listScorecards`/`getScorecard`/`createScorecard`/`saveCard`/`finalize`/`reopen`/`deleteDraft`/`teamMatches`/`linkRoster`/`RosterName`/`Scorecard` (cards.ts); `observedCard`/`dateText`/`timeText`/`exportFilename` (export.ts). Field names `<position>_<home1|home2|away1|away2|hg|ag|result|winner>` and the header keys are the same in form.ts, the card page and the e2e.
- Not in this plan, by the spec: the automation's JSON import, a printable card, family-facing results, lineup legality, a USTA submission write-back, photo capture.
