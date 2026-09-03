-- ═══════════════════════════════════════════════════════════════════════════
-- Momentum Tennis — 0007: schedule (phase 3)
--
-- 0001 already carries the whole scheduling MODEL: locations, courts, the
-- reservation windows and their exceptions with `court_available()` and the two
-- protecting triggers, `sessions` with the court and coach EXCLUDE constraints,
-- the level-tag tables, terms/classes/camps/teams, `generate_class_sessions()`
-- and `cancel_session()`. Moving a session is already an UPDATE the triggers
-- check, so nothing here re-implements a write that constraints govern.
--
-- What it lacks is two things the admin console needs:
--   • replacing a tag SET atomically. Row-by-row writes leave a slot briefly
--     open to every level (no rows = open to all), and a half-applied change is
--     a booking gate that lies. Both RPCs delete and re-insert in one statement
--     pair inside one transaction, and refuse an unknown level key outright.
--   • one row per session carrying everything a calendar cell renders, so the
--     admin grid, the portal list and the public page cannot drift apart by
--     each assembling their own joins.
--
-- Append-only: never edit this file once applied — add 0008.
-- ═══════════════════════════════════════════════════════════════════════════

-- N: which ball levels a slot offers. Replacing the set is one act, not n acts.
create function public.set_session_levels(p_session uuid, p_level_keys text[])
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not is_admin() then raise exception 'admin_only'; end if;
  if not exists (select 1 from sessions where id = p_session) then
    raise exception 'unknown_session' using errcode = 'check_violation';
  end if;
  if exists (select 1 from unnest(coalesce(p_level_keys, '{}')) k
             where not exists (select 1 from skill_levels where key = k)) then
    raise exception 'unknown_skill_level: %', p_level_keys using errcode = 'check_violation';
  end if;
  delete from session_skill_levels where session_id = p_session;
  insert into session_skill_levels (session_id, skill_level_id)
    select p_session, id from skill_levels where key = any (coalesce(p_level_keys, '{}'));
  get diagnostics n = row_count;
  return n;
end $$;

-- The template's defaults. `generate_class_sessions` copies these onto each occurrence,
-- so tagging the template before generating is the cheap path; retagging afterwards is
-- per-occurrence work through set_session_levels.
create function public.set_class_levels(p_class uuid, p_level_keys text[])
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not is_admin() then raise exception 'admin_only'; end if;
  if not exists (select 1 from classes where id = p_class) then
    raise exception 'unknown_class' using errcode = 'check_violation';
  end if;
  if exists (select 1 from unnest(coalesce(p_level_keys, '{}')) k
             where not exists (select 1 from skill_levels where key = k)) then
    raise exception 'unknown_skill_level: %', p_level_keys using errcode = 'check_violation';
  end if;
  delete from class_skill_levels where class_id = p_class;
  insert into class_skill_levels (class_id, skill_level_id)
    select p_class, id from skill_levels where key = any (coalesce(p_level_keys, '{}'));
  get diagnostics n = row_count;
  return n;
end $$;

-- One row per session with everything a calendar cell needs. security_invoker: the caller's
-- own RLS applies, so anon sees scheduled sessions only (read_sessions) and coach names arrive
-- only for staff (own_account) — the view widens nothing.
create view public.v_schedule_sessions with (security_invoker = true) as
select s.id, s.session_type, s.starts_at, s.ends_at, s.status, s.notes, s.venue_note,
       s.court_id, c.name as court_name, c.location_id, l.name as location_name,
       s.coach_id, a.full_name as coach_name,
       coalesce(cl.name, cp.name, tm.name || ' · ' || ts.kind::text, 'Private lesson') as title,
       coalesce(cs.class_id, cps.camp_id, ts.team_id) as parent_id,
       coalesce(array_agg(sk.key order by sk.rank) filter (where sk.key is not null),
                '{}'::text[]) as level_keys
from sessions s
left join courts c on c.id = s.court_id
left join locations l on l.id = c.location_id
left join accounts a on a.id = s.coach_id
left join class_sessions cs on cs.session_id = s.id
left join classes cl on cl.id = cs.class_id
left join camp_sessions cps on cps.session_id = s.id
left join camps cp on cp.id = cps.camp_id
left join team_sessions ts on ts.session_id = s.id
left join teams tm on tm.id = ts.team_id
left join session_skill_levels ssl on ssl.session_id = s.id
left join skill_levels sk on sk.id = ssl.skill_level_id
group by s.id, c.name, c.location_id, l.name, a.full_name, cl.name, cp.name, tm.name, ts.kind,
         cs.class_id, cps.camp_id, ts.team_id;

-- 0001's blanket revoke covered only the functions that existed then; a new function is
-- created with EXECUTE for PUBLIC, so each one grants deliberately (as 0004 does).
-- The public schedule page reads this view as `anon`; RLS on `sessions` still decides the rows
-- (scheduled only, unless the caller is staff). Granted explicitly rather than relying on the
-- project's default privileges for new objects.
grant select on public.v_schedule_sessions to anon, authenticated;

revoke execute on function public.set_session_levels(uuid, text[]) from public, anon;
revoke execute on function public.set_class_levels(uuid, text[])   from public, anon;
grant  execute on function public.set_session_levels(uuid, text[]) to authenticated;
grant  execute on function public.set_class_levels(uuid, text[])   to authenticated;
