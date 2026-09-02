# Schema

The schema lives in `supabase/migrations/` (append-only) and is exercised by
`supabase/tests/validate.mjs` (PGlite, 74 behavioral checks — `pnpm db:test`).
Design rationale and the decisions it encodes: `docs/PLAN.md`.
Generated types: `src/lib/server/db/database.types.ts` (`pnpm db:types`, never hand-edited).
