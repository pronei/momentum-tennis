# Phase 6 — Ratings & coach tools — Brief

**Goal (PLAN exit):** court placement drives the portal meter with accessible text values.

**Already in place:** `rating_dimensions` (`court_placement`, scale 5, seeded), `rating_events` (append-only, `rating_snapshot_scale` trigger), `v_current_ratings`, `rating_visibility`.

**Questions to open (default first):** who rates (coach and admin); visibility default (visible to the family); history shown to families (current value + date only; full history staff-only).

**Tasks:**
1. Migration 0010 only if a `record_rating` RPC is preferred over a direct insert under a staff policy — check the policies first; harness §16.
2. `domain/ratings.ts`: dimensions CRUD (admin), `rate(db, { playerId, dimensionId, value, note, visibility })`, `current(playerId)`, `history(playerId)`.
3. Ports: `admin/RatingMeter.jsx`, `site/CourtMeter.jsx` — five bars, text value always present, never colour alone.
4. Coach: `/coach/players/[id]` rating entry; Admin: `/admin/ratings` dimensions.
5. Portal: meter on the player card and `/portal/players/[id]`.

**Operator:** nothing.
