# Phase 10 — JTT scorecards — Design

Written 2026-10-02 from the user's request and the four answers below. Implementation plan:
`docs/superpowers/plans/2026-10-02-phase-10-scorecards.md` (written after this spec is approved).

## Goal

A coach or admin records a USTA Junior Team Tennis match on the site, on a phone, in the shape the
paper scorecard has — the 2-court format (four rounds) or the 3-court format (three rounds) — and
finalizes it. A final card exports as JSON in the observed-card shape the TennisLink automation
(`tennislink-automation/outputs/momentum-tennis`) already ingests from the digital scorecard PDF.
The export replaces the PDF transcription step; reconcile, approve and the bookmarklet fill stay in
the automation, in the coach's own TennisLink session.

The first match this serves is on 2026-10-04 (the attached proposed 3-court lineup).

## Decisions

Answered by the user 2026-10-02:

1. **Integration: JSON export; the automation imports.** The platform captures and exports the
   observed card. The automation keeps reconcile, approve and the fill. Its JSON import is a
   follow-up in its own repository, out of this change; the export shape below is its contract.
2. **Ordering: scorecards first.** This is phase 10 in the plan table and builds now, taking
   migration `0010_scorecards.sql` and harness section 16. The plans for phases 9, 6 and 7 are
   renumbered: phase 9 → `0011_account_name.sql`, section 17; phase 6 → section 18 (its optional
   migration becomes 0012, and phase 7's would then be 0013); phase 7 → `0012_notifications.sql`,
   section 19. Doc edits only.
3. **Any staff finalizes; only an admin reopens.** Matches attendance: the coach on court marks
   the card final; a correction afterwards needs Artur.
4. **Opponent players' names are stored as written on the card.** Staff-only under RLS, never on
   a public page; the automation matches them against the official roster.

Defaults the user accepted:

5. Route `/coach/scorecards` (list, `new`, `[id]`); `/scorecard` redirects there. The `/coach`
   guard already admits coaches and admins; the admin shell gets a Scorecards tab.
6. One card row per match and exactly eight line rows, created together; staff read and write;
   families see nothing; the audit trigger logs every change. No signatures — the paper card stays
   the signed instrument.
7. Momentum's slots are typed names with the team roster as suggestions, so a match-day
   substitute can be entered; a name that matches one roster player exactly is linked to that
   player. Totals are computed, never typed.
8. Each line's result (Completed, Timed Match, Retired, Default, Double default) is derived from
   the games and the scoring format unless the coach chooses one. The automation stays the
   authority at approval.
9. Export is a JSON download per final card.
10. Coach login `pranayrs+coach@hotmail.com` on dev, confirmed, with a generated password written
    to `.env.local` as `E2E_COACH_EMAIL` / `E2E_COACH_PASSWORD`. Plus a fictional team with a
    roster on dev, because the roster drives the suggestions and real players' names do not
    belong in dev.
11. The Claude Design handoff is `docs/design-handoffs/2026-10-02-scorecard-components.md`.
12. No printable card, no family-facing results, no lineup legality checks, no USTA submission
    write-back, no photo capture.

## What the two formats share

Both cards carry the same eight lines: #1–#4 Singles and #1–#4 Doubles. They differ only in which
lines play together:

| format | round 1 | round 2 | round 3 | round 4 |
|---|---|---|---|---|
| 2-court | 1S, 4D | 2S, 3D | 3S, 2D | 4S, 1D |
| 3-court | 1S, 2S, 4D | 3S, 4S, 1D | 2D, 3D | — |

The 3-court card is marked "alternative only: use if both captains agree and a third court is
available", so the format is chosen per card. The round of a line is a function of the format and
is derived, never stored. The scoring format (a short set to 4 or to 6 games) is also per card:
the 12U Green cards of 2026-09-13 are 6-game sets.

## Data model — migration `0010_scorecards.sql`

Enums: `scorecard_format` (`two_court`, `three_court`); `scorecard_status` (`draft`, `final`);
`line_result` (`completed`, `timed`, `retired`, `default`, `double_default`).

**`scorecards`** — one per match.

| column | type | rule |
|---|---|---|
| `id` | uuid pk | |
| `team_id` | uuid → `teams` | not null; the roster source |
| `session_id` | uuid → `sessions` | null; unique — the scheduled match, when there is one |
| `match_id` | text | null; `^\d+$`; unique where not null (the USTA match id) |
| `played_on` | date | not null |
| `start_time` | time | null |
| `division` | text | not null default `''` |
| `home_team`, `away_team` | text | not null — the team names as printed |
| `location` | text | not null default `''` |
| `momentum_side` | text | not null, `home` or `away` |
| `format` | scorecard_format | not null |
| `set_games` | smallint | not null, 4 or 6 |
| `status` | scorecard_status | not null default `draft` |
| `home_sportsmanship`, `away_sportsmanship` | text | null |
| `notes` | text | null |
| `created_by` | uuid → `accounts` | not null |
| `finalized_at`, `finalized_by` | timestamptz, uuid | set by the finalize trigger |
| `created_at`, `updated_at` | timestamptz | |

`played_on` and `start_time` are what the card prints, not scheduling instants: the card is a
record of a document. When a card is created from a scheduled match they are prefilled from the
session's academy-local date and time.

**`scorecard_lines`** — exactly eight per card.

| column | type | rule |
|---|---|---|
| `id` | uuid pk | |
| `scorecard_id` | uuid → `scorecards` on delete cascade | unique with `position` |
| `position` | text | one of `1S 2S 3S 4S 1D 2D 3D 4D` |
| `home_player1_id`, `home_player2_id`, `away_player1_id`, `away_player2_id` | uuid → `players` | null; set when a typed name matched one roster player |
| `home_player1_name`, `home_player2_name`, `away_player1_name`, `away_player2_name` | text | not null default `''` |
| `home_games`, `away_games` | smallint | null; 0–7; both null or both set |
| `result` | line_result | null until chosen or derived |
| `winner` | text | null, `home` or `away` |
| `updated_at` | timestamptz | |

Checks: a singles line keeps every `player2` column empty; `double_default` → no winner and no
games; `completed`, `timed`, `retired` → games and a winner; `default` → a winner.

Columns are home/away because the paper card and the TennisLink form are: the card's
`momentum_side` says which column is ours. Roster ids may sit on either side; the app offers roster
suggestions only on Momentum's side.

**Triggers.**

- `seed_scorecard_lines` (after insert on `scorecards`, security definer): inserts the eight lines.
  No insert or delete policy exists on `scorecard_lines`, so a card always has exactly eight.
- `finalize_scorecard` (before update of `status` on `scorecards`). Draft → final requires: a
  `match_id`; every line with a `result`; for `completed`, `timed`, `retired` both sides named
  (one name on a singles line, two on a doubles line) with games and a winner; for `default` the
  winner's side named; nothing for `double_default`. Otherwise it raises
  `scorecard_incomplete: <position> <what is missing>` and the app shows that. On success it sets
  `finalized_at = now()` and `finalized_by = auth.uid()`. Final → draft clears both.
- The audit trigger (`audit_row`) on both tables.
- `updated_at` kept by 0001's `set_updated_at()` on both tables.

**RLS.** `scorecards`: select `is_staff()`; insert `is_staff() and created_by = auth.uid()`;
update using `is_staff() and (status = 'draft' or is_admin())`; delete `is_admin() and status =
'draft'`. `scorecard_lines`: select `is_staff()`; update using `is_staff()` and the parent card
is draft or the caller is admin; no insert, no delete. Families and anon: nothing. A coach's
update of a final card matches no row; the app reports that as `scorecard_final`.

## Domain module — `src/lib/server/domain/scorecards/`

- `format.ts` (pure): the position list, the two round tables, `roundOf`, `orderedPositions`,
  `positionLabel` (`1S` → `#1 Singles`), `isDoubles`, `suggestResult(home, away, setGames)`
  (`completed` when one side has exactly `setGames` and the other fewer; `timed` when both have
  fewer; otherwise no suggestion), `suggestWinner` (more games; equal → none), `totals`,
  `resolveLine` (applies "from score" to a submitted line), `completeness` (the finalize gate's
  rules, mirrored so the page can list what is missing before the coach taps Finalize).
- `cards.ts` (data, `ScorecardsDb = Pick<SupabaseClient<Database>, 'from'>`): zod schemas
  (`headerSchema`, `lineSchema`, `linesSchema` — eight lines keyed by position), `listScorecards`,
  `getScorecard` (card + lines in round order), `createScorecard`, `saveCard` (header plus the
  eight lines, one update per row; drafts need no transaction, finalize is the atomic gate),
  `finalize`, `reopen`, `deleteDraft`, `teamMatches` (a team's match sessions with opponent and
  home/away, read from `team_sessions` and `sessions`, for the prefill), `linkRoster` (exact
  name match, normalized, against the roster; one match links, zero or several leave it unlinked).
- `export.ts` (pure): `observedCard(card, lines)` and `exportFilename`.

Refusal codes added to `result.ts`: `scorecard_incomplete` (the trigger's token),
`scorecard_final` ("This card is final. An administrator can reopen it."), `unknown_scorecard`.

## Export shape

`GET /coach/scorecards/[id]/export` answers a JSON attachment for a final card, 409 otherwise:

```json
{
  "source": "momentum-tennis-platform",
  "scorecard_id": "…",
  "exported_at": "2026-10-04T23:10:00.000Z",
  "format": "three_court",
  "set_games": 6,
  "card": {
    "match_id": "2743978",
    "date_text": "10/04/26",
    "time_text": "2:00 PM",
    "division": "12U Green",
    "home_team": "Chippers",
    "away_team": "Momentum Tennis 12U Green A",
    "location": "…",
    "lines": [
      {
        "round": 1,
        "position_text": "#1 Singles",
        "home_names": ["…"],
        "away_names": ["…"],
        "home_games": 4,
        "away_games": 6,
        "result": "completed",
        "winner": "away"
      }
    ],
    "printed_home_total": 0,
    "printed_away_total": 0
  }
}
```

`card` is the automation's `ObservedCard` without the three render fields (`page`,
`rendered_path`, `rendered_sha256`) and with `result` and `winner` on each line. `date_text` and
`time_text` use the digital card's text forms (`MM/DD/YY`, `h:mm AM`). A line without games
exports `null` games and empty name arrays rather than invented zeros; the automation's import
must accept that. Lines are ordered by round, then position. The totals are the computed sums.

## Routes and pages

- `src/routes/scorecard/+page.server.ts` — redirect to `/coach/scorecards`. No guard change: the
  target is guarded.
- `/coach/scorecards` — DataTable of cards: date, team, opponent, match id, status chip, each row
  linking to its card; a New scorecard button.
- `/coach/scorecards/new` — two GET steps, no JavaScript needed: pick the team; then, with
  `?team=`, pick a scheduled match or none, and fill the header (format, set games, Momentum's
  side, date, time, division, both team names, location, match id). `?session=` prefills the
  header from the match. POST `?/create` makes the card and lands on it.
- `/coach/scorecards/[id]` — the card. One form, `?/save`, carries the header fields and the
  eight lines grouped by round under eyebrows (`ROUND 1`, …), each line with its position label
  in mono, the home side then the away side (team names as column heads, a mono `MOMENTUM` tag on
  ours), the name fields, two score boxes, the result select (`FROM SCORE`, Completed, Timed
  match, Retired, Default, Double default) and the winner select (`FROM SCORE`, the two team
  names). A mono totals line and a mono readiness list (what finalize would refuse) sit under
  the lines. Actions: Save (secondary), Finalize (the one primary action, behind a Dialog that
  states the consequence; needs JavaScript and fails closed), Export JSON (final only), Reopen
  (admin, final only), Delete draft (admin, Dialog). A final card renders its fields disabled.
- `/coach/scorecards/[id]/export/+server.ts` — the JSON download.
- `src/routes/coach/+layout.svelte` gains a Scorecards tab; `src/routes/admin/+layout.svelte`
  gains one linking to `/coach/scorecards`.

Result and winner are resolved on every save: `FROM SCORE` stores the derived value; a chosen
value stores as chosen. The page shows `FROM SCORE` whenever the stored value equals what the
score derives, so nothing is stale after a score edit. When the score derives nothing (7–5 in
a 6-game set) `FROM SCORE` stores no result, and the readiness list names the line.

## Design-system use and the two composites

Everything is composed from the ported system: `Eyebrow`, `FormSection`, `TextField`, `Select`,
`SegmentedControl` (format, set games, Momentum's side), `DateField`, `TimeField`, `DataTable`,
`StatusChip`, `Banner`, `Dialog`, `Button`, `EmptyState`. Two pieces the system does not have are
app composites in `src/lib/components/`, built on `FieldShell` so they carry the shared anatomy:

- `NameField` — a text input with a `<datalist>` of roster names; no caret animation, square,
  hairline, 48px.
- `ScoreField` — a 48px square mono input, `inputmode="numeric"`, one digit.

Both appear on `/styleguide`. The handoff document asks Claude Design for the proper components
(a score line, the score box, the round group, the whole lineup sheet, the name field with
suggestions, the totals bar, the card header) in the export's convention — `.jsx` + `.d.ts` +
`.prompt.md` + a specimen card, plus a 390×844 coach-kit page — using fictional names only, so a
later export can be ported verbatim and the composites retired.

## Tests

- `format.test.ts`: both round tables; labels; result suggestions (4-game set: 4–2 and 4–3
  completed, 3–3 and 2–1 timed, 5–3 none; 6-game set: 6–4 and 6–5 completed, 5–4 timed, 7–5 none);
  winner suggestions; totals with nulls; completeness messages; `resolveLine`.
- `cards.test.ts` with `fakeDb`: query shapes; `42501` → `not_authorized`; zero rows on a
  draft-only write → `scorecard_final`; the `scorecard_incomplete` token; `linkRoster` exact,
  ambiguous and absent.
- `export.test.ts`: the shape above, date and time text, null games, round order.
- SSR contract tests for the three pages and the two composites.
- Harness section 16: a coach creates a card and eight lines appear; a family reads nothing; a
  coach cannot insert a ninth line or delete one; finalize refuses an incomplete card with the
  token; a complete card finalizes and records who and when; the coach cannot update a final card
  (zero rows); an admin reopens; a second card for the same match id is refused; a singles line
  refuses a second player; audit rows exist for both tables.
- `e2e/coach-scorecard.test.ts`: the coach logs in, creates a card for the fictional team, fills
  a line, saves, finalizes, exports. Skips without `E2E_COACH_EMAIL` / `E2E_COACH_PASSWORD`.

## Operator work in this phase

- The coach login and the fictional team on dev, made by a one-off script in the scratchpad
  against the dev project with `SUPABASE_SECRET_KEY` from `.env.local` (the Supabase connector in
  this session belongs to another account and is not used). The password is generated and written
  to `.env.local`, never printed. `.env.example` lists `E2E_ADMIN_*` and `E2E_COACH_*` by name.
- `docs/OPERATIONS.md` §7 gains the phase-10 row: a team with a roster on dev, and the coach
  login.

## Records

`docs/PLAN.md` row 10 and a decision-log entry; `AGENTS.md` status, repo map and invariants (the
card is staff-only; eight lines by construction; the finalize gate); `docs/HANDOFF-opus5.md` state
and order (10 built, then 9, 6, 7); the renumbering in the three plans; the phase checklist after
the build; the design handoff document.
