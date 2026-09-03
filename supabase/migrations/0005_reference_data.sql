-- ═══════════════════════════════════════════════════════════════════════════
-- Momentum Tennis — 0005: reference data the application requires
--
-- These rows are not sample data: create_player needs the ball levels, the portal
-- needs the locations, the meter needs its dimension, and the consent gate needs
-- the required document to exist. `supabase db push` applies migrations, never
-- seed.sql, so anything the app cannot run without belongs here — idempotently,
-- because every environment applies it exactly once and re-runs must be harmless.
-- The waiver document's TEXT is not here: versions come FROM LEGAL via the console.
-- Append-only: never edit this file once applied — add 0006.
-- ═══════════════════════════════════════════════════════════════════════════

insert into skill_levels (key, label, rank) values
  ('orange',              'Orange ball',                1),
  ('green_beginner',      'Green ball · beginner',      2),
  ('green_intermediate',  'Green ball · intermediate',  3),
  ('green_advanced',      'Green ball · advanced',      4),
  ('yellow_intermediate', 'Yellow ball · intermediate', 5),
  ('yellow_advanced',     'Yellow ball · advanced',     6)
on conflict (key) do nothing;

insert into locations (name) values ('De Anza College'), ('Murdock Park')
on conflict (name) do nothing;

insert into rating_dimensions (key, label, scale_max, sort)
values ('court_placement', 'Court placement', 5, 0)
on conflict (key) do nothing;

insert into waiver_documents (slug, title) values ('liability', 'Participation waiver')
on conflict (slug) do nothing;
