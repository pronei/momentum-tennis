# Admin UI kit — the academy's console (prototype)

`index.html` — one tabbed page (Tabs, mobileMode="scroll"): **Schedule** (ResourceDayView day grid: click an empty slot → ghost draft, conflicting slot → the database-refusal state; click a session → SessionForm in a Dialog) / **Programs** (program table + seasonal-event windows that drive the homepage camp banner) / **Purchases** (DataTable of orders; row drill-in Dialog with ledger lines + Stripe ref; refund = destructive confirm with consequence line) / **Players** (roster with guardianship links, derived MINOR marker, waiver StatusChips) / **Waivers** (document versions; draft → publish with the re-consent consequence) / **Ratings** (dimension management + family-facing preview) / **Settings** (class times, seasonal events, performance stats record).

`coach.html` — the mobile-first coach day sheet: tap-to-mark attendance (frames fill court-400, 56px targets, mono tally), rating entry (interactive RatingMeter + visibility SegmentedControl + note), Toast confirmations.

Identity: the standard shell with an ADMIN eyebrow — same brand, no new chrome. All data is SAMPLE DATA (labeled). Backend spec: `/PRODUCT.md`.
