---
name: momentum-tennis-design
description: Use this skill to generate well-branded interfaces and assets for Momentum Tennis (Cupertino tennis academy), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files. For product/backend feature requirements (portal, device stats, store, calendar), read PRODUCT.md.

Non-negotiables when designing for Momentum Tennis: the serving-player logo (`assets/logo.svg`, main icon `assets/logo-mark.svg`, field variants `*-field.svg`) is the brand mark — never redraw or recolor it; court-blue anchor #2B5680 (field navy #1C3655 = the logo's navy) with amber #E8A33D reserved for the present frame + primary CTA ("the past is cool, now is warm"); Chivo Black display caps tracked 0.01em; IBM Plex Sans body; IBM Plex Mono for every time/score/annotation; caps ≤22px track 0.107em; 48px pill for actions, square everything else; photos always contained in a hairline frame with mono annotation, never full-bleed; no icons, no emoji, no exclamation points; numbered markers only in the camp-day timeline. Platform rules: `--state-error` #A8432D is the ONE state color — always dual-channel (color + mono ERROR: message), and there is NO success color (success = ink + mono confirmation line); SegmentedControl replaces radios and switches; statuses render via StatusChip (text carries meaning); destructive confirms are secondary-outline + error text + mono consequence — amber never confirms deletion; one breakpoint, 760px; forms follow the shared anatomy in components/forms/.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
