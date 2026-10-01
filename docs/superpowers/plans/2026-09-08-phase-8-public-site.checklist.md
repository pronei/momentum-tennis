# Phase 8 — Public site — Checklist

**Branch:** `phase-8/public-site`. **Plan:** `2026-09-08-phase-8-public-site.md` — the plan is the spec; its opening section records the answers of 2026-09-30. **State on 2026-09-30:** all seven tasks built and green.

## Done

| task | what | commit (subject — `git log --oneline main..phase-8/public-site`) |
| --- | --- | --- |
| — | opening questions answered, plan adjusted (releases exist; vectors; copy edits; the misnamed portrait; GPS) | docs(phase-8): opening questions answered; plan adjusted |
| 1 | `brand/Wordmark`, `brand/StrobeArc`, `media/PhotoFrame` + SSR contracts + styleguide block | feat(ds): Wordmark, StrobeArc and PhotoFrame ports |
| 2 | `site/SiteNav`, `site/ProgramCard`, the `site/SponsorStrip` addition; sponsor logos and the academy logos in `static/` | feat(ds): SiteNav and ProgramCard ports; SponsorStrip |
| 3 | `src/lib/content/{site,coaches,photos,sponsors}.ts` + tests; 31 photos and 6 portraits as metadata-free WebP; the misnamed design-system portrait corrected | feat(content): site stats, coaches, sponsors and photos as content modules |
| 4 | the `(site)` group (layout, footer, home); `/schedule` and `/store` moved in at the same URLs; `content/camps.ts` (`campWindow`) | feat(site): the public shell and the home page from the homepage template |
| 5 | `/coaches` | feat(site): coaches |
| 6 | `photoswipe@5.4.4` (pinned), `media/Lightbox` + `lightbox.css`, `/photos`, the gate run and recorded | feat(site): photo gallery with PhotoSwipe behind text controls |
| 6 | the lightbox stylesheet loads on mount, not with the barrel | fix(ds): load PhotoSwipe's stylesheet with the lightbox, not with the barrel |
| 7 | `e2e/site.test.ts`: the public walk and the phone menu | test(site): the public walk and the phone menu |
| 7 | records: PLAN.md, AGENTS.md, OPERATIONS §7, the decision note, this checklist, the handoff | docs(phase-8): records and the handoff to phase 6 |

Gates at the tip: `pnpm env:check` · `pnpm check` 0/0 · `pnpm lint` · `pnpm test` 427 · `pnpm db:test` · `pnpm db:types` no diff · `pnpm build:dev` · `pnpm test:e2e` 20 passed, 3 skipped (the credentialed specs).

## Waits on Artur

None of these block the site; each is a fact only the academy can confirm.

- **The edited copy.** The homepage kit's copy is ported as written; the coach bios are edited for grammar and flow (typos, the exclamation points, Tom's switching pronouns). A read-through before the site goes beyond dev.
- **Credentials.** The kit says *PTR-certified coaches* (hero line, book band); the staff page calls Artur a *USTA High Performance Certified Coach* and mentions PTR for nobody. Both may be true — confirm.
- **Matthew's title.** The staff page calls him *College coach*; his bio says he plays varsity at Los Altos High School. Kept as the academy wrote it.
- **Tom's pronouns.** The source used both "they" and "he"; the bio now uses neither. If Tom prefers one, it is a short edit in `coaches.ts`.
- **The staff page's own error.** On momentum-tennis.com the card holding Zach's bio and photo is titled "Coach Matthew: College Coach".
- **The hero photo's tag and caption** — `MURDOCK PARK`, "Rallies & games — green ball" — are the kit's; the photo shows a team lined up at the net. Confirm the place, or rewrite the caption.
- **Stats currency.** `SITE_STATS` covers FALL 2022 – SPRING 2026; update it each season in `site.ts`.
- **UTR's vector.** UTR publishes its current "UTR Sports" mark only as a raster; the strip keeps the academy's existing UTR image until UTR's brand kit supplies one.
- **The live site's GPS.** Ten images momentum-tennis.com serves still carry GPS coordinates, Matthew's portrait and photos of minors among them (OPERATIONS §7).

## Notes for whoever continues

- **Releases.** The user confirmed on 2026-09-30 that signed media releases exist for the minors pictured. Every entry in `coaches.ts` and `photos.ts` is `consented: true`; pages read only `publishedCoaches()` / `publishedPhotos()`. To withdraw someone, set the flag to `false`.
- **Images.** Re-encode anything new the same way: `cwebp -q 80 -resize_mode down_only -resize 1600 0` (portraits `0 1600`), which keeps no metadata by default. Check EXIF orientation first — `cwebp` ignores it. In zsh, a resize option held in a variable is passed as one argument, so write the options out literally. The site's photos were deduplicated against the archive with an 8×8 average hash (`sips -z 16 16 -s format bmp`, no libraries): duplicates scored ≤ 8 of 256, distinct shots ≥ 24.
- **`SiteNav`.** Keep the blur on `::before`, never on the header: a `backdrop-filter` makes its element the containing block for fixed descendants and shuts the mobile sheet inside the bar. The phone bar is logo, Book pill and menu button only; the reference's wordmark there overflowed at 375px.
- **PhotoSwipe.** It binds its keys only once the opening animation ends (its neighbouring slide holders turn `display: block` then — the e2e waits on that). After a mouse open it leaves focus where it was; the keyboard path moves focus in and returns it. `preloader: false` works at runtime but is not in its types, so the spinner is hidden in `lightbox.css`.
- **The barrel and CSS.** A static CSS import in a component exported from `$lib/ds` ships to every page that imports the barrel. Load such sheets on mount.
- **Links.** `svelte/no-navigation-without-resolve` wants `resolve()` for routes — the home page is `resolve('/(site)')`, so a section link is `"{resolve('/(site)')}#programs"` — and `asset()` for files in `static/`.
- **Tests in `src/`** have no Node types under `svelte-check`; list files with `import.meta.glob` (as `content.test.ts` does) rather than `node:fs`.
