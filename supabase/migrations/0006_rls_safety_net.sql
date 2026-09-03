-- 0006 — RLS safety net.
-- Any table created in `public` — by a later migration, a statement typed into the SQL editor, or a
-- mistake — gets row-level security enabled the moment it exists, so nothing can be world-readable
-- through PostgREST by omission. Our own migrations enable RLS explicitly; this is the net beneath
-- them. Idempotent: re-running replaces both the function and the trigger.
create or replace function public.rls_auto_enable()
returns event_trigger
language plpgsql
security definer
set search_path to 'pg_catalog'
as $$
declare
  cmd record;
begin
  for cmd in
    select *
    from pg_event_trigger_ddl_commands()
    where command_tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      and object_type in ('table', 'partitioned table')
  loop
    if cmd.schema_name = 'public' then
      begin
        execute format('alter table if exists %s enable row level security', cmd.object_identity);
        raise log 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      exception
        when others then
          raise log 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      end;
    end if;
  end loop;
end;
$$;

-- Not callable through the API (event-trigger functions cannot be invoked directly anyway).
revoke execute on function public.rls_auto_enable() from public;

drop event trigger if exists ensure_rls;
create event trigger ensure_rls
  on ddl_command_end
  when tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  execute function public.rls_auto_enable();
