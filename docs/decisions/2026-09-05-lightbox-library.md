# Lightbox for site photos — PhotoSwipe, pending confirmation

**Status:** proposed 2026-09-05 — nothing is installed in the repo. Adoption happens in the public-site phase, behind the gate at the end of this note.

**Question.** The public site will show photos (coaches, courts, the archive) in a lightbox. Candidates named: PhotoSwipe and GLightbox. The design system's laws that a third-party UI must obey (design-system/readme.md): tokens only; one radius (the 48px action pill), everything else square; flat, no shadows; Chivo / IBM Plex Sans / IBM Plex Mono only; **no icons**; `prefers-reduced-motion` honoured; 44px targets; meaning never in colour alone.

**Method.** Both packages installed at their latest versions in a scratch directory outside the repo (the same method as the calendar spike, docs/decisions/2026-09-03-calendar-library.md); the shipped CSS grepped for radius, shadow, font and motion; the sources grepped for the UI hooks.

| | PhotoSwipe 5.4.4 (MIT, May 2024) | GLightbox 3.3.1 (MIT, Jan 2025) |
|---|---|---|
| CSS shipped | 7.4 KB (2.4 gz); **12 custom properties** (`--pswp-bg`, `--pswp-icon-color`, `--pswp-icon-stroke-*`, `--pswp-preloader-color*`, `--pswp-error-text-color`, `--pswp-transition-duration`, `--pswp-root-z-index`, `--pswp-placeholder-bg`) | 17.4 KB (2.9 gz); **no custom properties** |
| `border-radius` | one rule, `0` | `50%` and `4px`, hard-coded |
| shadows | `box-shadow: none` twice; one `text-shadow` on the error message | `1px 2px 9px rgba(0,0,0,.65)` on the description box |
| fonts | inherits (`font-size: 1em`; error text 14px) | `font-family: arial` twice |
| icons | the default close / zoom / arrows are SVG injected by JS; each is a boolean option (`close`, `zoom`, `arrowPrev`, `arrowNext`, `counter`), and `pswp.ui.registerElement({ html, isButton, onClick })` accepts plain text — mono `CLOSE / PREV / NEXT` are first-class | SVG strings via `svg: { close, next, prev }`; text works, styled by overriding `.gclose / .gnext / .gprev` |
| motion | `showHideAnimationType: 'none'` plus `--pswp-transition-duration` — reduced motion is one `matchMedia` check | 34 transitions in CSS, no hook; overrides |
| JS | 68.6 KB min (18.3 gz) core + lightbox, **ESM**, loaded by dynamic import when a gallery first opens | 56.3 KB min (15.4 gz), a window global, loaded up front |
| gestures / a11y | pinch-zoom, drag-to-close, focus trap and return, Esc / arrow keys | swipe, keyboard, focus; no pinch-zoom |

**Decision (proposed).** PhotoSwipe. It is the only candidate whose shipped stylesheet already obeys the laws — radius 0, no shadow, no font — and whose UI is a registry rather than a skin to fight, so the no-icons rule is met by registering text controls instead of overriding pictograms. GLightbox would need every law restored by override and offers no variables to do it with.

**Cost accepted.** One override for the error message's text-shadow; the text controls registered by us (with 44px hit areas); the dynamic import so the public bundle pays nothing until a photo is opened.

**Gate before adoption (in the phase that ships the gallery).** (1) A `/styleguide` specimen opens a PhotoFrame in the lightbox with mono text controls and no default icons. (2) The override stylesheet lives under `src/lib/ds` and `scripts/check-adherence.mjs` passes. (3) `prefers-reduced-motion: reduce` opens with `showHideAnimationType: 'none'` and `--pswp-transition-duration: 0ms`. (4) Keyboard: Esc closes, arrows move, focus returns to the opener. (5) The dependency is recorded in design-system/readme.md next to the icon rule, as the calendar decision required.
