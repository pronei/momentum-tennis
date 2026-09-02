# Email kit — Momentum Tennis

Six send-ready table-layout templates. Email constraints override web rules HERE AND ONLY HERE:

- **Inline hex values are generated from `tokens/colors.css`** — the one sanctioned exception to the tokens-only rule (email clients can't read CSS vars). If tokens change, regenerate these files; never hand-tune a hex here without changing the token first. The adherence linter can't see inline email hex — this file is the recorded exception.
- Font stacks: `'Chivo',Helvetica,Arial` (display), `'IBM Plex Sans',Helvetica,Arial` (body), `'IBM Plex Mono','Courier New',Courier` (data) — webfonts load progressively via `@import`; Outlook falls back cleanly.
- The wordmark is `assets/wordmark-field.png` (raster, never the SVG logo redrawn). **PRODUCTION: replace relative image paths with hosted absolute URLs.**
- One amber CTA per email (bulletproof pill; old Outlook renders it square — accepted degradation).
- Dark-mode-safe: solid light surfaces, ink text, `color-scheme: light` metas.
- **No archive photos in email** — the media-release dependency stands.
- Footers: transactional templates carry a why-you-got-this line and NO unsubscribe (booking-confirmation, payment-receipt, class-reminder, low-credits, re-consent-request). `newsletter.html` structurally requires the physical mailing address (operator supplies — placeholder marked) and the unsubscribe link.
- Voice: plain, earned, no exclamation points. All times/prices/refs in mono uppercase.

Templates: `booking-confirmation` · `payment-receipt` · `class-reminder` · `low-credits` · `re-consent-request` · `newsletter` (shell). Preview card: `guidelines/email-kit.html`.
