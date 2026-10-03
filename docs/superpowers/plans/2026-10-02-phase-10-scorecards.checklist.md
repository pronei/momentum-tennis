# Phase 10 — JTT scorecards — Checklist

**Branch:** `phase-10/scorecards`. **Spec:** `docs/superpowers/specs/2026-10-02-scorecards-design.md` (the four answers and the eight defaults). **Plan:** `2026-10-02-phase-10-scorecards.md`. **State on 2026-10-02:** fifteen tasks built and green; merged to `main`, `deploy/dev` pushed, 0010 confirmed on the dev project, the coach's e2e walk passed against dev (1 passed, 13.6s).

## Done

| task | what | commit (subject — `git log --oneline main..phase-10/scorecards`) |
| --- | --- | --- |
| — | the spec and the plan | docs(phase-10): design spec for JTT scorecards · docs(phase-10): implementation plan for JTT scorecards |
| 0 | phases 9, 6 and 7 renumbered (0011/§17, §18, 0012/§19) | docs: phases 9, 6 and 7 renumbered behind phase 10 (scorecards) |
| 1 | migration 0010 (two tables, three enums, the seed trigger, the finalize gate, RLS, audit, `updated_at`); harness §16 (13 checks); generated types | feat(db): 0010 — JTT scorecards with eight seeded lines and the finalize gate; harness §16 |
| 2 | `scorecard_incomplete`, `scorecard_final`, `unknown_scorecard` | feat(result): scorecard refusal codes |
| 3 | `scorecards/format.ts`: positions, the two round tables, labels, `suggestResult`, `suggestWinner`, `resolveLine`, `fromScore`, `totals`, `completeness` | feat(scorecards): the card's rules — rounds, labels, derived results, readiness |
| 4 | `scorecards/form.ts`: schemas, field names, `parseHeader`, `parseLines`, `fieldValues`, `submittedFields` | feat(scorecards): the form contract — schemas, field names, parsing, values |
| 5 | `scorecards/export.ts`: the observed card, `dateText`, `timeText`, `exportFilename` | feat(scorecards): the observed-card export |
| 6 | `scorecards/cards.ts`: list, read, create, save, finalize, reopen, delete, `teamMatches`, `linkRoster` | feat(scorecards): cards — list, read, create, save, finalize, reopen, delete, match prefill |
| 7 | `NameField`, `ScoreField` on `FieldShell` (now in the barrel); `Button` takes `formaction`; styleguide block; smoke line | feat(components): NameField and ScoreField on the shared field anatomy |
| 8 | `/scorecard` redirect; `/coach/scorecards` list | feat(scorecards): the list and the /scorecard address |
| 9 | `/coach/scorecards/new`: team, scheduled match, header | feat(scorecards): new card — team, scheduled match, header |
| 10 | `/coach/scorecards/[id]`: save, finalize through the gate, reopen, delete, export | feat(scorecards): the card — save, finalize through the gate, reopen, delete, export · fix(scorecards): the totals line as one string |
| 11 | the Scorecards tab in both shells | feat(scorecards): a Scorecards tab in the coach and admin shells |
| 12 | the dev coach `E2E_COACH_EMAIL` and the fictional team "Momentum Test 12U Green" (script in the plan, run 2026-10-02); `.env.example` names | docs(env): the e2e admin and coach names |
| 13 | `e2e/coach-scorecard.test.ts` | test(e2e): a coach records, finalizes and exports a match · fix(e2e): select the team by its exact label |
| 14 | `docs/design-handoffs/2026-10-02-scorecard-components.md` | docs(design): handoff for the scorecard components |
| 15 | records: PLAN.md row and decision log, AGENTS.md, HANDOFF, OPERATIONS §7, this checklist | docs(phase-10): records and the checklist |

Gates at the tip: `pnpm env:check` · `pnpm check` 0/0 · `pnpm lint` · `pnpm test` 479 · `pnpm db:test` 152 checks · `pnpm db:types` no diff · `pnpm build:dev`. `pnpm test:e2e e2e/coach-scorecard.test.ts` 1 passed against dev.

## Waits on

- Nothing from the user for the build itself. (The auto-mode classifier declined a direct `pnpm db:push dev` from the agent's session; the push of `deploy/dev` applied 0010 through the Supabase GitHub integration within two minutes.)
- **The automation's JSON import** (`tennislink-automation/outputs/momentum-tennis`, its own repository): an upload route that accepts the export document (`card` is `ObservedCard` without `page`, `rendered_path`, `rendered_sha256`, plus `result` and `winner` per line; games may be `null` and names empty for a default or double default) and creates the job at `MATCH_DISCOVERED`, seeding the draft's status from `result`.
- **The Claude Design components** — `docs/design-handoffs/2026-10-02-scorecard-components.md`; when they arrive, port them into `src/lib/ds/scorecard/` and retire the two composites.
- **Artur:** whether a coach may delete their own draft (today admin only), and whether the paper card is still exchanged and signed on the day (the page keeps no signatures).

## Notes for whoever continues

- **The gate is the trigger, the page mirrors it.** `completeness()` in `format.ts` lists what `finalize_scorecard()` would refuse; keep the two in step when either changes. The trigger reports lines in alphabetical position order (`1D` before `1S`); the page in play order.
- **`FROM SCORE` is stateless.** The stored result is always a concrete value or null; the select shows `''` whenever the stored value equals `suggestResult`/`suggestWinner` of the games. A played result (completed, timed, retired) with equal games and no chosen winner stores `result = null` — the column check demands a winner — and the readiness list says `NAME THE WINNER`.
- **Saving is nine updates, not a transaction.** The header update carries `.eq('status', 'draft')`; zero rows means the card is final and no line is touched. Finalize is the atomic gate.
- **Eyebrows uppercase in CSS.** SSR tests assert `Round 1`, not `ROUND 1`. A mono line built in markup across several template lines carries the line breaks into the text — build it as one derived string (`totalsLine`).
- **The harness and `audit_log`.** Only an admin reads `audit_log` (`admin_audit`); count audit rows after `reset role`, as §16 does.
- **Pipes hide exit codes.** `pnpm lint | tail` reports success whatever lint said; look at the output, or run the gate bare before a commit.
- **The dev coach.** The seed script in the plan (Task 12) creates the login confirmed, names it, grants `coach`, and seeds six fictional players on "Momentum Test 12U Green · Fall 2026". It refuses any project but the dev one and appends the password to `.env.local`. Running it twice fails on the existing email by design.
- **The e2e leaves a final card per run** (match id `9xxxxxx`); Artur reopens and deletes them from `/coach/scorecards`.
