# Momentum Tennis — Product ledger

Feature ideas captured for backend/product implementation (intended as the prompt source for Claude Code). Design-system mappings note what already exists here; everything else is TBD. Sample data in the portal mock is fake.

## 1. Grip-sensor stats ("see your motion", literally)
Racket grip fitted with an IMU + pressure sensors, worn during sessions, classifying shots in real time.
- Requirements: device pairing/registration per player; per-session capture; shot classification (forehand / backhand / serve / volley — extendable); derived metrics (shot counts, peak/avg grip pressure, swing speed percentiles, rally length); session history + trends; sync timestamp shown to user.
- Data hints: `Device(id, player_id, fw_version)`, `Session(id, player_id, started_at, synced_at)`, `Shot(session_id, t, type, confidence, grip_peak, swing_speed)`.
- Open questions: on-device vs server classification; BLE sync via coach tablet or parent phone; raw IMU retention policy (minors' data — keep minimal).
- Design: portal → Stats tab (`ui_kits/portal/`); mono annotation register; numbers are data, set in IBM Plex Mono.

## 2. Accounts & profile
Parent is the account owner and operates it; a child login is OPTIONAL and tied to the SAME account.
- Requirements: parent signup/login; add player(s) (child) to account; optional child credential with restricted visibility (sees stats/leaderboard/calendar; hidden: payments, store checkout, profile edits); role checks server-side; COPPA-mindful (minors: minimal PII, parent consent).
- Data hints: `Account(id)`, `User(id, account_id, role: parent|child, email?)`, `Player(id, account_id, name, group, court_level)`.
- Design: portal → Profile tab; SiteNav shows Log in ↔ Account.

## 3. Loyalty / court-placement meter
Five courts ordered by difficulty 1–5; coaches move students between courts; the meter shifts dynamically and doubles as the loyalty/progression display.
- Requirements: coach-facing action "move player to court N" (roster tool); movement history (audit: who moved whom, when); meter reflects current court; optional rewards triggered by promotions (define reward rules with Artur).
- Data hints: `CourtAssignment(player_id, court, assigned_by, at)`; current = latest.
- Open questions: is the reward the placement itself, points per session at court N, or milestone gifts? Exact loyalty mechanics TBD.
- Design: `components/site/CourtMeter.jsx` — 5-segment horizontal bar, past courts cool, current court amber ("now"), future empty.

## 4. Leaderboard
Group-scoped points leaderboard (initials only in any public/child-visible view — minors).
- Requirements: points source definition (attendance, match wins, drills?); scope by group (Orange/Green/Yellow) and season; opt-out flag per family.
- Design: portal → Stats tab, right column.

## 5. Calendar & slots
Dedicated calendar; each day shows available slots; clicking a day opens full day detail.
- Requirements: recurring session templates (De Anza Sat/Sun 09:00–13:00; Murdock Mon/Tue/Thu 16:00–20:00 by ball level; camp weeks); capacity per slot; spots-open count; book / join-waitlist from a slot; cancelation policy (24h) enforcement; coach schedule overrides (rainouts).
- Data hints: `SessionTemplate(dow, time, program, location, capacity)`, `SessionInstance(date, template_id, capacity_override?)`, `Booking(instance_id, player_id, status: booked|waitlist|canceled)`.
- Design: portal → Calendar tab (month grid + day-detail panel); SiteNav "Calendar" tab.

## 6. Bookings
Parent-visible list of enrolled classes/packages: schedule, sessions remaining, status (active/upcoming), manage/reschedule within policy.
- Data hints: `Enrollment(account_id, player_id, package_id, sessions_left, status)`.
- Design: portal → Bookings tab.

## 7. Store (public + member)
Packages purchasable by anyone; logged-in parents see member pricing; implies payment-gateway integration later.
- Requirements: catalog (class packs, camp weeks full/half, adult clinics, privates); public vs member price; cart + checkout; gateway (Stripe suggested; the legacy site used GoDaddy store — migrate products); receipts into Payments history; refunds per cancelation policy.
- Data hints: `Package(id, name, price_public, price_member, sessions, program)`, `Order`, `Payment(provider_ref)`.
- Design: portal → Store tab (public view = same grid without member row); SiteNav "Store" tab.

## 8. Payments & attendance
- Payments: history + upcoming dues visible to parent only; tie to orders and enrollments.
- Attendance: per-session check-in by coach (roster tap); feeds the portal strip, leaderboard points, and sessions-left decrement.
- Data hints: `Attendance(instance_id, player_id, present)`.

## 9. Navigation (implemented)
Concise, hierarchical from the start: Programs dropdown (Junior classes & teams / Summer camps / Adult programs / JTT match schedule) + first-class Calendar and Store tabs + Log in/Account + one Book-a-trial action. `components/site/SiteNav.jsx`.

## 10. Ball-caret input (implemented)
Text inputs replace the blinking caret with a tennis ball bouncing on the baseline; native caret under reduced motion. `components/core/TextField.jsx`.

## 11. Mobile (decided Aug 12 — designed in this system, mocks are the visual target)
Breakpoint: **760px**, single. Components self-detect via `matchMedia` because styling is inline — CSS media queries can't reach it; production may swap to classes/container queries, but must reproduce these layouts:
- **Nav**: SiteNav collapses to logo + Book pill + tri-color hamburger — bars top→bottom court-300 / court-500 / amber (past cool → now warm). Opens a full-screen court-navy sheet: Programs group (Juniors / Camps / Adults / JTT), Calendar, Store, Log in, Book CTA pinned last. The Book CTA never disappears. Scroll lock + Esc close + reduced-motion fallback included.
- **Portal**: bottom tab bar (fixed, 56px + `env(safe-area-inset-bottom)`, text-only mono labels — no icons; amber TOP border marks the active tab = "now"). Top tab row hidden on mobile.
- **Calendar**: full-viewport-width month grid (edge-to-edge, day cells ≥48px); tapping a day opens a bottom sheet (72vh max, ink top rule, backdrop court-navy 55%) with the day's slots + book/waitlist.
- **Stacking**: hero text before photo. Stats: session card first — EXCEPT CourtMeter pins to the top for 30 days after a placement change (dynamic; "PLACEMENT CHANGED — PINNED TO TOP" annotation). Store 2-up; Profile single column.
- **Type**: display tokens carry clamp() floors (`tokens/typography.css`); hero floor 38px.
- **Implementation flags**: test ball caret against the iOS virtual keyboard (native-caret fallback exists); serve downscaled/srcset photo variants; keep interactions tap-first (dropdowns are click-based, no hover-only affordances); 44px minimum targets throughout.

## 12. Admin console (site content controls)
Parent-facing pages read these; Artur edits them. Everything below is admin-set data, not code:
- **Class times**: the class structure is fixed — three equal blocks (technical skill training → dynamic drills & skill application → gameplay & strategy); weekend classes 2h = 3×40 min, weekday 1.5h = 3×30 min. Admin sets wall-clock start times per location/ball level each season and publishes to the calendar (§5), program cards, and portal. Data: `ClassTemplate(days, start_time, duration: 90|120, location, ball_level)` — block splits derive from duration. The site never hardcodes times; components show T+ offsets (`ClassTimeline`).
- **Seasonal events**: camps run ONLY in summer, 2nd week of June – end of July. Admin describes events — `SeasonEvent(label, start, end, blurb, enroll_href)` — and the site derives state: upcoming → "RETURNS <window>", live → "ENROLLING NOW", past → next event or hidden. Drives the homepage camp banner (#camps) and the nav's Summer-camps note. Sample logic: `campWindow()` in `ui_kits/website/sections.jsx`.
- **Performance stats**: the "Sneak peek at our performance" numbers (dual match wins 155, league championships 12, top-3 finishes 29, winning % 69.5, unique team seasons 39, W/L ratio 2.28:1) + their date-range stamp (FALL 2022 – SPRING 2026) — one editable record (`SITE_STATS` in sections.jsx).
- **Hero film**: slot for the cinematic slow-mo loop (muted autoplay, 16:9, ~0:40, 120fps source). A labeled placeholder ships until footage exists.

## 13. Program taxonomy (renamed Aug 18)
Classes (weekly, ball-level groups, weekend 2h / weekday 1.5h) · Team tennis (USTA JTT) · Private lessons (mostly with Artur Westergren himself) · Camps = a seasonal EVENT, not an evergreen program.

## 14. Platform extension (Aug 2026 — designed in this system)
The SvelteKit platform brief's surfaces are now fully mocked with reference components: forms (`components/forms/`), feedback/overlay (`components/feedback/`), DataTable + RatingMeter (`components/admin/`), schedule editor (`components/schedule/` + `ui_kits/admin/`), waiver center + versioned signing + re-consent gate and cart/checkout/credits/player-switcher (`ui_kits/portal/`), coach day sheet (`ui_kits/admin/coach.html`), transactional + marketing email (`templates/email/`). Key laws for implementation: waiver versions freeze on publish and new versions gate booking until a guardian re-signs; credits belong to a named player (assignment is part of checkout); conflicts are enforced in the database and surfaced as the mono refusal state (ResourceDayView/SessionForm); INTERNAL rating dimensions never reach family-facing views; MINOR is derived from birth date, never stored as a flag; Stripe-hosted checkout (card data never touches the site).

## Build order suggestion for Claude Code
1. Accounts (parent + linked child, roles) → 2. Catalog + Store + Stripe → 3. Calendar/slots + bookings + attendance → 4. Court assignments + leaderboard → 5. Device ingestion + stats → 6. Admin console (class times, seasonal events, site stats, film asset). Ship the portal shell (this design) against stub APIs first; every screen here maps to `ui_kits/portal/portal.jsx`.
