# Phase 8 — Public site — Brief

No row in docs/PLAN.md covers the marketing site: the homepage is the phase-0 placeholder, `/schedule` is the only public page with content, and the website kit (`design-system/ui_kits/website/sections.jsx`, `templates/homepage/`) is unported. This brief records the inputs received on 2026-09-05 so nothing is lost; where it sits in the order is the user's call (decided 2026-09-05: phase 8, run directly after phase 5 — no dependency on anything, no migration).

**Goal (exit):** the site in the design system — home from the homepage template, coaches, sponsors strip, photo gallery with a lightbox, the store entry — live on dev, with every photo of a minor covered by a media release.

**Inputs received 2026-09-05**

- **Coaches** — source https://momentum-tennis.com/our-staff (the academy's own copy; bios are copied verbatim at execution, never rewritten):
  | coach | role on the current page | photo on the current page |
  |---|---|---|
  | Artur Westergren | founder & director; USTA High Performance certified | `artur portraitjpg.jpg` (678 KB) |
  | Vishal | Lead Instructor | `1U0A3847.jpg` (454 KB) |
  | Tom Anderson | Junior Tennis Expert | `1U0A3851.jpg` (451 KB) |
  | Surya | — | `1U0A3846.jpg` (531 KB) |
  | Zach | — (his bio sits under Surya's heading; the page has no heading for him) | none |
  | Matthew | College Coach | `IMG_7163.jpg` (960 KB) |
  For Artur to confirm: the roster (the website kit's coach line names *Elsio, USTA High Performance*, who is not on the current page); a typo in Tom's bio ("bings") and its mixed pronouns; and **media releases and guardian consent for any coach under 18** — Matthew is on a high-school varsity team, Zach and Surya may be minors too (design-system/readme.md: confirm signed releases before publishing any photo).
- **Sponsors** — the current homepage's logo strip, in this order: Babolat (`images.png`, 6 KB), UTR (`UTR-oracle-1920x1080_….webp`, 58 KB), Dunlop (`images.jpeg`, 6 KB), USTA (`usta-logo.jpeg`, 13 KB). All rasters; two are thumbnail-sized. Vectors come from each sponsor's brand kit — Artur asks; until then the rasters are placeholders. The design system has no sponsor-logo pattern: proposed — a mono eyebrow `PARTNERS`, logos at one fixed height, ink/grayscale at rest, hairline top and bottom, no hover colour; record it in readme.md as an intentional addition.
- **Lightbox** — PhotoSwipe 5, per docs/decisions/2026-09-05-lightbox-library.md (proposed); every photo through the PhotoFrame port; the gallery draws on `design-system/assets/photos/` (14 curated) and the coach portraits.
- **Assets location** — `design-system/assets/` is the source of truth (photos already live there); the app serves copies from `static/`.

**Questions to open (default first):** roster and titles confirmed by Artur; minors' releases before their photos ship (yes, non-negotiable); sponsor vectors requested from the sponsors (yes) and the raster placeholders acceptable meanwhile (yes); the sponsors strip on the home page only (yes); the coaches page at `/coaches` linked from SiteNav's Programs group (yes); gallery on the home page or its own `/photos` page (home, one row + "more" to `/photos`).

**Tasks:**
1. Port the site group: `SiteNav`, `ProgramCard`, `PhotoFrame`, `StrobeArc`, `Wordmark` (verbatim from the `.jsx` / `.d.ts` contracts; SSR contract tests; `/styleguide` specimens).
2. Home from `templates/homepage/Homepage.dc.html` and `ui_kits/website/sections.jsx`, the placeholder retired; the sponsors strip.
3. `/coaches` — one PhotoFrame + name + role + bio per coach, from a content file the admin console does not yet edit (`src/lib/content/coaches.ts`).
4. Gallery + PhotoSwipe behind the decision's gate; photos via PhotoFrame; mono text controls.
5. e2e smoke: home, coaches, photos render anonymously; the one amber CTA per view.

**Operator:** roster confirmation, media releases, sponsor brand kits, copy review by Artur.
