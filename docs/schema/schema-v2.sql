-- ═══════════════════════════════════════════════════════════════════════════
-- Momentum Tennis — schema v2  (finalized 2026-08-31, validated with PGlite)
--
-- Status: reviewed spec. On phase-0 approval this file becomes
-- supabase/migrations/0001_schema.sql verbatim and this copy is deleted —
-- migrations are then the single source of truth.
--
-- Conventions
--   • timestamptz (UTC) everywhere; LOCAL wall-clock only in recurring templates
--   • the database enforces invariants: EXCLUDE (double-booking), partial unique
--     indexes (weekly cap, idempotency), triggers (capacity, availability,
--     append-only), RLS on every table, SECURITY DEFINER RPCs for money/consent
--   • append-only: credit_ledger, waiver_signatures, rating_events,
--     published waiver_versions, audit_log — corrections are new rows
--   • decisions encoded here: A/B scoped 10-credit packs valid 10 weeks
--     (configurable per product), C consume-at-booking with ≥notice reversal,
--     H courts belong to locations and must be reserved (availability) before
--     any session can use them, I ISO week in academy TZ, K waitlist holds
--     nothing until promoted, F waivers barebones (mechanism only),
--     L one forgiven skip per package (forfeit returned + validity extended a
--     week per allowance), M six-level ball-level taxonomy set at profile
--     creation, N level-tagged slots — a player books only sessions tagged
--     with their level (untagged = all levels)
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists btree_gist;

-- ───────────────────────────── enums ─────────────────────────────
create type staff_role         as enum ('coach','admin');
create type guardianship_role  as enum ('self','parent','legal_guardian','other');
create type session_type       as enum ('camp','class','team','private');
create type session_status     as enum ('scheduled','cancelled');
create type registration_status as enum ('registered','waitlisted','cancelled');
create type booking_status     as enum ('booked','waitlisted','completed','cancelled','cancelled_late','cancelled_by_academy','no_show');
create type team_session_kind  as enum ('practice','match');
create type product_kind       as enum ('class_pack','lesson_pack','camp','team_fee');
create type credit_kind        as enum ('class_weekday','class_weekend','private_lesson');
create type credit_scope       as enum ('weekday','weekend');
create type order_status       as enum ('pending','paid','partially_refunded','refunded','cancelled');
create type ledger_entry_type  as enum ('purchase','consume','consume_reversal','refund','expire','adjust','forgive');
create type signing_capacity   as enum ('self','guardian');
create type rating_visibility  as enum ('internal','guardian');
create type notify_category    as enum ('transactional','marketing');
create type send_status        as enum ('pending','sent','failed');
create type availability_exception_kind as enum ('closed','open');

-- ───────────────────────────── settings ──────────────────────────
create table academy_settings (
  id                            boolean primary key default true check (id),   -- singleton
  timezone                      text not null default 'America/Los_Angeles',
  camp_season_start             date,
  camp_season_end               date,
  cancel_notice_hours           int  not null default 24,     -- C: ≥ notice → credit reversal
  booking_horizon_days          int  not null default 70,     -- how far ahead families may book
  default_credit_validity_days  int  not null default 70,     -- A/B: 10 weeks unless the product says otherwise
  low_credit_threshold          int  not null default 2,
  default_forgiven_skips        int  not null default 1,      -- L: forgiven skips per package (when the product doesn't say)
  updated_at                    timestamptz not null default now()
);
insert into academy_settings default values;

create function public.academy_tz() returns text
  language sql stable as $$ select timezone from academy_settings $$;
create function public.academy_local(ts timestamptz) returns timestamp
  language sql stable as $$ select ts at time zone academy_tz() $$;
-- I: ISO week (Monday start) in academy local time
create function public.academy_week_start(ts timestamptz) returns date
  language sql stable as $$ select date_trunc('week', academy_local(ts))::date $$;
create function public.academy_scope(ts timestamptz) returns credit_scope
  language sql stable as $$
    select case when extract(isodow from academy_local(ts)) in (6,7)
                then 'weekend'::credit_scope else 'weekday'::credit_scope end $$;

-- ───────────────────────────── identity ──────────────────────────
create table accounts (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text not null default '',
  phone       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create function public.handle_new_auth_user() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  insert into public.accounts (id, email) values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_auth_user();

create table staff_members (
  account_id  uuid not null references accounts(id) on delete cascade,
  role        staff_role not null,
  created_at  timestamptz not null default now(),
  primary key (account_id, role)
);

create table skill_levels (             -- ball-level taxonomy; admin-editable
  id      uuid primary key default gen_random_uuid(),
  key     text not null unique,
  label   text not null,
  rank    int  not null unique,
  active  boolean not null default true
);

create table players (
  id              uuid primary key default gen_random_uuid(),
  full_name       text not null,
  birthdate       date not null,        -- minority is DERIVED, never stored
  skill_level_id  uuid references skill_levels(id),
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table guardianships (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid not null references accounts(id) on delete cascade,
  player_id   uuid not null references players(id) on delete cascade,
  role        guardianship_role not null,
  started_at  timestamptz not null default now(),
  ended_at    timestamptz                -- null = active
);
create unique index uq_active_guardianship on guardianships (account_id, player_id)
  where ended_at is null;
create index idx_guardianships_player on guardianships (player_id) where ended_at is null;

-- ───────────────────────────── authorization helpers ─────────────
-- SECURITY DEFINER + STABLE: usable inside policies without recursion.
create function public.is_admin() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from staff_members where account_id = auth.uid() and role = 'admin') $$;
create function public.is_staff() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from staff_members where account_id = auth.uid()) $$;
create function public.guards(p_player uuid) returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from guardianships g
                 where g.player_id = p_player and g.account_id = auth.uid() and g.ended_at is null) $$;
create function public.player_is_adult(p_player uuid, p_at timestamptz default now()) returns boolean
  language sql stable security definer set search_path = public as $$
  select birthdate <= (academy_local(p_at)::date - interval '18 years')::date from players where id = p_player $$;
-- G: a minor's own restricted login sees no money; flips automatically at 18
create function public.can_view_financials(p_player uuid) returns boolean
  language sql stable security definer set search_path = public as $$
  select is_staff() or exists (
    select 1 from guardianships g
    where g.player_id = p_player and g.account_id = auth.uid() and g.ended_at is null
      and (g.role <> 'self' or player_is_adult(p_player))) $$;

-- ───────────────────────────── facilities ────────────────────────
create table locations (
  id       uuid primary key default gen_random_uuid(),
  name     text not null unique,         -- 'De Anza College', 'Murdock Park'
  address  text,
  active   boolean not null default true
);
create table courts (                    -- H: courts belong to a specific location
  id           uuid primary key default gen_random_uuid(),
  location_id  uuid not null references locations(id),
  name         text not null,
  active       boolean not null default true,
  unique (location_id, name)
);

-- H: Artur reserves a court with the venue FIRST, then declares it available here.
-- Nothing can be scheduled on a court outside its declared availability (trigger below).
create table court_availability (        -- recurring weekly reservation windows
  id               uuid primary key default gen_random_uuid(),
  court_id         uuid not null references courts(id) on delete cascade,
  weekday          int  not null check (weekday between 1 and 7),     -- ISO
  open_local       time not null,
  close_local      time not null,
  effective_from   date not null,
  effective_to     date,                                             -- null = open-ended
  lesson_bookable  boolean not null default true,   -- families may book private-lesson slots here
  slot_minutes     int  not null default 60 check (slot_minutes in (30,45,60,90,120)),
  reservation_ref  text,                             -- venue permit / booking reference
  created_by       uuid references accounts(id),
  created_at       timestamptz not null default now(),
  check (close_local > open_local),
  check (effective_to is null or effective_to >= effective_from)
);
create index idx_availability_court_dow on court_availability (court_id, weekday);

create table court_availability_exceptions (   -- dated closures (rainouts, venue events) or extra openings
  id           uuid primary key default gen_random_uuid(),
  court_id     uuid not null references courts(id) on delete cascade,
  on_date      date not null,
  kind         availability_exception_kind not null,
  open_local   time,                     -- closed: null = whole day; open: required
  close_local  time,
  reason       text,
  created_by   uuid references accounts(id),
  created_at   timestamptz not null default now(),
  check (kind <> 'open' or (open_local is not null and close_local is not null)),
  check (open_local is null or close_local > open_local)
);
create index idx_availability_exc_court_date on court_availability_exceptions (court_id, on_date);

-- Is [p_start, p_end) on this court covered by a reservation? p_for_lessons additionally
-- requires the covering rule to be lesson_bookable (extra 'open' exceptions always qualify).
create function public.court_available(p_court uuid, p_start timestamptz, p_end timestamptz,
                                       p_for_lessons boolean default false)
returns boolean language plpgsql stable as $$
declare ls timestamp; le timestamp; d date;
begin
  ls := academy_local(p_start); le := academy_local(p_end); d := ls::date;
  if le::date <> d and le <> (d + 1)::timestamp then return false; end if;   -- no multi-day windows
  if exists (select 1 from court_availability_exceptions e
             where e.court_id = p_court and e.on_date = d and e.kind = 'closed'
               and (e.open_local is null or ((d + e.open_local) < le and (d + e.close_local) > ls))) then
    return false;
  end if;
  if exists (select 1 from court_availability_exceptions e
             where e.court_id = p_court and e.on_date = d and e.kind = 'open'
               and (d + e.open_local) <= ls and (d + e.close_local) >= le) then
    return true;
  end if;
  return exists (select 1 from court_availability r
                 where r.court_id = p_court
                   and r.weekday = extract(isodow from d)::int
                   and r.effective_from <= d and (r.effective_to is null or r.effective_to >= d)
                   and (d + r.open_local) <= ls and (d + r.close_local) >= le
                   and (not p_for_lessons or r.lesson_bookable));
end $$;

-- ───────────────────────────── catalog ───────────────────────────
create table products (
  id                    uuid primary key default gen_random_uuid(),
  kind                  product_kind not null,
  name                  text not null,
  description           text,
  price_public_cents    int not null check (price_public_cents >= 0),
  price_member_cents    int check (price_member_cents >= 0),        -- shown to logged-in families
  currency              char(3) not null default 'usd',
  credit_kind           credit_kind,                                -- packs only
  credit_quantity       int check (credit_quantity > 0),            -- A: 10
  credit_validity_days  int check (credit_validity_days > 0),       -- B: 70 (=10 weeks); null → academy default
  forgiven_skips        int check (forgiven_skips >= 0),             -- L: per package; null → academy default; validity += 7 days each
  stripe_price_public   text unique,
  stripe_price_member   text unique,
  active                boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  check ((kind in ('class_pack','lesson_pack')) = (credit_kind is not null and credit_quantity is not null)),
  check (kind <> 'class_pack'  or credit_kind in ('class_weekday','class_weekend')),
  check (kind <> 'lesson_pack' or credit_kind = 'private_lesson')
);

-- ───────────────────────────── scheduling core ───────────────────
create table sessions (
  id            uuid primary key default gen_random_uuid(),
  session_type  session_type not null,
  starts_at     timestamptz not null,
  ends_at       timestamptz not null,
  court_id      uuid references courts(id),         -- null = off-site (away match) / unassigned
  coach_id      uuid references accounts(id),
  status        session_status not null default 'scheduled',
  venue_note    text,
  notes         text,
  timespan      tstzrange generated always as (tstzrange(starts_at, ends_at, '[)')) stored,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (ends_at > starts_at),
  unique (id, session_type),                        -- target for subtype composite FKs
  -- THE anti-double-booking constraints — serverless check-then-insert races die here
  constraint no_court_overlap exclude using gist (court_id with =, timespan with &&)
    where (court_id is not null and status = 'scheduled'),
  constraint no_coach_overlap exclude using gist (coach_id with =, timespan with &&)
    where (coach_id is not null and status = 'scheduled')
);
create index idx_sessions_starts on sessions (starts_at);
create index idx_sessions_court_day on sessions (court_id, starts_at);

-- N: which ball levels a slot offers. No rows = open to all levels.
create table session_skill_levels (
  session_id      uuid not null references sessions(id) on delete cascade,
  skill_level_id  uuid not null references skill_levels(id),
  primary key (session_id, skill_level_id)
);

-- H: every scheduled session on a court must sit inside declared availability
create function public.enforce_session_availability() returns trigger language plpgsql as $$
begin
  if new.court_id is not null and new.status = 'scheduled'
     and not court_available(new.court_id, new.starts_at, new.ends_at) then
    raise exception 'court_unavailable: court % is not reserved for % – %',
      new.court_id, new.starts_at, new.ends_at using errcode = 'check_violation';
  end if;
  return new;
end $$;
create trigger sessions_within_availability
  before insert or update of court_id, starts_at, ends_at, status on sessions
  for each row execute function enforce_session_availability();

-- H: shrinking availability under existing bookings is refused — cancel the sessions first
create function public.protect_scheduled_sessions() returns trigger language plpgsql as $$
declare v_court uuid; s record;
begin
  v_court := coalesce(new.court_id, old.court_id);
  for s in select id, starts_at, ends_at from sessions
           where court_id = v_court and status = 'scheduled' and ends_at > now() loop
    if not court_available(v_court, s.starts_at, s.ends_at) then
      raise exception 'availability_in_use: session % (% – %) would lose its court; cancel it first',
        s.id, s.starts_at, s.ends_at using errcode = 'check_violation';
    end if;
  end loop;
  return null;
end $$;
create trigger availability_protects_sessions
  after update or delete on court_availability
  for each row execute function protect_scheduled_sessions();
create trigger availability_exceptions_protect_sessions
  after insert or update on court_availability_exceptions
  for each row execute function protect_scheduled_sessions();

-- ───────────────────────────── camps (multi-day unit, summer only) ──
create table camps (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  starts_on    date not null,
  ends_on      date not null,
  capacity     int  not null check (capacity > 0),
  product_id   uuid unique references products(id),
  description  text,
  created_at   timestamptz not null default now(),
  check (ends_on >= starts_on)
);
create function public.enforce_camp_season() returns trigger language plpgsql as $$
declare s date; e date;
begin
  select camp_season_start, camp_season_end into s, e from academy_settings;
  if s is null or e is null or new.starts_on < s or new.ends_on > e then
    raise exception 'camp_out_of_season: camps must fall within the configured summer window (% – %)', s, e
      using errcode = 'check_violation';
  end if;
  return new;
end $$;
create trigger camps_summer_only before insert or update on camps
  for each row execute function enforce_camp_season();

create table camp_sessions (
  session_id    uuid primary key,
  session_type  session_type not null default 'camp' check (session_type = 'camp'),
  camp_id       uuid not null references camps(id) on delete cascade,
  foreign key (session_id, session_type) references sessions (id, session_type) on delete cascade
);

create table camp_registrations (
  id             uuid primary key default gen_random_uuid(),
  camp_id        uuid not null references camps(id),
  player_id      uuid not null references players(id),
  order_item_id  uuid,                           -- FK added after order_items; null = admin-registered
  status         registration_status not null default 'registered',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (camp_id, player_id)
);
create function public.enforce_camp_capacity() returns trigger language plpgsql as $$
begin
  if new.status = 'registered' then
    perform 1 from camps where id = new.camp_id for update;          -- serialize per camp
    if (select count(*) from camp_registrations
        where camp_id = new.camp_id and status = 'registered' and id <> new.id)
       >= (select capacity from camps where id = new.camp_id) then
      raise exception 'camp_full' using errcode = 'check_violation';
    end if;
  end if;
  return new;
end $$;
create trigger camp_capacity before insert or update of status on camp_registrations
  for each row execute function enforce_camp_capacity();

-- ───────────────────────────── classes (weekly, level-gated, pack-redeemed) ──
create table terms (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  starts_on  date not null,
  ends_on    date not null,
  check (ends_on > starts_on)
);

create table classes (                   -- the weekly template; occurrences are materialized sessions
  id                uuid primary key default gen_random_uuid(),
  term_id           uuid not null references terms(id),
  name              text not null,
  weekday           int  not null check (weekday between 1 and 7),   -- ISO
  start_time_local  time not null,       -- WALL-CLOCK; expansion converts per date (DST-correct)
  duration_minutes  int  not null check (duration_minutes in (90, 120)),
  capacity          int  not null check (capacity > 0),
  default_court_id  uuid references courts(id),
  default_coach_id  uuid references accounts(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create table class_skill_levels (          -- N: template defaults, copied onto each generated occurrence
  class_id        uuid not null references classes(id) on delete cascade,
  skill_level_id  uuid not null references skill_levels(id),
  primary key (class_id, skill_level_id)
);

create table class_sessions (
  session_id    uuid primary key,
  session_type  session_type not null default 'class' check (session_type = 'class'),
  class_id      uuid not null references classes(id) on delete cascade,
  foreign key (session_id, session_type) references sessions (id, session_type) on delete cascade
);

-- A: per-session redemption of scoped pack credits (replaces per-term enrollment)
create table class_bookings (
  id                    uuid primary key default gen_random_uuid(),
  class_session_id      uuid not null references class_sessions(session_id),
  player_id             uuid not null references players(id),
  booked_by_account_id  uuid not null references accounts(id),
  status                booking_status not null default 'booked',
  scope                 credit_scope not null,   -- derived from the session (trigger), academy TZ
  week_start            date not null,           -- ISO Monday, academy TZ (trigger)
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
-- one ACTIVE booking per player per occurrence (cancelled rows stay as history; re-booking is allowed)
create unique index uq_active_class_booking
  on class_bookings (class_session_id, player_id) where status in ('booked','waitlisted');
-- THE weekly cap: one booked class per scope per ISO week per player. Race-proof.
create unique index uq_one_class_per_scope_week
  on class_bookings (player_id, scope, week_start) where status = 'booked';
create index idx_class_bookings_session on class_bookings (class_session_id, status);

create function public.class_booking_derive() returns trigger language plpgsql as $$
declare st timestamptz;
begin
  select s.starts_at into st from sessions s where s.id = new.class_session_id;
  if st is null then raise exception 'unknown class session'; end if;
  new.scope := academy_scope(st);
  new.week_start := academy_week_start(st);
  return new;
end $$;
create trigger class_bookings_derive before insert on class_bookings
  for each row execute function class_booking_derive();

-- capacity per occurrence (lock the session row) + N: ball-level tag gate
create function public.enforce_class_booking() returns trigger language plpgsql as $$
declare v_cap int; v_level uuid;
begin
  if new.status = 'booked' then
    perform 1 from sessions where id = new.class_session_id for update;
    select c.capacity into v_cap
      from class_sessions cs join classes c on c.id = cs.class_id
      where cs.session_id = new.class_session_id;
    if (select count(*) from class_bookings
        where class_session_id = new.class_session_id and status = 'booked' and id <> new.id) >= v_cap then
      raise exception 'class_full' using errcode = 'check_violation';
    end if;
    if exists (select 1 from session_skill_levels where session_id = new.class_session_id) then
      select skill_level_id into v_level from players where id = new.player_id;
      if v_level is null then
        raise exception 'level_required: set the player''s ball level first' using errcode = 'check_violation';
      end if;
      if not exists (select 1 from session_skill_levels
                     where session_id = new.class_session_id and skill_level_id = v_level) then
        raise exception 'level_mismatch: this slot does not offer the player''s level' using errcode = 'check_violation';
      end if;
    end if;
  end if;
  return new;
end $$;
create trigger class_booking_rules before insert or update of status on class_bookings
  for each row execute function enforce_class_booking();

-- ───────────────────────────── team tennis (roster-based) ────────
create table teams (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  season       text not null,
  description  text,
  created_at   timestamptz not null default now(),
  unique (name, season)
);
create table team_members (
  team_id    uuid not null references teams(id) on delete cascade,
  player_id  uuid not null references players(id),
  joined_at  timestamptz not null default now(),
  left_at    timestamptz,
  primary key (team_id, player_id)
);
create table team_sessions (
  session_id    uuid primary key,
  session_type  session_type not null default 'team' check (session_type = 'team'),
  team_id       uuid not null references teams(id) on delete cascade,
  kind          team_session_kind not null default 'practice',
  opponent      text,
  home_away     text check (home_away in ('home','away')),
  foreign key (session_id, session_type) references sessions (id, session_type) on delete cascade,
  check (kind = 'match' or (opponent is null and home_away is null))
);

-- ───────────────────────────── private lessons (1:1, credit-consuming) ──
create table lesson_bookings (
  session_id            uuid primary key,
  session_type          session_type not null default 'private' check (session_type = 'private'),
  player_id             uuid not null references players(id),
  booked_by_account_id  uuid not null references accounts(id),
  status                booking_status not null default 'booked',
  credits_spent         int not null default 1 check (credits_spent > 0),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  foreign key (session_id, session_type) references sessions (id, session_type)
);

-- ───────────────────────────── attendance (coach + admin; correctable, audited) ──
create table session_attendance (
  session_id  uuid not null references sessions(id),
  player_id   uuid not null references players(id),
  present     boolean not null,
  marked_by   uuid not null references accounts(id),
  marked_at   timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (session_id, player_id)
);

-- ───────────────────────────── orders & Stripe ───────────────────
create table orders (
  id                          uuid primary key default gen_random_uuid(),
  account_id                  uuid not null references accounts(id),   -- guardians pay
  status                      order_status not null default 'pending',
  amount_total_cents          int not null default 0,
  currency                    char(3) not null default 'usd',
  stripe_checkout_session_id  text unique,
  stripe_payment_intent_id    text unique,
  created_at                  timestamptz not null default now(),
  paid_at                     timestamptz,
  updated_at                  timestamptz not null default now()
);
create table order_items (
  id                 uuid primary key default gen_random_uuid(),
  order_id           uuid not null references orders(id) on delete cascade,
  product_id         uuid not null references products(id),
  player_id          uuid not null references players(id),           -- the named beneficiary
  quantity           int not null default 1 check (quantity > 0),
  unit_amount_cents  int not null check (unit_amount_cents >= 0)
);
alter table camp_registrations add constraint camp_reg_order_item_fk
  foreign key (order_item_id) references order_items(id);

-- Webhook idempotency: insert-first on Stripe event id; duplicates/out-of-order deliveries no-op.
-- D: credits are issued only on payment_intent.succeeded (handler logic, phase 5).
create table stripe_events (
  id            text primary key,          -- 'evt_…'
  type          text not null,
  payload       jsonb not null,
  received_at   timestamptz not null default now(),
  processed_at  timestamptz,
  status        text not null default 'received' check (status in ('received','processed','skipped','error')),
  error         text
);

-- ───────────────────────────── credit ledger (append-only, lot-tracked) ──
create table credit_ledger (
  id                        uuid primary key default gen_random_uuid(),
  player_id                 uuid not null references players(id),     -- credits belong to a named player
  entry_type                ledger_entry_type not null,
  delta                     int not null check (delta <> 0),
  credit_kind               credit_kind not null,
  lot_id                    uuid references credit_ledger(id),        -- issuance row this row draws against
  order_item_id             uuid references order_items(id),
  stripe_payment_intent_id  text,
  booking_session_id        uuid references sessions(id),             -- consumed against (class or lesson)
  expires_at                timestamptz,                              -- issuance rows only
  forgiven_skips            int check (forgiven_skips >= 0),          -- issuance rows: L allowance snapshot
  idempotency_key           text not null unique,
  reason                    text,
  created_by                uuid references accounts(id),
  created_at                timestamptz not null default now(),
  check (case entry_type
    when 'purchase'         then delta > 0 and order_item_id is not null
    when 'adjust'           then true
    when 'consume'          then delta < 0 and lot_id is not null and booking_session_id is not null
    when 'consume_reversal' then delta > 0 and lot_id is not null
    when 'refund'           then delta < 0 and lot_id is not null
    when 'expire'           then delta < 0 and lot_id is not null
    when 'forgive'          then delta > 0 and lot_id is not null and booking_session_id is not null
  end),
  check (expires_at is null or entry_type in ('purchase','adjust')),
  check (forgiven_skips is null or entry_type in ('purchase','adjust'))
);
create index idx_ledger_player_kind on credit_ledger (player_id, credit_kind);
create index idx_ledger_lot on credit_ledger (lot_id);
-- "consumed exactly once per booking" and "forgiven at most once per booking" are guaranteed by
-- the idempotency_key convention, which names the BOOKING (not the session — a family may cancel and
-- re-book the same occurrence, producing a second, legitimate consume row):
--   consume:class_booking:{class_bookings.id}   consume:lesson:{session_id}
--   reverse:{consume.id}                        forgive:{consume.id}
create index idx_ledger_booking on credit_ledger (booking_session_id, player_id);

create function public.forbid_change() returns trigger language plpgsql as $$
begin raise exception '% is append-only', tg_table_name using errcode = 'insufficient_privilege'; end $$;
create trigger ledger_immutable before update or delete on credit_ledger
  for each row execute function forbid_change();
create trigger ledger_no_truncate before truncate on credit_ledger
  for each statement execute function forbid_change();

-- Balances are DERIVED. security_invoker: the reader's RLS applies through the view.
create view v_lot_remaining with (security_invoker = true) as
  select l.id as lot_id, l.player_id, l.credit_kind, l.expires_at, l.created_at as issued_at, l.delta as issued,
         l.delta + coalesce((select sum(c.delta) from credit_ledger c where c.lot_id = l.id), 0) as remaining
  from credit_ledger l
  where l.entry_type in ('purchase','adjust') and l.delta > 0;

create view v_credit_balances with (security_invoker = true) as
  select player_id, credit_kind,
         sum(remaining)::int as balance,
         min(expires_at) filter (where remaining > 0) as next_expiry
  from v_lot_remaining
  where expires_at is null or expires_at > now()
  group by player_id, credit_kind;

-- The ONE issuance path (Stripe webhook via service role, or admin grant). Validity =
-- product/academy days + 7 per forgiven skip, so a forgiven credit is actually usable.
create function public.issue_credits(p_player uuid, p_kind credit_kind, p_quantity int, p_idempotency_key text,
                                     p_product uuid default null, p_order_item uuid default null,
                                     p_stripe_pi text default null, p_reason text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_actor uuid := auth.uid(); v_validity int; v_forgive int; v_id uuid;
begin
  if v_actor is not null and not is_admin() then raise exception 'admin_only'; end if;
  if p_quantity <= 0 then raise exception 'quantity_positive' using errcode = 'check_violation'; end if;
  select coalesce(p.credit_validity_days, st.default_credit_validity_days),
         coalesce(p.forgiven_skips, st.default_forgiven_skips)
    into v_validity, v_forgive
    from academy_settings st left join products p on p.id = p_product;
  insert into credit_ledger (player_id, entry_type, delta, credit_kind, order_item_id, stripe_payment_intent_id,
                             expires_at, forgiven_skips, idempotency_key, reason, created_by)
  values (p_player, (case when p_order_item is null then 'adjust' else 'purchase' end)::ledger_entry_type, p_quantity, p_kind,
          p_order_item, p_stripe_pi, now() + make_interval(days => v_validity + 7 * v_forgive), v_forgive,
          p_idempotency_key, p_reason, v_actor)
  on conflict (idempotency_key) do nothing
  returning id into v_id;
  return v_id;                                        -- null = key already issued (webhook retry)
end $$;

-- earliest-expiring usable lot (FIFO by expiry)
create function public.pick_lot(p_player uuid, p_kind credit_kind) returns uuid
  language sql stable as $$
  select lot_id from v_lot_remaining
  where player_id = p_player and credit_kind = p_kind and remaining > 0
    and (expires_at is null or expires_at > now())
  order by expires_at nulls last, issued_at, lot_id limit 1 $$;

-- ───────────────────────────── waivers (versioned docs, immutable signatures) ──
-- F: barebones — one required document to start; the mechanism scales to N.
create table waiver_documents (
  id                          uuid primary key default gen_random_uuid(),
  slug                        text not null unique,
  title                       text not null,
  required_for_participation  boolean not null default true,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);
create table waiver_versions (
  id              uuid primary key default gen_random_uuid(),
  document_id     uuid not null references waiver_documents(id),
  version         int  not null,
  content_md      text not null,           -- FROM LEGAL; this system stores, never drafts
  content_sha256  text not null,
  published_at    timestamptz,             -- null = draft; publishing freezes the row
  created_by      uuid references accounts(id),
  created_at      timestamptz not null default now(),
  unique (document_id, version)
);
create trigger waiver_versions_frozen before update or delete on waiver_versions
  for each row when (old.published_at is not null) execute function forbid_change();

create table waiver_signatures (
  id                     uuid primary key default gen_random_uuid(),
  waiver_version_id      uuid not null references waiver_versions(id),   -- the exact text agreed to
  player_id              uuid not null references players(id),           -- covered player
  signer_account_id      uuid not null references accounts(id),          -- who signed
  capacity               signing_capacity not null,                      -- in what capacity
  signer_name_snapshot   text not null,
  relationship_snapshot  guardianship_role not null,
  signed_at              timestamptz not null default now(),
  ip                     inet,
  user_agent             text
);
create index idx_signatures_player on waiver_signatures (player_id, waiver_version_id);
create trigger signatures_immutable before update or delete on waiver_signatures
  for each row execute function forbid_change();

create view v_current_waiver_versions with (security_invoker = true) as
  select distinct on (document_id) id as waiver_version_id, document_id, version
  from waiver_versions
  where published_at is not null and published_at <= now()
  order by document_id, version desc;

-- a new version does NOT inherit old signatures — by construction
create view v_player_waiver_status with (security_invoker = true) as
  select p.id as player_id, d.id as document_id, d.slug, cv.waiver_version_id,
         exists (select 1 from waiver_signatures s
                 where s.player_id = p.id and s.waiver_version_id = cv.waiver_version_id) as satisfied
  from players p
  cross join waiver_documents d
  join v_current_waiver_versions cv on cv.document_id = d.id
  where d.required_for_participation;

create function public.assert_waivers_signed(p_player uuid) returns void language plpgsql stable as $$
begin
  if exists (select 1 from v_player_waiver_status where player_id = p_player and not satisfied) then
    raise exception 'waiver_required' using errcode = 'check_violation';
  end if;
end $$;

-- ───────────────────────────── ratings (history, configurable, visibility) ──
create table rating_dimensions (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,          -- seeded: court_placement (drives CourtMeter)
  label      text not null,
  scale_max  int  not null default 5 check (scale_max between 2 and 10),
  sort       int  not null default 0,
  active     boolean not null default true,
  updated_at timestamptz not null default now()
);
create table rating_events (
  id                  uuid primary key default gen_random_uuid(),
  player_id           uuid not null references players(id),
  dimension_id        uuid not null references rating_dimensions(id),
  value               int  not null check (value >= 1),
  scale_max_snapshot  int  not null,
  coach_id            uuid not null references accounts(id),
  visibility          rating_visibility not null default 'guardian',
  note                text,
  rated_at            timestamptz not null default now(),
  check (value <= scale_max_snapshot)
);
create index idx_ratings_player on rating_events (player_id, dimension_id, rated_at desc);
create function public.rating_snapshot_scale() returns trigger language plpgsql as $$
begin
  select scale_max into new.scale_max_snapshot from rating_dimensions where id = new.dimension_id;
  return new;
end $$;
create trigger rating_events_snapshot before insert on rating_events
  for each row execute function rating_snapshot_scale();
create trigger ratings_immutable before update or delete on rating_events
  for each row execute function forbid_change();

create view v_current_ratings with (security_invoker = true) as
  select distinct on (player_id, dimension_id) *
  from rating_events order by player_id, dimension_id, rated_at desc;

-- ───────────────────────────── notifications ─────────────────────
create table marketing_consents (          -- marketing is opt-in; NEVER routed through transactional sends
  account_id  uuid primary key references accounts(id) on delete cascade,
  subscribed  boolean not null default false,
  source      text,
  updated_at  timestamptz not null default now()
);
create table notification_sends (          -- overlapping crons: insert-first on trigger_key
  id                    uuid primary key default gen_random_uuid(),
  trigger_key           text not null unique,
  category              notify_category not null,
  recipient_account_id  uuid not null references accounts(id),
  player_id             uuid references players(id),
  template              text not null,
  status                send_status not null default 'pending',
  provider_message_id   text,
  created_at            timestamptz not null default now(),
  sent_at               timestamptz
);

-- ───────────────────────────── audit ─────────────────────────────
create table audit_log (
  id           uuid primary key default gen_random_uuid(),
  actor        uuid,
  action       text not null,
  entity_type  text not null,
  entity_id    uuid,
  before       jsonb,
  after        jsonb,
  at           timestamptz not null default now()
);
create index idx_audit_entity on audit_log (entity_type, entity_id, at desc);
create function public.audit_row() returns trigger
  language plpgsql security definer set search_path = public as $$
declare v_row jsonb;
begin
  v_row := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  insert into audit_log (actor, action, entity_type, entity_id, before, after)
  values (auth.uid(), tg_op, tg_table_name,
          case when (v_row->>'id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
               then (v_row->>'id')::uuid else null end,        -- non-uuid keys (settings singleton) → null
          case when tg_op = 'INSERT' then null else to_jsonb(old) end,
          case when tg_op = 'DELETE' then null else to_jsonb(new) end);
  return null;
end $$;
-- money, consent, schedule, ratings config, settings — who changed what, when
create trigger audit_products            after insert or update or delete on products            for each row execute function audit_row();
create trigger audit_orders              after insert or update or delete on orders              for each row execute function audit_row();
create trigger audit_guardianships       after insert or update or delete on guardianships       for each row execute function audit_row();
create trigger audit_players             after update on players                                 for each row execute function audit_row();
create trigger audit_waiver_documents    after insert or update or delete on waiver_documents    for each row execute function audit_row();
create trigger audit_waiver_versions     after insert or update or delete on waiver_versions     for each row execute function audit_row();
create trigger audit_sessions            after insert or update or delete on sessions            for each row execute function audit_row();
create trigger audit_court_availability  after insert or update or delete on court_availability  for each row execute function audit_row();
create trigger audit_availability_exc    after insert or update or delete on court_availability_exceptions for each row execute function audit_row();
create trigger audit_camp_registrations  after insert or update or delete on camp_registrations  for each row execute function audit_row();
create trigger audit_class_bookings      after insert or update or delete on class_bookings      for each row execute function audit_row();
create trigger audit_lesson_bookings     after insert or update or delete on lesson_bookings     for each row execute function audit_row();
create trigger audit_attendance          after insert or update or delete on session_attendance  for each row execute function audit_row();
create trigger audit_rating_dimensions   after insert or update or delete on rating_dimensions   for each row execute function audit_row();
create trigger audit_academy_settings    after update on academy_settings                        for each row execute function audit_row();

create function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;
create trigger touch_accounts       before update on accounts            for each row execute function set_updated_at();
create trigger touch_players        before update on players             for each row execute function set_updated_at();
create trigger touch_products       before update on products            for each row execute function set_updated_at();
create trigger touch_sessions       before update on sessions            for each row execute function set_updated_at();
create trigger touch_classes        before update on classes             for each row execute function set_updated_at();
create trigger touch_class_bookings before update on class_bookings      for each row execute function set_updated_at();
create trigger touch_lesson_bookings before update on lesson_bookings    for each row execute function set_updated_at();
create trigger touch_camp_regs      before update on camp_registrations  for each row execute function set_updated_at();
create trigger touch_orders         before update on orders              for each row execute function set_updated_at();
create trigger touch_attendance     before update on session_attendance  for each row execute function set_updated_at();

-- ───────────────────────────── RPCs (SECURITY DEFINER — the only write path for money/consent) ──
create function public.create_player(p_full_name text, p_birthdate date, p_role guardianship_role,
                                     p_skill_level_key text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_account uuid := auth.uid(); v_player uuid; v_level uuid;
begin
  if v_account is null then raise exception 'not_authenticated'; end if;
  if p_role = 'self' and p_birthdate > (academy_local(now())::date - interval '18 years')::date then
    raise exception 'minor_self_link' using errcode = 'check_violation';
  end if;
  if p_skill_level_key is not null then
    select id into v_level from skill_levels where key = p_skill_level_key and active;
    if v_level is null then raise exception 'unknown_skill_level: %', p_skill_level_key using errcode = 'check_violation'; end if;
  end if;
  insert into players (full_name, birthdate, skill_level_id) values (btrim(p_full_name), p_birthdate, v_level)
  returning id into v_player;
  insert into guardianships (account_id, player_id, role) values (v_account, v_player, p_role);
  return v_player;
end $$;

-- M: progression is the academy's call — staff move players between levels (audited on players)
create function public.set_player_level(p_player uuid, p_skill_level_key text)
returns void language plpgsql security definer set search_path = public as $$
declare v_level uuid;
begin
  if not is_staff() then raise exception 'staff_only'; end if;
  select id into v_level from skill_levels where key = p_skill_level_key and active;
  if v_level is null then raise exception 'unknown_skill_level: %', p_skill_level_key using errcode = 'check_violation'; end if;
  update players set skill_level_id = v_level where id = p_player;
end $$;

create function public.sign_waiver(p_version uuid, p_player uuid, p_typed_name text,
                                   p_ip inet default null, p_user_agent text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_account uuid := auth.uid(); v_role guardianship_role; v_cap signing_capacity; v_id uuid;
begin
  if v_account is null then raise exception 'not_authenticated'; end if;
  if not exists (select 1 from v_current_waiver_versions where waiver_version_id = p_version) then
    raise exception 'not_current_version' using errcode = 'check_violation';
  end if;
  if coalesce(btrim(p_typed_name), '') = '' then raise exception 'name_required' using errcode = 'check_violation'; end if;
  select g.role into v_role from guardianships g
   where g.account_id = v_account and g.player_id = p_player and g.ended_at is null
   order by case g.role when 'self' then 0 else 1 end limit 1;
  if v_role is null then raise exception 'not_authorized'; end if;
  if v_role = 'self' then
    if not player_is_adult(p_player) then raise exception 'minor_cannot_self_sign' using errcode = 'check_violation'; end if;
    v_cap := 'self';
  elsif v_role in ('parent','legal_guardian') then
    v_cap := 'guardian';
  else
    raise exception 'not_authorized: % may not sign', v_role;
  end if;
  insert into waiver_signatures (waiver_version_id, player_id, signer_account_id, capacity,
                                 signer_name_snapshot, relationship_snapshot, ip, user_agent)
  values (p_version, p_player, v_account, v_cap, btrim(p_typed_name), v_role, p_ip, p_user_agent)
  returning id into v_id;
  return v_id;
end $$;

-- A/I/K: book one class occurrence with a scoped credit; full → waitlist (holds nothing)
create function public.book_class(p_player uuid, p_session uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_account uuid := auth.uid(); v_s record; v_kind credit_kind; v_lot uuid; v_booking uuid;
        v_horizon int; v_booked int; v_constraint text;
begin
  if v_account is null then raise exception 'not_authenticated'; end if;
  if not guards(p_player) then raise exception 'not_authorized'; end if;
  perform assert_waivers_signed(p_player);
  select se.id, se.starts_at, se.status, c.capacity into v_s
    from sessions se join class_sessions cs on cs.session_id = se.id join classes c on c.id = cs.class_id
   where se.id = p_session;
  if v_s.id is null then raise exception 'unknown_session'; end if;
  if v_s.status <> 'scheduled' or v_s.starts_at <= now() then
    raise exception 'session_not_bookable' using errcode = 'check_violation';
  end if;
  select booking_horizon_days into v_horizon from academy_settings;
  if v_s.starts_at > now() + make_interval(days => v_horizon) then
    raise exception 'beyond_booking_horizon' using errcode = 'check_violation';
  end if;
  if exists (select 1 from class_bookings where class_session_id = p_session and player_id = p_player
             and status in ('booked','waitlisted')) then
    raise exception 'already_booked' using errcode = 'check_violation';
  end if;
  v_kind := case academy_scope(v_s.starts_at) when 'weekend' then 'class_weekend' else 'class_weekday' end;
  perform pg_advisory_xact_lock(hashtextextended(p_player::text, 42));   -- serialize this player's spend
  v_lot := pick_lot(p_player, v_kind);
  if v_lot is null then raise exception 'insufficient_credits: %', v_kind using errcode = 'check_violation'; end if;
  perform 1 from sessions where id = p_session for update;               -- serialize capacity per session
  select count(*) into v_booked from class_bookings where class_session_id = p_session and status = 'booked';
  if v_booked >= v_s.capacity then
    insert into class_bookings (class_session_id, player_id, booked_by_account_id, status)
    values (p_session, p_player, v_account, 'waitlisted') returning id into v_booking;
    return v_booking;
  end if;
  begin
    insert into class_bookings (class_session_id, player_id, booked_by_account_id, status)
    values (p_session, p_player, v_account, 'booked') returning id into v_booking;
  exception when unique_violation then
    get stacked diagnostics v_constraint = constraint_name;
    if v_constraint = 'uq_active_class_booking' then
      raise exception 'already_booked' using errcode = 'check_violation';
    end if;
    raise exception 'weekly_cap: one % class per week', academy_scope(v_s.starts_at) using errcode = 'check_violation';
  end;
  insert into credit_ledger (player_id, entry_type, delta, credit_kind, lot_id, booking_session_id, idempotency_key, created_by)
  values (p_player, 'consume', -1, v_kind, v_lot, p_session, 'consume:class_booking:' || v_booking, v_account);
  return v_booking;
end $$;

-- private lesson: coach + court + time inside lesson-bookable availability; EXCLUDE is the arbiter
create function public.book_private_lesson(p_player uuid, p_coach uuid, p_court uuid,
                                           p_starts timestamptz, p_ends timestamptz, p_credits int default 1)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_account uuid := auth.uid(); v_session uuid; v_lot uuid; v_horizon int; v_remaining int;
begin
  if v_account is null then raise exception 'not_authenticated'; end if;
  if not guards(p_player) then raise exception 'not_authorized'; end if;
  perform assert_waivers_signed(p_player);
  if p_starts <= now() then raise exception 'session_not_bookable' using errcode = 'check_violation'; end if;
  select booking_horizon_days into v_horizon from academy_settings;
  if p_starts > now() + make_interval(days => v_horizon) then
    raise exception 'beyond_booking_horizon' using errcode = 'check_violation';
  end if;
  if not exists (select 1 from staff_members where account_id = p_coach and role = 'coach') then
    raise exception 'not_a_coach' using errcode = 'check_violation';
  end if;
  if not court_available(p_court, p_starts, p_ends, true) then
    raise exception 'slot_not_bookable' using errcode = 'check_violation';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_player::text, 42));
  v_lot := pick_lot(p_player, 'private_lesson');
  if v_lot is null then raise exception 'insufficient_credits: private_lesson' using errcode = 'check_violation'; end if;
  select remaining into v_remaining from v_lot_remaining where lot_id = v_lot;
  if v_remaining < p_credits then                      -- v1: a booking spends from a single lot
    raise exception 'insufficient_credits: private_lesson' using errcode = 'check_violation';
  end if;
  begin
    insert into sessions (session_type, starts_at, ends_at, court_id, coach_id)
    values ('private', p_starts, p_ends, p_court, p_coach) returning id into v_session;
  exception when exclusion_violation then
    raise exception 'slot_taken' using errcode = 'check_violation';
  end;
  insert into lesson_bookings (session_id, player_id, booked_by_account_id, credits_spent)
  values (v_session, p_player, v_account, p_credits);
  insert into credit_ledger (player_id, entry_type, delta, credit_kind, lot_id, booking_session_id, idempotency_key, created_by)
  values (p_player, 'consume', -p_credits, 'private_lesson', v_lot, v_session, 'consume:lesson:' || v_session, v_account);
  return v_session;
end $$;

-- L: the first forfeited class per package (late cancel or no-show) is forgiven — credit returned
create function public.apply_forgiveness(p_booking uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare b record; c record; v_allow int; v_used int;
begin
  select id, player_id, class_session_id, status into b from class_bookings where id = p_booking;
  if b.id is null or b.status not in ('cancelled_late','no_show') then return false; end if;
  perform pg_advisory_xact_lock(hashtextextended(b.player_id::text, 42));
  select * into c from credit_ledger where idempotency_key = 'consume:class_booking:' || b.id;
  if c.id is null then return false; end if;
  select coalesce(l.forgiven_skips, st.default_forgiven_skips) into v_allow
    from credit_ledger l cross join academy_settings st where l.id = c.lot_id;
  select count(*) into v_used from credit_ledger where lot_id = c.lot_id and entry_type = 'forgive';
  if v_used >= v_allow then return false; end if;
  insert into credit_ledger (player_id, entry_type, delta, credit_kind, lot_id, booking_session_id,
                             idempotency_key, reason)
  values (b.player_id, 'forgive', -c.delta, c.credit_kind, c.lot_id, b.class_session_id,
          'forgive:' || c.id, 'skipped week forgiven (' || b.status || ')')
  on conflict (idempotency_key) do nothing;
  return true;
end $$;

-- cron: once a session has ended, settle its bookings from attendance (absent → no_show → forgiveness check)
create function public.finalize_bookings(p_ended_before timestamptz default now() - interval '1 hour')
returns int language plpgsql security definer set search_path = public as $$
declare r record; n int := 0; v_new booking_status;
begin
  if auth.uid() is not null and not is_staff() then raise exception 'staff_only'; end if;
  for r in select cb.id, cb.player_id, cb.class_session_id as session_id, a.present
             from class_bookings cb join sessions s on s.id = cb.class_session_id
             left join session_attendance a on a.session_id = s.id and a.player_id = cb.player_id
            where cb.status = 'booked' and s.status = 'scheduled' and s.ends_at <= p_ended_before loop
    v_new := case when r.present is false then 'no_show'::booking_status else 'completed'::booking_status end;
    update class_bookings set status = v_new where id = r.id;
    if v_new = 'no_show' then perform apply_forgiveness(r.id); end if;
    n := n + 1;
  end loop;
  for r in select lb.session_id, a.present
             from lesson_bookings lb join sessions s on s.id = lb.session_id
             left join session_attendance a on a.session_id = s.id and a.player_id = lb.player_id
            where lb.status = 'booked' and s.status = 'scheduled' and s.ends_at <= p_ended_before loop
    update lesson_bookings set status = case when r.present is false then 'no_show'::booking_status else 'completed'::booking_status end
     where session_id = r.session_id;
    n := n + 1;
  end loop;
  return n;
end $$;

-- C: cancel with ≥ notice (or by the academy) → credit reversal; late → forfeit (L: first forfeit per package forgiven). Frees the weekly cap.
create function public.cancel_booking(p_kind text, p_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_account uuid := auth.uid(); v_player uuid; v_session uuid; v_status booking_status;
        v_starts timestamptz; v_notice int; v_new booking_status; v_by_academy boolean; v_consume record;
        v_forgiven boolean := false;
begin
  if v_account is null then raise exception 'not_authenticated'; end if;
  if p_kind = 'class' then
    select player_id, class_session_id, status into v_player, v_session, v_status from class_bookings where id = p_id;
  elsif p_kind = 'lesson' then
    select player_id, session_id, status into v_player, v_session, v_status from lesson_bookings where session_id = p_id;
  else
    raise exception 'unknown_kind';
  end if;
  if v_player is null then raise exception 'unknown_booking'; end if;
  v_by_academy := is_staff();
  if not v_by_academy and not guards(v_player) then raise exception 'not_authorized'; end if;
  if v_status not in ('booked','waitlisted') then
    raise exception 'not_cancellable: %', v_status using errcode = 'check_violation';
  end if;
  select starts_at into v_starts from sessions where id = v_session;
  select cancel_notice_hours into v_notice from academy_settings;
  v_new := case
    when v_status = 'waitlisted' then 'cancelled'::booking_status
    when v_by_academy then 'cancelled_by_academy'::booking_status
    when v_starts - now() >= make_interval(hours => v_notice) then 'cancelled'::booking_status
    else 'cancelled_late'::booking_status end;
  if p_kind = 'class' then
    update class_bookings set status = v_new where id = p_id;
    if v_new = 'cancelled_late' then v_forgiven := apply_forgiveness(p_id); end if;
  else
    update lesson_bookings set status = v_new where session_id = p_id;
    update sessions set status = 'cancelled' where id = v_session;   -- free the court + coach
  end if;
  if v_status = 'booked' and v_new in ('cancelled','cancelled_by_academy') then
    select * into v_consume from credit_ledger
     where idempotency_key = case when p_kind = 'class' then 'consume:class_booking:' || p_id
                                  else 'consume:lesson:' || v_session end;
    if v_consume.id is not null then
      insert into credit_ledger (player_id, entry_type, delta, credit_kind, lot_id, booking_session_id,
                                 idempotency_key, created_by, reason)
      values (v_player, 'consume_reversal', -v_consume.delta, v_consume.credit_kind, v_consume.lot_id,
              v_session, 'reverse:' || v_consume.id, v_account, v_new::text)
      on conflict (idempotency_key) do nothing;
    end if;
  end if;
  return jsonb_build_object('status', v_new, 'forgiven', v_forgiven);
end $$;

-- rainout / venue loss: academy cancels a whole session; every booked player is made whole
create function public.cancel_session(p_session uuid, p_reason text default null)
returns int language plpgsql security definer set search_path = public as $$
declare r record; n int := 0;
begin
  if not is_staff() then raise exception 'staff_only'; end if;
  update sessions set status = 'cancelled', notes = coalesce(p_reason, notes) where id = p_session and status = 'scheduled';
  for r in select id from class_bookings where class_session_id = p_session and status in ('booked','waitlisted') loop
    perform cancel_booking('class', r.id); n := n + 1;
  end loop;
  if exists (select 1 from lesson_bookings where session_id = p_session and status in ('booked','waitlisted')) then
    perform cancel_booking('lesson', p_session); n := n + 1;
  end if;
  return n;
end $$;

-- K: promote waitlisted players in order; each must pass credits + cap + capacity at promotion time
create function public.promote_waitlist(p_session uuid)
returns int language plpgsql security definer set search_path = public as $$
declare r record; n int := 0; v_kind credit_kind; v_lot uuid; v_cap int; v_booked int; v_starts timestamptz;
begin
  if auth.uid() is not null and not is_staff() then raise exception 'staff_only'; end if;
  select starts_at into v_starts from sessions where id = p_session and status = 'scheduled';
  if v_starts is null then return 0; end if;
  v_kind := case academy_scope(v_starts) when 'weekend' then 'class_weekend' else 'class_weekday' end;
  select c.capacity into v_cap from class_sessions cs join classes c on c.id = cs.class_id where cs.session_id = p_session;
  for r in select id, player_id from class_bookings
           where class_session_id = p_session and status = 'waitlisted' order by created_at loop
    select count(*) into v_booked from class_bookings where class_session_id = p_session and status = 'booked';
    exit when v_booked >= v_cap;
    begin
      perform pg_advisory_xact_lock(hashtextextended(r.player_id::text, 42));
      v_lot := pick_lot(r.player_id, v_kind);
      if v_lot is not null then
        update class_bookings set status = 'booked' where id = r.id;
        insert into credit_ledger (player_id, entry_type, delta, credit_kind, lot_id, booking_session_id, idempotency_key)
        values (r.player_id, 'consume', -1, v_kind, v_lot, p_session, 'consume:class_booking:' || r.id);
        n := n + 1;
      end if;
    exception when unique_violation or check_violation then
      null;                                            -- cap/capacity refused: stays waitlisted
    end;
  end loop;
  return n;
end $$;

-- admin: materialize a class template into sessions; occurrences without a reserved court are skipped and reported
create function public.generate_class_sessions(p_class uuid, p_from date, p_to date)
returns jsonb language plpgsql security definer set search_path = public as $$
declare c classes%rowtype; tz text; d date; sid uuid; created int := 0; skipped date[] := '{}';
begin
  if not is_admin() then raise exception 'admin_only'; end if;
  select * into c from classes where id = p_class;
  if c.id is null then raise exception 'unknown_class'; end if;
  tz := academy_tz();
  d := p_from;
  while d <= p_to loop
    if extract(isodow from d)::int = c.weekday then
      begin
        insert into sessions (session_type, starts_at, ends_at, court_id, coach_id)
        values ('class',
                ((d + c.start_time_local) at time zone tz),                                       -- local → UTC per date
                ((d + c.start_time_local) at time zone tz) + make_interval(mins => c.duration_minutes),
                c.default_court_id, c.default_coach_id)
        returning id into sid;
        insert into class_sessions (session_id, class_id) values (sid, c.id);
        insert into session_skill_levels (session_id, skill_level_id)
          select sid, skill_level_id from class_skill_levels where class_id = c.id;
        created := created + 1;
      exception when check_violation or exclusion_violation then
        skipped := skipped || d;
      end;
    end if;
    d := d + 1;
  end loop;
  return jsonb_build_object('created', created, 'skipped', to_jsonb(skipped));
end $$;

-- cron (service role): write expiry rows for lots past their validity
create function public.expire_credits()
returns int language plpgsql security definer set search_path = public as $$
declare r record; n int := 0;
begin
  if auth.uid() is not null and not is_admin() then raise exception 'admin_only'; end if;
  for r in select lot_id, player_id, credit_kind, remaining from v_lot_remaining
           where remaining > 0 and expires_at is not null and expires_at <= now() loop
    insert into credit_ledger (player_id, entry_type, delta, credit_kind, lot_id, idempotency_key, reason)
    values (r.player_id, 'expire', -r.remaining, r.credit_kind, r.lot_id, 'expire:lot:' || r.lot_id, 'validity window ended')
    on conflict (idempotency_key) do nothing;
    n := n + 1;
  end loop;
  return n;
end $$;

-- ───────────────────────────── row-level security ────────────────
alter table academy_settings              enable row level security;
alter table accounts                      enable row level security;
alter table staff_members                 enable row level security;
alter table skill_levels                  enable row level security;
alter table players                       enable row level security;
alter table guardianships                 enable row level security;
alter table locations                     enable row level security;
alter table courts                        enable row level security;
alter table court_availability            enable row level security;
alter table court_availability_exceptions enable row level security;
alter table products                      enable row level security;
alter table sessions                      enable row level security;
alter table session_skill_levels          enable row level security;
alter table class_skill_levels            enable row level security;
alter table camps                         enable row level security;
alter table camp_sessions                 enable row level security;
alter table camp_registrations            enable row level security;
alter table terms                         enable row level security;
alter table classes                       enable row level security;
alter table class_sessions                enable row level security;
alter table class_bookings                enable row level security;
alter table teams                         enable row level security;
alter table team_members                  enable row level security;
alter table team_sessions                 enable row level security;
alter table lesson_bookings               enable row level security;
alter table session_attendance            enable row level security;
alter table orders                        enable row level security;
alter table order_items                   enable row level security;
alter table stripe_events                 enable row level security;
alter table credit_ledger                 enable row level security;
alter table waiver_documents              enable row level security;
alter table waiver_versions               enable row level security;
alter table waiver_signatures             enable row level security;
alter table rating_dimensions             enable row level security;
alter table rating_events                 enable row level security;
alter table marketing_consents            enable row level security;
alter table notification_sends            enable row level security;
alter table audit_log                     enable row level security;

-- public reference data (anon may read: the public site renders the schedule)
create policy read_settings   on academy_settings for select to anon, authenticated using (true);
create policy read_levels     on skill_levels     for select to anon, authenticated using (true);
create policy read_locations  on locations        for select to anon, authenticated using (true);
create policy read_courts     on courts           for select to anon, authenticated using (true);
create policy read_products   on products         for select to anon, authenticated using (active or is_staff());
create policy read_sessions   on sessions         for select to anon, authenticated using (status = 'scheduled' or is_staff());
create policy read_session_levels on session_skill_levels for select to anon, authenticated using (true);
create policy read_class_levels   on class_skill_levels   for select to anon, authenticated using (true);
create policy read_camps      on camps            for select to anon, authenticated using (true);
create policy read_camp_sess  on camp_sessions    for select to anon, authenticated using (true);
create policy read_terms      on terms            for select to anon, authenticated using (true);
create policy read_classes    on classes          for select to anon, authenticated using (true);
create policy read_class_sess on class_sessions   for select to anon, authenticated using (true);
create policy read_teams      on teams            for select to anon, authenticated using (true);
create policy read_team_sess  on team_sessions    for select to anon, authenticated using (true);
create policy read_waiver_docs on waiver_documents for select to anon, authenticated using (true);
create policy read_waiver_versions on waiver_versions for select to anon, authenticated using (published_at is not null or is_admin());
create policy read_rating_dims on rating_dimensions for select to authenticated using (true);

-- admin manages reference data + schedule directly (server-guarded routes; RLS underneath)
create policy admin_settings   on academy_settings              for update to authenticated using (is_admin()) with check (is_admin());
create policy admin_staff      on staff_members                 for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_levels     on skill_levels                  for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_locations  on locations                     for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_courts     on courts                        for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_avail      on court_availability            for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_avail_exc  on court_availability_exceptions for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_products   on products                      for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_sessions   on sessions                      for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_session_levels on session_skill_levels      for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_class_levels   on class_skill_levels        for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_camps      on camps                         for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_camp_sess  on camp_sessions                 for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_camp_regs  on camp_registrations            for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_terms      on terms                         for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_classes    on classes                       for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_class_sess on class_sessions                for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_teams      on teams                         for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_team_members on team_members                for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_team_sess  on team_sessions                 for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_waiver_docs on waiver_documents             for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_waiver_versions on waiver_versions          for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_rating_dims on rating_dimensions            for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_stripe_events on stripe_events              for select to authenticated using (is_admin());
create policy admin_audit      on audit_log                     for select to authenticated using (is_admin());
create policy admin_sends      on notification_sends            for select to authenticated using (is_admin());

-- staff visibility (coaches + admin)
create policy staff_read_avail     on court_availability            for select to authenticated using (is_staff());
create policy staff_read_avail_exc on court_availability_exceptions for select to authenticated using (is_staff());
create policy staff_read_staff     on staff_members                 for select to authenticated using (true);

-- families: the guardianship scope is the hard case
create policy own_account       on accounts       for select to authenticated using (id = auth.uid() or is_staff());
create policy own_account_edit  on accounts       for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy read_players      on players        for select to authenticated using (is_staff() or guards(id));
create policy read_guardianships on guardianships for select to authenticated using (account_id = auth.uid() or is_staff());
create policy read_camp_regs    on camp_registrations for select to authenticated using (is_staff() or guards(player_id));
create policy read_class_bookings on class_bookings   for select to authenticated using (is_staff() or guards(player_id));
create policy read_lesson_bookings on lesson_bookings for select to authenticated using (is_staff() or guards(player_id));
create policy read_team_members on team_members   for select to authenticated using (is_staff() or guards(player_id));
create policy read_attendance   on session_attendance for select to authenticated using (is_staff() or guards(player_id));
create policy staff_mark_attendance on session_attendance for insert to authenticated with check (is_staff() and marked_by = auth.uid());
create policy staff_fix_attendance  on session_attendance for update to authenticated using (is_staff()) with check (is_staff());
-- money: guardians (and adult selves) only — a minor's own login sees nothing here
create policy read_orders       on orders         for select to authenticated using (account_id = auth.uid() or is_admin());
create policy read_order_items  on order_items    for select to authenticated
  using (is_admin() or exists (select 1 from orders o where o.id = order_id and o.account_id = auth.uid()));
create policy read_ledger       on credit_ledger  for select to authenticated using (is_admin() or can_view_financials(player_id));
-- consent
create policy read_signatures   on waiver_signatures for select to authenticated
  using (is_staff() or signer_account_id = auth.uid() or guards(player_id));
-- ratings: coaches write; families see only guardian-visible events
create policy read_ratings      on rating_events  for select to authenticated
  using (is_staff() or (visibility = 'guardian' and guards(player_id)));
create policy coach_rate        on rating_events  for insert to authenticated with check (is_staff() and coach_id = auth.uid());
-- marketing preference: own row
create policy own_marketing     on marketing_consents for all to authenticated
  using (account_id = auth.uid() or is_admin()) with check (account_id = auth.uid() or is_admin());
-- deliberately NO insert/update/delete policies on: players, guardianships, class_bookings,
-- lesson_bookings, credit_ledger, waiver_signatures, orders, order_items, stripe_events,
-- notification_sends, audit_log — written only by SECURITY DEFINER RPCs, triggers, or the service role.

-- ───────────────────────────── function grants ───────────────────
revoke execute on all functions in schema public from public, anon;
grant execute on function public.create_player(text, date, guardianship_role, text)           to authenticated;
grant execute on function public.set_player_level(uuid, text)                                   to authenticated;
grant execute on function public.sign_waiver(uuid, uuid, text, inet, text)                      to authenticated;
grant execute on function public.book_class(uuid, uuid)                                         to authenticated;
grant execute on function public.book_private_lesson(uuid, uuid, uuid, timestamptz, timestamptz, int) to authenticated;
grant execute on function public.cancel_booking(text, uuid)                                     to authenticated;
grant execute on function public.cancel_session(uuid, text)                                     to authenticated;
grant execute on function public.promote_waitlist(uuid)                                         to authenticated, service_role;
grant execute on function public.generate_class_sessions(uuid, date, date)                      to authenticated;
grant execute on function public.expire_credits()                                               to service_role;
grant execute on function public.finalize_bookings(timestamptz)                                 to authenticated, service_role;
grant execute on function public.issue_credits(uuid, credit_kind, int, text, uuid, uuid, text, text) to authenticated, service_role;
grant execute on function public.court_available(uuid, timestamptz, timestamptz, boolean)       to anon, authenticated;
grant execute on function public.academy_tz()                                                   to anon, authenticated;
grant execute on function public.academy_local(timestamptz)                                     to anon, authenticated;
grant execute on function public.academy_week_start(timestamptz)                                to anon, authenticated;
grant execute on function public.academy_scope(timestamptz)                                     to anon, authenticated;
grant execute on function public.is_admin()                                                     to anon, authenticated;
grant execute on function public.is_staff()                                                     to anon, authenticated;
grant execute on function public.guards(uuid)                                                   to authenticated;
grant execute on function public.player_is_adult(uuid, timestamptz)                             to authenticated;
grant execute on function public.can_view_financials(uuid)                                      to authenticated;

-- ───────────────────────────── reference seed (moves to supabase/seed.sql in phase 0) ──
insert into skill_levels (key, label, rank) values
  ('orange','Orange ball',1),
  ('green_beginner','Green ball · beginner',2), ('green_intermediate','Green ball · intermediate',3), ('green_advanced','Green ball · advanced',4),
  ('yellow_intermediate','Yellow ball · intermediate',5), ('yellow_advanced','Yellow ball · advanced',6);
insert into locations (name) values ('De Anza College'), ('Murdock Park');
insert into rating_dimensions (key, label, scale_max, sort) values ('court_placement','Court placement',5,0);
insert into waiver_documents (slug, title) values ('liability','Participation waiver');   -- F: one document; text FROM LEGAL
