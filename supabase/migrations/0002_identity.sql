-- ═══════════════════════════════════════════════════════════════════════════
-- Momentum Tennis — 0002: identity writes (phase 1)
--
-- `players` and `guardianships` carry no write policies by design (0001), so
-- these two SECURITY DEFINER RPCs are the only guardian-facing mutations.
-- Ball level stays staff-only (decision M, `set_player_level`).
-- Append-only: never edit this file once applied — add 0003.
-- ═══════════════════════════════════════════════════════════════════════════

-- A guardian corrects the facts they supplied. Audited by the `audit_players` trigger.
create function public.update_player(p_player uuid, p_full_name text, p_birthdate date)
returns void language plpgsql security definer set search_path = public as $$
declare v_account uuid := auth.uid();
begin
  if v_account is null then raise exception 'not_authenticated'; end if;
  if not (is_staff() or guards(p_player)) then raise exception 'not_authorized'; end if;
  if btrim(coalesce(p_full_name, '')) = '' then
    raise exception 'validation: name required' using errcode = 'check_violation';
  end if;
  if p_birthdate is null or p_birthdate > academy_local(now())::date then
    raise exception 'validation: birthdate must be in the past' using errcode = 'check_violation';
  end if;
  -- keep minor_self_link true under edits: no account may end up self-guarding a minor
  if p_birthdate > (academy_local(now())::date - interval '18 years')::date
     and exists (select 1 from guardianships g
                 where g.player_id = p_player and g.role = 'self' and g.ended_at is null) then
    raise exception 'minor_self_link' using errcode = 'check_violation';
  end if;
  update players set full_name = btrim(p_full_name), birthdate = p_birthdate where id = p_player;
end $$;

-- Undo for a mis-added player: only THIS account's link ends. The player row, its
-- signatures and any history survive. Refused once money or bookings exist — that is
-- a staff matter, and the ledger must never point at a player the family cannot see.
create function public.archive_player(p_player uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_account uuid := auth.uid();
begin
  if v_account is null then raise exception 'not_authenticated'; end if;
  if not exists (select 1 from guardianships g
                 where g.player_id = p_player and g.account_id = v_account and g.ended_at is null) then
    raise exception 'not_authorized';
  end if;
  if exists (select 1 from credit_ledger      where player_id = p_player)
     or exists (select 1 from class_bookings  where player_id = p_player)
     or exists (select 1 from lesson_bookings where player_id = p_player)
     or exists (select 1 from camp_registrations where player_id = p_player) then
    raise exception 'player_has_history' using errcode = 'check_violation';
  end if;
  update guardianships set ended_at = now()
   where player_id = p_player and account_id = v_account and ended_at is null;
end $$;

grant execute on function public.update_player(uuid, text, date) to authenticated;
grant execute on function public.archive_player(uuid)            to authenticated;
