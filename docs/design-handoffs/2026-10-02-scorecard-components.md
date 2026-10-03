# Handoff to Claude Design — JTT scorecard components

Paste everything below the rule into a Claude Design session that has the Momentum Tennis design
system loaded (`design-system/SKILL.md`). The platform already ships the scorecard page on two
app-level stand-ins (`src/lib/components/NameField.svelte`, `ScoreField.svelte`); this asks for the
real components so the next export ports verbatim and the stand-ins retire.

---

You are extending the Momentum Tennis design system (Cupertino tennis academy; most players are
minors). Read `readme.md`, `PRODUCT.md` §11 and §14, `components/forms/` and
`ui_kits/admin/coach.html` first. Everything you make follows the system's laws without exception:
tokens only (no raw hex, no off-scale px); Chivo Black display, IBM Plex Sans body, IBM Plex Mono for
every time, score, count, status and reference, uppercase; caps ≤22px tracked 0.107em; one radius —
the 48px action pill — everything else square; flat, no shadows; amber is the present frame and the
ONE primary CTA per view; `--state-error` is the only state color, always dual-channel (color + a
mono `ERROR:` line); there is no success color (success is ink plus a mono confirmation line); no
icons, no emoji, no exclamation points; one breakpoint at 760px; 44px minimum targets; meaning never
in color alone; `prefers-reduced-motion` honored; SegmentedControl instead of radios and switches;
statuses through StatusChip; forms follow the shared anatomy (tracked-caps label, mono help,
dual-channel error).

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
