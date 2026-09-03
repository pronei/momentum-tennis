-- ═══════════════════════════════════════════════════════════════════════════
-- Momentum Tennis — 0003: the academy can never lock itself out of /admin
--
-- Admin roles are granted and revoked from the admin console (phase 1). Revoking
-- the last one leaves nobody who can grant it back — recoverable only with
-- service-role access. The database refuses instead.
-- Append-only: never edit this file once applied — add 0004.
-- ═══════════════════════════════════════════════════════════════════════════

create function public.forbid_last_admin_removal() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.role <> 'admin' then return old; end if;
  -- serialize concurrent revokes so two callers cannot both see "there are still two"
  perform pg_advisory_xact_lock(hashtextextended('staff_members:admin', 7));
  if (select count(*) from staff_members where role = 'admin') <= 1 then
    raise exception 'last_admin' using errcode = 'check_violation';
  end if;
  return old;
end $$;

create trigger staff_members_keep_one_admin before delete on staff_members
  for each row execute function forbid_last_admin_removal();
