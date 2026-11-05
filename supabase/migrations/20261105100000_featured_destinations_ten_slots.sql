-- Featured destinations ("Picked for you"): 10 slots instead of 4.
-- The home section is now a sliding row, so it can hold more than one row of cards.

alter table public.featured_destination
  drop constraint if exists featured_destination_position_check;

alter table public.featured_destination
  add constraint featured_destination_position_check
  check (position between 1 and 10);

-- Same as in 20261103090000_featured_destinations.sql, except for the limit.
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

  if cardinality(v_ids) > 10 then
    raise exception 'At most 10 featured destinations are allowed'
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
