-- ═══════════════════════════════════════════════════════════════════════════
-- Momentum Tennis — 0008: booking (phase 4)
--
-- 0001 carries every booking RULE — book_class, cancel_booking with the notice
-- window and forgiveness, promote_waitlist, finalize_bookings, issue_credits as
-- the one issuance path, and the partial unique indexes that make the weekly cap
-- and one-active-booking race-proof. Reading it closely for phase 4 turned up
-- three things it lacks, each of which the app would otherwise have had to paper
-- over in TypeScript:
--
--   • The consent gate opened when nothing was published. v_player_waiver_status
--     inner-joins v_current_waiver_versions, so a required document with no
--     published version contributed no unsatisfied rows and assert_waivers_signed
--     found nothing to refuse. "Not published yet" now means "not ready", not
--     "nothing to sign" — the gate fails closed.
--   • Nothing promoted the waitlist. cancel_booking freed a seat and returned, and
--     promote_waitlist refuses a family caller, so it could not call it.
--   • A family could not count seats: read_class_bookings admits only staff or the
--     player's own guardian, so a guardian counting bookings saw their own child
--     and every session read as empty.
--
-- Append-only: never edit this file once applied — add 0009.
-- ═══════════════════════════════════════════════════════════════════════════

-- A required document with no current version means "not ready", not "nothing to sign".
create or replace function public.assert_waivers_signed(p_player uuid) returns void
language plpgsql stable as $$
begin
  if exists (select 1 from v_player_waiver_status where player_id = p_player and not satisfied) then
    raise exception 'waiver_required' using errcode = 'check_violation';
  end if;
  if exists (
    select 1 from waiver_documents d
    where d.required_for_participation
      and not exists (select 1 from v_current_waiver_versions cv where cv.document_id = d.id)
  ) then
    raise exception 'waiver_required: no published version of a required document'
      using errcode = 'check_violation';
  end if;
end $$;

-- The promotion loop without the staff check, so a cancelling family can trigger it. Deliberately
-- granted to nobody: it is reachable only from inside the SECURITY DEFINER functions that call it.
create function public.promote_waitlist_internal(p_session uuid)
returns int language plpgsql security definer set search_path = public as $$
declare r record; n int := 0; v_kind credit_kind; v_lot uuid; v_cap int; v_booked int; v_starts timestamptz;
begin
  select starts_at into v_starts from sessions where id = p_session and status = 'scheduled';
  if v_starts is null then return 0; end if;
  v_kind := case academy_scope(v_starts) when 'weekend' then 'class_weekend' else 'class_weekday' end;
  select c.capacity into v_cap from class_sessions cs join classes c on c.id = cs.class_id
   where cs.session_id = p_session;
  if v_cap is null then return 0; end if;
  for r in select id, player_id from class_bookings
           where class_session_id = p_session and status = 'waitlisted' order by created_at loop
    select count(*) into v_booked from class_bookings
     where class_session_id = p_session and status = 'booked';
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
      null;                                            -- cap or capacity refused: stays waitlisted
    end;
  end loop;
  return n;
end $$;
revoke execute on function public.promote_waitlist_internal(uuid) from public, anon, authenticated;

-- cancel_booking as 0001 wrote it, plus one act at the end of the class branch: the seat this
-- cancellation freed is offered to the waitlist in the same transaction, so nobody waits behind an
-- empty place. The returned object gains `promoted` so the UI can say what happened.
create or replace function public.cancel_booking(p_kind text, p_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_account uuid := auth.uid(); v_player uuid; v_session uuid; v_status booking_status;
        v_starts timestamptz; v_notice int; v_new booking_status; v_by_academy boolean; v_consume record;
        v_forgiven boolean := false; v_promoted int := 0;
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
  if p_kind = 'class' and v_status = 'booked' then
    v_promoted := promote_waitlist_internal(v_session);
  end if;
  return jsonb_build_object('status', v_new, 'forgiven', v_forgiven, 'promoted', v_promoted);
end $$;

-- Occupancy WITHOUT identities. Deliberately NOT security_invoker, unlike every view in 0001: a
-- guardian may read only their own class_bookings rows, so an invoker-rights view would report
-- every session as empty. This one runs with the owner's rights and exposes four integers per
-- session — no player id, no name, no booking id, nothing about who holds a place.
create view public.v_class_session_seats as
select cs.session_id,
       c.capacity,
       count(*) filter (where b.status = 'booked')::int      as booked,
       count(*) filter (where b.status = 'waitlisted')::int  as waitlisted,
       greatest(c.capacity - count(*) filter (where b.status = 'booked'), 0)::int as seats_left
from class_sessions cs
join classes c on c.id = cs.class_id
left join class_bookings b on b.class_session_id = cs.session_id
group by cs.session_id, c.capacity;

grant select on public.v_class_session_seats to anon, authenticated;
