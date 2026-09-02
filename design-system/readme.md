# Momentum Tennis — Design System

Tennis academy in Cupertino, CA, run by Artur Westergren — PTR-certified coach and working professional photographer. Juniors and adults train mornings at De Anza College and Murdock Park; summer camps continue afternoons with chess, music production, photography and art in De Anza studios. USTA Junior Team Tennis: multiple Momentum teams, public match schedule against ~20 Bay Area clubs.

**Brand thesis: you improve by learning to see your own motion clearly — one frame at a time.** Every rule below serves that sentence. The site's single job: convince a Cupertino tech-parent in thirty seconds that this is a serious developmental program, and get them to book a free trial class.

**Sources**
- Founder's photo archive (49 candid courtside shots, Sept 2022 – Jul 2026), uploaded to `uploads/`; curated slot-named copies in `assets/photos/`. Original Drive folder: https://drive.google.com/drive/folders/13ZKq1GIzSL7kAGWCTonx6kNB6TgIBo4J
- Legacy site https://momentum-tennis.com (GoDaddy builder) — read for copy, schedules, nav, and the as-is styles this system deliberately evolves (blue deepened from #427CA1; 0.107em tracking scoped to labels; Montserrat → IBM Plex; #87CEFA banned).
- Brand brief (in-chat): palette targets, tracking law, shape law, strobe signature, voice, anti-patterns.

## Content fundamentals

Voice: **plain, earned, disciplined.** Progress comes from honest self-observation practiced daily. No hype, no exclamation points, no superlatives, no emoji (the legacy site's ❤️💪 are retired). Sentence case for prose; caps live only in labels and display.

- Real copy, verbatim: "Building players to win is our lifestyle." / "If our students aren't improving — we aren't growing as coaches."
- Address the parent as "you"; students are "players". First person plural for the academy ("we").
- State facts: days, times, courts, ball levels, credentials. Let schedules carry the argument. Never promise rankings.
- CTAs are verb-first and short: "Book a free trial class", "View schedule", "See the camp day".
- Numbers, times, scores, locations are set in mono, uppercase: `SAT 09:00–11:00 · DE ANZA`.
- The one metaphor allowed is the brand's own: frames, motion, "now". Don't stack it ("crush it one frame at a time" — never).

## Visual foundations

**Color** (`tokens/colors.css`). Anchor = acrylic hard-court blue `--court-500 #2B5680`, tuned against pixels sampled from the archive (shadowed courts #224263–#314E66; sunlit #7FA3C4 = `--court-300`). Deep and pale steps are aligned to the master logo: `--court-800 #1C3655` (logo navy) and `--court-200 #A9BDC9` (logo slate). Full ramp 050–900; every light blue is a derived tint. Neutrals: ink #1B1B1B, court-line white #F7F7F7 (page), pure white (cards), cool slate #46525E for secondary text. **One warm** — present amber #E8A33D — with a defined job: the present frame in any strobe treatment, and the primary CTA. Nowhere else. The system reads: **the past is cool, now is warm.** No warm greys, no cream, no gradients as decoration (the only gradient in the system is the multiply pass inside photo washes).

**Type** (`tokens/typography.css`). Display: Chivo Black, caps, tracking 0.01em (max 0.02em), leading 1.02. Workhorse: IBM Plex Sans 400/500/600/700, body 16/1.55. Data/annotation: IBM Plex Mono — every timestamp, score, tag, frame label. **The tracking law:** caps ≤22px track 0.107em (measured off the legacy site — the one systematic thing it had); display ≥28px tracks 0.01em, never 0.107em.

**Shape** (`tokens/spacing.css`). One radius: the 48px action pill (a circle swept through time). Everything else — cards, photos, chips, tags — is square. Hairline borders: rgba(27,27,27,.16) on light, rgba(247,247,247,.24) on field. The system is **flat**: no drop shadows, no blur except the sticky-header backdrop; depth comes from photos and field blocks.

**Backgrounds.** Line-white pages, white cards, court-800 "field" bands for the camp day and CTA; court-050 tint for quiet interludes. No patterns, no textures, no illustration.

**Photography.** Candid phone archive treated as analysis, not atmosphere: always contained in a hairline `PhotoFrame` (never full-bleed — the archive can't carry 2000px heroes), square corners, mono caption bar and/or overlaid mono tag. Treatments: `plain` (documentation), `wash` (court-blue duotone: grayscale → color-blend court-500 → soft multiply), `slice` (one still cut into staggered vertical frames, trailing slices cool-washed, lead edge amber — the strobe made photographic). Mixed aspect ratios guaranteed: every slot declares `ratio` + `focal`. Prefer motion and effort over identifiable portraiture (minors throughout the archive): backs, hands, mid-swing bodies, huddles, tight crops.

**The signature.** Stroboscopic multiple exposure, drawn: `StrobeArc` — a decaying bounce trajectory as frozen instants, ghost frames in court tints, present frame amber, optional mono `t−n … t0` annotation. Works standalone on light or field, one per view. Derived micro-device: `FrameTicks` (4 cool squares + 1 amber) for list markers, dividers, eyebrow accents, loading states. Fallback layout device (unused so far): the court diagram as literal grid.

**Motion.** Decisive and short: 120–320ms, ease-out, transforms ≤4px (buttons press 1px down). Frames advance; nothing floats, parallaxes, or bounces. `prefers-reduced-motion` collapses all animation globally (base.css). Timeline hover/focus flips a frame to amber — state change, not movement.

**Interaction states.** Hover: solid fills swap to their -600 step (amber→#C77F14); outlined pills invert (fill ink/white); ghost actions underline 2px offset 6px. Focus: 2px ring offset 2 — court-500 on light, amber on field (`.on-field`). Links: court-500, underline on hover; on field: court-200 → white.

**Mobile.** One breakpoint, 760px; components self-detect via matchMedia (styling is inline). SiteNav → logo + Book pill + tri-color hamburger (court-300/court-500/amber bars — past cool, now warm) opening a full-screen court-navy sheet. Portal → bottom tab bar, amber top-border active indicator, safe-area padded. Calendar → edge-to-edge month grid + day bottom-sheet. Stats stacking is dynamic: CourtMeter pins to top for 30 days after a placement change. Display type has clamp() floors. Mobile mocks: `ui_kits/website/mobile.card.html`, `ui_kits/portal/mobile.card.html`; spec in PRODUCT.md §11.

## Iconography

**There are no icons.** The system's graphic vocabulary is the strobe devices (`StrobeArc`, `FrameTicks`, the wordmark's settling ball) plus mono text labels — a deliberate choice: annotation over decoration. Directional cues are typographic (`→`, `·`, and the nav dropdown's `▾`/`▴`) set in mono. No icon font, no emoji, no hand-rolled SVG pictograms. If a future surface genuinely needs UI glyphs (e.g. a booking form), use IBM Plex-adjacent line icons (Lucide at 1.5px stroke) and record the addition here.

**Logo.** The master vector is `assets/logo.svg` — the serving-player mark over MOMENTUM TENNIS, supplied by the founder (navy #1C3655 + slate #A9BDC9; the tokens `--logo-navy` / `--logo-slate` / `--logo-tan` match it). Variants: `logo-mark.svg` (figure only — the main icon, used in the site header), `logo-field.svg` and `logo-mark-field.svg` (navy→line-white for court-blue fields). Never redraw it, recolor beyond the field swap, or add effects. The deep and pale steps of the court ramp are aligned to it (court-800 = logo navy, court-200 = logo slate). The typographic wordmark (`components/brand/Wordmark.jsx`) remains for type-only lockups; raster exports `assets/wordmark*.png`.

## Index

- `styles.css` → imports `tokens/` (fonts, colors, typography, spacing, base)
- `assets/photos/` — 14 curated archive photos, slot-named (`*-l` landscape, `*-p` portrait); `assets/logo*.svg` (master mark + variants); `assets/wordmark*.png`
- `components/brand/` — `Wordmark`, `StrobeArc`, `FrameTicks`
- `components/core/` — `Button`, `Eyebrow`, `TextField` (ball-caret input)
- `components/media/` — `PhotoFrame`
- `components/site/` — `ProgramCard`, `ClassTimeline` (the class play-by-play: 3 equal blocks, weekend 2h / weekday 1.5h toggle, T+ offsets — wall times are admin-set), `CampTimeline` (seasonal camp day), `SiteNav` (Programs dropdown: Classes / Team tennis / Private lessons + seasonal Summer-camps note; Calendar/Store/Account), `CourtMeter` (loyalty meter, courts 1–5)
- `components/forms/` — `Select`, `Checkbox` (frame-fill; consent variant), `SegmentedControl` (replaces radios AND switches), `DateField`, `TimeField`, `TextArea`, `FormSection`. Shared anatomy: tracked-caps 13px label, mono help, dual-channel error (--state-error border + mono ERROR: line, aria-describedby), 48px square hairline controls
- `components/feedback/` — `Dialog` (centered card / mobile bottom sheet, focus trap, destructive-confirm rule), `Banner` (ERROR:/NOTE: strips), `Toast`, `Tabs` (desktop underline / mobile bottom bar or scroll), `StatusChip` (swatch + mono text — text always AA), `EmptyState`, `Pagination`
- `components/admin/` — `DataTable` (sort, mono numerics, ≤760 card collapse), `RatingMeter` (CourtMeter generalized to N dimensions; INTERNAL tag; interactive input mode)
- `components/schedule/` — `ResourceDayView` (courts-×-hours day grid; type-colored cool-ramp blocks; cancelled/draft/conflict states; amber = now line only), `SessionForm`
- `ui_kits/website/` — homepage (`index.html` + `sections.jsx`): hero → slow-mo film placeholder → programs (Classes / Team tennis / Private lessons + admin-set seasonal camp banner) → class play-by-play ("Play by play of your time on court") → performance stats → single CTA. Admin-fed regions are marked `// ADMIN:` in sections.jsx; spec in PRODUCT.md §12
- `ui_kits/portal/` — logged-in client portal prototype: grip-sensor stats + credits, calendar + day slots, bookings, store → cart → receipt, waiver center + signing, profile; multi-player switcher and the re-consent booking gate (`portal-flows.jsx` carries the waiver/store flows)
- `ui_kits/admin/` — admin console (Schedule day-grid editor with conflict refusal, Programs, Purchases + ledger drill-in, Players roster, Waivers draft→publish, Ratings dimensions, Settings) + `coach.html` mobile day sheet
- `templates/email/` — six table-layout email templates (see its README: token-value hex exception, footer rules, no archive photos)
- `PRODUCT.md` — product/feature ledger (device stats, accounts, loyalty meter, calendar, store, payments) for backend implementation
- `guidelines/` — specimen cards (Type / Colors / Shape & Motion / Brand)
- `SKILL.md` — agent skill entry point

**Intentional additions** (no component source existed; standard set sized to the brand): the eight original components each map to a brief deliverable or stated rule. **Platform extension (Aug 2026 brief)** added, in order: `--state-error` (the ONE new token; measured ratios on the AA card; there is deliberately NO success color), the form system (`forms/` + TextField anatomy extension), feedback & overlay (`feedback/` — Dialog/Banner/Toast/Tabs/StatusChip/EmptyState/Pagination; Tabs extracts the portal's own tab pair; StatusChip fixes the amber-ACTIVE contrast failure), data display (`admin/` — DataTable, RatingMeter generalizing CourtMeter), scheduling (`schedule/` — ResourceDayView, SessionForm), the admin console + coach sheet UI kits, portal waiver/checkout/credits flows, and the email kit. Grouping note: the brief filed feedback under `core/` and scheduling under `site/`; they live in their own group folders because the repo convention is one specimen card per component directory. Zero icons were added — the Lucide escape hatch remains unused. `_ds_manifest.json` and `_adherence.oxlintrc.json` are compiler-generated from sources and sibling `.d.ts` files — never hand-edited; the email kit's inline hex is the recorded exception (see `templates/email/README.md`).

## Caveats / decisions on record

- **Fonts are Google-Fonts substitutions by design** (no binaries provided): Chivo, IBM Plex Sans, IBM Plex Mono via `@import` in `tokens/fonts.css`. If licensed/self-hosted files arrive, replace the import with `@font-face` rules there.
- Adult-program schedule isn't published on the legacy site; the adult card says "schedule set each season" rather than inventing one.
- Removal pass: the hero carries ONE strobe treatment (the sliced photo); the drawn arc lives only in the camp-day band. The circle→pill CTA hover sweep was considered and dropped as ornament.
- Consent: identifiable minors throughout the archive — confirm signed media releases before publishing any photo; the system's wash/slice/crop treatments reduce but don't remove that dependency. `IMG_6552/6722/7172.jpeg` are HEIF mislabeled as JPEG (fail to decode) — excluded from `assets/`. `7abe0489… 2.JPG` is a byte-identical duplicate.
- Platform surfaces are PROTOTYPES on sample data (labeled in-page): waiver copy is placeholder marked FROM LEGAL (the system writes no waiver language); the newsletter's mailing address is an operator-supplied placeholder; Stripe references are fake. ResourceDayView's drag-to-create ships as click-to-place — real drag is a production task. SvelteKit port: components here are the JSX reference implementations; port values verbatim (the `.d.ts` files are the props contracts).
