# Calendar library: the ResourceDayView port stays; @event-calendar/core is not adopted

**Date:** 2026-09-03 · **Phase:** 3 (schedule & availability) · **Status:** decided

## Context

2026-08-25 recorded that Schedule-X's resource view is paid (€479/yr) and that
`@event-calendar/core` (MIT) was the candidate for the admin day grid, subject to a theming
spike at the start of phase 3. The design rules it had to meet are not preferences: flat with
no drop shadows, exactly one radius (the 48px action pill) with everything else square, data
strings in mono, and amber reserved for the present frame — here, the now line and nothing else.

## What was measured

`@event-calendar/core@5.12.2` installed in a scratch directory outside the repository, and its
shipped `dist/index.css` (19KB) read directly. Reading the stylesheet answers the theming
question more exactly than a screenshot of a scratch route would: it shows precisely which
properties are behind CSS variables and which are hard-coded in its own selectors.

The variables it exposes are colour, size and layout only:

```
--ec-bg-color --ec-border-color --ec-button-* --ec-color-50…400 --ec-day-bg-color
--ec-event-bg-color --ec-event-text-color --ec-highlight-color --ec-now-indicator-color
--ec-popup-bg-color --ec-slot-height --ec-text-color --ec-today-bg-color … (35 in all)
```

There is **no variable for radius, shadow or font**. Those live in its own class rules:

| selector | declaration | rule it breaks |
|---|---|---|
| `.ec-event` | `box-shadow: 0 0 1px 0 var(--ec-border-color)` | the system is flat — no drop shadows |
| `.ec-event` | `border-radius: 3px` | one radius; a session block is square |
| `.ec-popup` | `box-shadow: … 0 10px 15px -3px, … 0 4px 6px -4px` | flat |
| `.ec-popup`, `.ec-button` | `border-radius: .25rem` | one radius |
| `.ec-event-tag` | `border-radius: 2px` | one radius |
| `…:before` | `border-radius: 50%` | a circle; the shape law forbids it |

`--ec-now-indicator-color` does exist, so amber on the now line would have themed cleanly. That
is the one rule its variables can satisfy.

## Decision

**Ship the `ResourceDayView` port alone.** The spike's own stop condition — "if any rule needs
CSS overrides deeper than its variables, stop" — is met on the first and most important element:
the session block carries both a shadow and a 3px radius, neither reachable through a variable.
Meeting the rules would mean overriding `.ec-event`, `.ec-popup`, `.ec-button` and `.ec-event-tag`
by their internal class names, which is a standing coupling to another project's DOM across
every future version.

Two further facts weigh the same way, found while building the port rather than in the spike:

- The port renders on the server and needs **no JavaScript**. Blocks are positioned with CSS
  custom properties (`--top`, `--height`) and each is a link, so the admin day grid works with
  scripting off. `@event-calendar/core` builds its grid in the browser (its bundle reaches for
  `document`/`window` in ten places) and measures the DOM to lay events out.
- The port is 6 SSR contract tests and about 300 lines we own, against a dependency plus the
  override sheet needed to tame it.

## Consequences

- No calendar dependency enters the project. `src/lib/ds/schedule/ResourceDayView.svelte` is the
  admin day grid; the portal and public calendars are bespoke token-styled lists.
- The mobile behaviour deliberately differs from the design-system reference, which switches to a
  single court with a Select: the port scrolls the grid horizontally instead, so a coach standing
  courtside keeps every column and needs no JavaScript to see them.
- Revisit only if a genuinely new requirement arrives — drag-to-move, cross-day timelines, or
  recurring-event editing in the grid — and re-measure against these same rules.
