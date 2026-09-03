# Postgres on Supabase, not Workers D1 — KV kept for caching

**Date:** 2026-09-03 · **Status:** decided

## Context

The app runs on Cloudflare Workers, so Workers D1 (SQLite at the edge) is the nearest database. The question was whether it could replace Supabase Postgres.

## What the schema depends on

| guarantee | Postgres on Supabase | D1 (SQLite) |
|---|---|---|
| double-booking refused at the database (`EXCLUDE USING gist` on `tstzrange`) | yes — `no_court_overlap`, `no_coach_overlap` | no exclusion constraints, no range types; the check moves into app code and races across isolates |
| row-level security as the authorization boundary | yes — policies on every table, `SECURITY DEFINER` RPCs for money and consent | none; every read and write must be authorized in the Worker |
| invariants in procedures and triggers (weekly cap, capacity, availability, append-only ledgers, last-admin guard) | plpgsql, partial unique indexes, advisory locks | SQLite triggers only; no procedures, no advisory locks, no partial-unique-with-expression on time zones |
| authentication | Supabase Auth (email, sessions, `auth.users` trigger into `accounts`) | build it, or add another service |
| backups / point-in-time recovery | Pro plan PITR; dev on Free has none (decision J) | time travel, 30 days, included |
| latency from the Worker | one HTTPS round trip to us-west-1 per query (PostgREST) | in-region, sub-millisecond reads |
| size and write model | no practical cap at this scale | 10 GB per database, single writer |

## Decision

Stay on Postgres at Supabase. The platform's correctness rests on constraints the database enforces — the AGENTS.md rule "the database is the authority" — and D1 cannot express them. Moving them into Worker code is the failure mode the schema was designed to prevent.

Workers KV stays available (token permission kept) for what it is good at: an edge cache of the public schedule and other anonymous reads, and coarse rate-limit counters. KV is never the source of truth for any record.

## Consequences

- Read latency for authenticated pages is bounded by the Supabase round trip; batch queries per request and cache anonymous reads in KV when phase 3's public page needs it.
- Production must be on Supabase Pro before money and consent records exist (decision J), and created as standard Postgres rather than the OrioleDB engine the dev project uses.
