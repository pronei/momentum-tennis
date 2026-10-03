-- ═══════════════════════════════════════════════════════════════════════════
-- Momentum Tennis — 0010: JTT scorecards (phase 10)
--
-- A USTA Junior Team Tennis match as the paper scorecard records it: one card,
-- exactly eight lines (#1–#4 singles, #1–#4 doubles), games per side and a
-- result per line. Staff write it on court; a final card exports to the
-- TennisLink automation. Families never see it. Which round a line plays in is
-- a function of the card's format and is derived by the app, never stored.
--
--   • scorecards — the header the card prints, Momentum's side, the format,
--     the set length, draft or final, who finalized it and when;
--   • scorecard_lines — seeded eight at a time by a trigger, so a card can
--     never have seven or nine; no insert or delete policy exists for them;
--   • finalize_scorecard — the gate: draft → final only when the match id and
--     every line are complete, raising scorecard_incomplete otherwise;
--   • RLS: staff read and write drafts; only an admin changes a final card.
-- ═══════════════════════════════════════════════════════════════════════════

create type scorecard_format as enum ('two_court', 'three_court');
create type scorecard_status as enum ('draft', 'final');
create type line_result      as enum ('completed', 'timed', 'retired', 'default', 'double_default');

create table scorecards (
  id                  uuid primary key default gen_random_uuid(),
  team_id             uuid not null references teams(id),
  session_id          uuid unique references sessions(id),      -- the scheduled match, when there is one
  match_id            text check (match_id ~ '^\d+$'),          -- USTA's id; required to finalize
  played_on           date not null,                            -- what the card prints, not a scheduling instant
  start_time          time,
  division            text not null default '',
  home_team           text not null,
  away_team           text not null,
  location            text not null default '',
  momentum_side       text not null check (momentum_side in ('home', 'away')),
  format              scorecard_format not null,
  set_games           smallint not null check (set_games in (4, 6)),
  status              scorecard_status not null default 'draft',
  home_sportsmanship  text,
  away_sportsmanship  text,
  notes               text,
  created_by          uuid not null references accounts(id),
  finalized_at        timestamptz,
  finalized_by        uuid references accounts(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create unique index scorecards_match_id_key on scorecards (match_id) where match_id is not null;
create index idx_scorecards_team on scorecards (team_id, played_on desc);

create table scorecard_lines (
  id                 uuid primary key default gen_random_uuid(),
  scorecard_id       uuid not null references scorecards(id) on delete cascade,
  position           text not null check (position in ('1S','2S','3S','4S','1D','2D','3D','4D')),
  home_player1_id    uuid references players(id),              -- set when a typed name matched one roster player
  home_player1_name  text not null default '',
  home_player2_id    uuid references players(id),
  home_player2_name  text not null default '',
  away_player1_id    uuid references players(id),
  away_player1_name  text not null default '',
  away_player2_id    uuid references players(id),
  away_player2_name  text not null default '',
  home_games         smallint check (home_games between 0 and 7),
  away_games         smallint check (away_games between 0 and 7),
  result             line_result,                              -- null until chosen or derived
  winner             text check (winner in ('home', 'away')),
  updated_at         timestamptz not null default now(),
  unique (scorecard_id, position),
  check ((home_games is null) = (away_games is null)),
  -- a singles line has one player a side
  check (position not like '%S'
         or (home_player2_id is null and home_player2_name = '' and away_player2_id is null and away_player2_name = '')),
  -- a double default records nothing; a played result records games and a winner; a default names its winner
  check (result is distinct from 'double_default' or (winner is null and home_games is null)),
  check (result is null or result not in ('completed', 'timed', 'retired') or (home_games is not null and winner is not null)),
  check (result is distinct from 'default' or winner is not null)
);

-- Exactly eight lines, by construction. Security definer: lines have no insert policy.
create function public.seed_scorecard_lines() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  insert into scorecard_lines (scorecard_id, position)
  select new.id, p from unnest(array['1S','2S','3S','4S','1D','2D','3D','4D']) as p;
  return new;
end $$;
create trigger scorecard_seed_lines after insert on scorecards
  for each row execute function seed_scorecard_lines();

-- The gate. Runs as the caller: staff can read the lines it checks.
create function public.finalize_scorecard() returns trigger
  language plpgsql set search_path = public as $$
declare l record; v_two boolean;
begin
  if old.status = 'final' and new.status = 'draft' then
    new.finalized_at := null;
    new.finalized_by := null;
    return new;
  end if;
  if not (old.status = 'draft' and new.status = 'final') then return new; end if;
  if new.match_id is null then
    raise exception 'scorecard_incomplete: the USTA match id is missing' using errcode = 'check_violation';
  end if;
  for l in select * from scorecard_lines where scorecard_id = new.id order by position loop
    v_two := l.position like '%D';
    if l.result is null then
      raise exception 'scorecard_incomplete: % has no result', l.position using errcode = 'check_violation';
    end if;
    if l.result in ('completed', 'timed', 'retired') then
      if l.home_player1_name = '' or l.away_player1_name = ''
         or (v_two and (l.home_player2_name = '' or l.away_player2_name = '')) then
        raise exception 'scorecard_incomplete: % is missing a player name', l.position using errcode = 'check_violation';
      end if;
    elsif l.result = 'default' then
      if (l.winner = 'home' and (l.home_player1_name = '' or (v_two and l.home_player2_name = '')))
         or (l.winner = 'away' and (l.away_player1_name = '' or (v_two and l.away_player2_name = ''))) then
        raise exception 'scorecard_incomplete: % names nobody on the winning side', l.position using errcode = 'check_violation';
      end if;
    end if;
  end loop;
  new.finalized_at := now();
  new.finalized_by := auth.uid();
  return new;
end $$;
create trigger scorecard_finalize before update of status on scorecards
  for each row execute function finalize_scorecard();

create trigger touch_scorecards      before update on scorecards      for each row execute function set_updated_at();
create trigger touch_scorecard_lines before update on scorecard_lines for each row execute function set_updated_at();
create trigger audit_scorecards      after insert or update or delete on scorecards      for each row execute function audit_row();
create trigger audit_scorecard_lines after insert or update or delete on scorecard_lines for each row execute function audit_row();

-- ── RLS: staff only; drafts are theirs to change, final cards an admin's ──
alter table scorecards      enable row level security;
alter table scorecard_lines enable row level security;
create policy staff_read_scorecards   on scorecards for select to authenticated using (is_staff());
create policy staff_insert_scorecards on scorecards for insert to authenticated
  with check (is_staff() and created_by = auth.uid());
create policy staff_update_scorecards on scorecards for update to authenticated
  using (is_staff() and (status = 'draft' or is_admin())) with check (is_staff());
create policy admin_delete_scorecards on scorecards for delete to authenticated
  using (is_admin() and status = 'draft');
create policy staff_read_lines   on scorecard_lines for select to authenticated using (is_staff());
create policy staff_update_lines on scorecard_lines for update to authenticated
  using (is_staff() and exists (select 1 from scorecards c where c.id = scorecard_id and (c.status = 'draft' or is_admin())))
  with check (is_staff());
