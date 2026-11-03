-- Featured destinations ("Picked for you")
--
-- The admin picks up to 4 destinations from the dashboard. The home page shows
-- them just below the hero, in the order of "position" (1 to 4).
--
--   featured_destination          one row per slot
--   set_featured_destinations()   replaces all the slots in one call
--
-- Depends on the private.* helpers from 20261019083105_harden_rls_and_roles.sql.

create table if not exists public.featured_destination (
  position smallint primary key,
  "destinationId" uuid not null unique
    references public.destination (id) on delete cascade,
  "updatedAt" timestamptz not null default now(),
  constraint featured_destination_position_check
    check (position between 1 and 4)
);

comment on table public.featured_destination is
  'Destinations picked by the admin for the "Picked for you" section of the home page.';

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.featured_destination enable row level security;

drop policy if exists featured_destination_select_public on public.featured_destination;
drop policy if exists featured_destination_insert on public.featured_destination;
drop policy if exists featured_destination_update on public.featured_destination;
drop policy if exists featured_destination_delete on public.featured_destination;

-- Shown to every visitor on the home page
create policy featured_destination_select_public on public.featured_destination
  for select to anon, authenticated using (true);
create policy featured_destination_insert on public.featured_destination
  for insert to authenticated
  with check ((select private.is_admin()));
create policy featured_destination_update on public.featured_destination
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));
create policy featured_destination_delete on public.featured_destination
  for delete to authenticated
  using ((select private.is_admin()));

revoke insert, update, delete, truncate, references, trigger
  on public.featured_destination from anon;
revoke truncate, references, trigger
  on public.featured_destination from authenticated;

-- ---------------------------------------------------------------------------
-- set_featured_destinations
-- ---------------------------------------------------------------------------

-- Replaces the picks with p_destination_ids, in order (first id = position 1).
-- Runs as the caller, so the RLS policies above still apply.
create or replace function public.set_featured_destinations(p_destination_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_ids uuid[] := coalesce(p_destination_ids, '{}'::uuid[]);
begin
  if not (select private.is_admin()) then
    raise exception 'Only an admin can change the featured destinations'
      using errcode = '42501';
  end if;

  if cardinality(v_ids) > 4 then
    raise exception 'At most 4 featured destinations are allowed'
      using errcode = '22023';
  end if;

  if array_position(v_ids, null) is not null then
    raise exception 'A featured destination id cannot be null'
      using errcode = '22023';
  end if;

  if (select count(distinct id) from unnest(v_ids) as t (id)) <> cardinality(v_ids) then
    raise exception 'The same destination cannot be featured twice'
      using errcode = '22023';
  end if;

  delete from public.featured_destination where position is not null;

  insert into public.featured_destination (position, "destinationId")
  select t.ord::smallint, t.id
  from unnest(v_ids) with ordinality as t (id, ord);
end;
$$;

revoke all on function public.set_featured_destinations(uuid[]) from public, anon;
grant execute on function public.set_featured_destinations(uuid[]) to authenticated;
