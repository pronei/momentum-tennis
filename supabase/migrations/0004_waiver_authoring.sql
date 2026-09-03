-- ═══════════════════════════════════════════════════════════════════════════
-- Momentum Tennis — 0004: authoring waiver versions (phase 2)
--
-- 0001 carries the whole consent MECHANISM: versioned documents, a publish-freeze
-- trigger, immutable signatures, and the gate. What it lacks is the authoring half.
-- These three admin RPCs supply it so that:
--   • version numbers are allocated atomically, not read-then-written by the app
--   • content_sha256 is computed from the text in SQL, where it cannot drift from it
--   • "already published" is a clear refusal rather than the generic append-only error
--
-- The TEXT itself comes from the academy's lawyer. This system stores and versions it.
-- Append-only: never edit this file once applied — add 0005.
-- ═══════════════════════════════════════════════════════════════════════════

-- sha256() over bytea is core Postgres; no extension, and the hash always matches the text.
create function public.waiver_content_hash(p_content text) returns text
  language sql immutable as $$ select encode(sha256(convert_to(p_content, 'UTF8')), 'hex') $$;

create function public.create_waiver_draft(p_document uuid, p_content text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_next int; v_id uuid;
begin
  if not is_admin() then raise exception 'admin_only'; end if;
  if btrim(coalesce(p_content, '')) = '' then
    raise exception 'validation: the document text is empty' using errcode = 'check_violation';
  end if;
  -- lock the document so two drafts cannot claim the same version number
  perform 1 from waiver_documents where id = p_document for update;
  if not found then raise exception 'unknown_document' using errcode = 'check_violation'; end if;
  select coalesce(max(version), 0) + 1 into v_next from waiver_versions where document_id = p_document;
  insert into waiver_versions (document_id, version, content_md, content_sha256, created_by)
  values (p_document, v_next, p_content, waiver_content_hash(p_content), auth.uid())
  returning id into v_id;
  return v_id;
end $$;

create function public.update_waiver_draft(p_version uuid, p_content text)
returns void language plpgsql security definer set search_path = public as $$
declare v_published timestamptz;
begin
  if not is_admin() then raise exception 'admin_only'; end if;
  select published_at into v_published from waiver_versions where id = p_version;
  if not found then raise exception 'unknown_document' using errcode = 'check_violation'; end if;
  -- the freeze trigger would also refuse; this says why in the language the UI speaks
  if v_published is not null then raise exception 'already_published' using errcode = 'check_violation'; end if;
  if btrim(coalesce(p_content, '')) = '' then
    raise exception 'validation: the document text is empty' using errcode = 'check_violation';
  end if;
  update waiver_versions
     set content_md = p_content, content_sha256 = waiver_content_hash(p_content)
   where id = p_version;
end $$;

-- Publishing is the consequential act: from here the version is frozen, it becomes the
-- current one, and every signature against an earlier version stops satisfying the gate.
create function public.publish_waiver_version(p_version uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v record;
begin
  if not is_admin() then raise exception 'admin_only'; end if;
  select published_at, content_md into v from waiver_versions where id = p_version;
  if not found then raise exception 'unknown_document' using errcode = 'check_violation'; end if;
  if v.published_at is not null then raise exception 'already_published' using errcode = 'check_violation'; end if;
  if btrim(coalesce(v.content_md, '')) = '' then
    raise exception 'validation: cannot publish an empty document' using errcode = 'check_violation';
  end if;
  update waiver_versions set published_at = now() where id = p_version;
end $$;

grant execute on function public.waiver_content_hash(text)            to authenticated;
grant execute on function public.create_waiver_draft(uuid, text)      to authenticated;
grant execute on function public.update_waiver_draft(uuid, text)      to authenticated;
grant execute on function public.publish_waiver_version(uuid)         to authenticated;
