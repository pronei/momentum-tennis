# Portal UI kit — the logged-in client area (prototype)

One interactive page, six sections as tabs (deep-linkable via `#stats/#calendar/#bookings/#store/#waivers/#profile`), for a multi-player account (Maya + Dev — the PlayerSwitcher sits in the header):

- **Stats** — racket-grip sensor session (IMU + pressure): shot classification counts with peak-grip bars, session mono summary, credits card (low-balance state at ≤2), attendance strip, CourtMeter, leaderboard (initials only — minors), payments.
- **Calendar** — August month grid; clicking a day opens its slot list with Book/waitlist actions. Booking is refused while re-consent is pending (Dev R.): error banner + struck actions.
- **Bookings** — enrolled classes/packages with StatusChips; re-consent Banner when gated.
- **Store** — packages → cart (every line carries a player-assignment Select — credits belong to a named player), member pricing, one amber Continue to payment (Stripe-hosted follows), receipt with mono ledger lines.
- **Waivers** — per-player document list with StatusChips; signing screen (versioned doc frame, FROM LEGAL placeholders, auto-stated guardian capacity line, typed-name signature, consent Checkbox, one amber action) and signed receipt. Signing Dev's waiver clears his booking gate live.
- **Profile** — parent account owner + linked players with child-login visibility rules.

All data is SAMPLE DATA (labeled on the page). Backend requirements live in `/PRODUCT.md`.

Mobile (≤760px): bottom tab bar replaces the top tabs; the calendar goes edge-to-edge with a day bottom-sheet; CourtMeter pins to the top of Stats for 30 days after a placement change. Preview: `mobile.card.html` (390px).
