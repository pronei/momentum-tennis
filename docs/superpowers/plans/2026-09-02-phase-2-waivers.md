# Phase 2 — Waivers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax. Read `AGENTS.md` first — prime directive 5 governs this phase: **waiver copy comes FROM LEGAL. Never draft it, never claim legal sufficiency.**

**Goal:** The academy publishes a versioned waiver; a guardian signs it for a named player in a recorded capacity; publishing a new version forces everyone to re-consent, and booking can ask "is this player covered?" and get a truthful answer.

**Architecture:** 0001 already carries the whole mechanism — versioned documents, a publish-freeze trigger, immutable signatures, `v_current_waiver_versions`, `v_player_waiver_status`, `assert_waivers_signed()` and `sign_waiver()` with server-side capacity resolution. What is missing is the *authoring* half: creating a numbered draft and publishing it. Migration `0004` adds both as admin RPCs so version numbering is atomic and the content hash is computed in SQL, where it cannot drift from the text. Everything else is a domain module plus routes.

**Tech Stack:** No new dependencies.

---

## What already exists (do not rebuild)

| Mechanism | Where |
|---|---|
| Documents, versions, immutable signatures | `waiver_documents`, `waiver_versions`, `waiver_signatures` (0001) |
| Published versions are frozen | `waiver_versions_frozen` trigger |
| Signatures never update or delete | `signatures_immutable` trigger |
| "Which version is current" | `v_current_waiver_versions` |
| "Is this player covered" | `v_player_waiver_status`, `assert_waivers_signed()` |
| Capacity resolved server-side; a minor may never self-sign | `sign_waiver()` |

## Content rule

`content_md` is supplied by the academy's lawyer. Seeded and placeholder text is marked
`FROM LEGAL` and says so on screen. This system stores and versions text; it does not write it,
and no screen claims a signature is legally sufficient.

## File map

| Path | Responsibility | New? |
|---|---|---|
| `supabase/migrations/0004_waiver_authoring.sql` | `create_waiver_draft`, `update_waiver_draft`, `publish_waiver_version` | new |
| `supabase/tests/validate.mjs` | section 11: the version bump forces re-consent | extend |
| `src/lib/server/domain/result.ts` | codes `sign_waiver` and the new RPCs raise | extend |
| `src/lib/server/domain/waivers.ts` | documents, versions, status, signing + zod schemas | new |
| `src/routes/admin/waivers/+page.{server.ts,svelte}` | documents + add | new |
| `src/routes/admin/waivers/[id]/+page.{server.ts,svelte}` | versions, draft, publish | new |
| `src/routes/(portal)/portal/waivers/+page.{server.ts,svelte}` | per-player status | new |
| `src/routes/(portal)/portal/waivers/[versionId]/+page.{server.ts,svelte}` | signing ceremony | new |
| `src/routes/(portal)/portal/+layout.server.ts` | expose "needs re-consent" for the banner | extend |
| `e2e/smoke.test.ts` | new guarded routes | extend |

## Tasks

### Task 1: Migration 0004 + the re-consent proof
- [ ] Harness section 11 (at the END, after every booking section — publishing a new version
      invalidates signatures, which would break sections 6–8 if it ran earlier): draft v2 is not
      current; a draft is editable; publishing makes it current; every earlier signature stops
      satisfying; `assert_waivers_signed` raises `waiver_required`; publishing twice is refused;
      editing a published version is refused; signing the superseded version is refused; signing
      v2 restores coverage.
- [ ] Run `pnpm db:test` → RED (`create_waiver_draft` does not exist)
- [ ] Write `0004`: version = `max+1` inside the RPC (atomic), `content_sha256` computed with
      core `sha256()` so it cannot disagree with the text, publish refuses an already-published
      version and empty content.
- [ ] Run `pnpm db:test` → GREEN; `pnpm db:types`; commit

### Task 2: Refusal codes
- [ ] Failing test for `not_current_version`, `name_required`, `minor_cannot_self_sign`,
      `already_published`; add to `CODES` and `COPY`; GREEN; commit with Task 3

### Task 3: Waivers domain module
- [ ] Failing tests: `listDocuments` (current version + draft), `listVersions`,
      `createDocument`, `createDraft`, `updateDraft`, `publishVersion`, `playerWaiverStatus`
      (satisfied/unsatisfied shape), `signWaiver` (passes typed name, maps every refusal),
      `pendingReconsent`. Narrow fakes, as in `players.test.ts`.
- [ ] Implement; GREEN; commit

### Task 4: Admin authoring
- [ ] `/admin/waivers`: documents with current version and a `StatusChip`; add a document.
- [ ] `/admin/waivers/[id]`: version history, draft editor (`TextArea`), publish behind a
      `Dialog` whose consequence line names how many signers will have to re-consent.
- [ ] Waivers tab in the admin layout. Verify; commit

### Task 5: Portal signing
- [ ] `/portal/waivers`: the current player's documents with status and a "Review and sign" action.
- [ ] `/portal/waivers/[versionId]`: the version text in a hairline scroll frame with a mono
      version stamp, a capacity line the guardian cannot edit, typed name, consent `Checkbox`,
      one amber action; signed state shows the receipt.
- [ ] Re-consent `Banner` on the portal overview when the current player is not covered.
- [ ] Verify; commit

### Task 6: E2E, docs, final gate
- [ ] e2e for the new guarded routes; update `docs/PLAN.md`, `AGENTS.md`, this checklist.
- [ ] `pnpm env:check && pnpm check && pnpm lint && pnpm test && pnpm build` all green; commit

## Exit criteria

- Publishing a new version forces re-consent — proven in the schema harness, not just the UI.
- `assert_waivers_signed()` is the gate booking will call in phase 4, and it is truthful.
- An admin can author and publish; a guardian can sign for a named player in a recorded capacity;
  a minor can never self-sign.
- All gates green.
