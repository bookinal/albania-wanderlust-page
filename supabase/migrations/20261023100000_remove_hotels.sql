-- Remove hotels: the platform now books apartments and cars only.
--
-- Dev data at the time of writing: 9 hotel rows, 0 hotel_images rows, and no
-- hotel bookings, reviews, monthly prices or listing requests.
--
-- Not touched on purpose: the storage bucket "hotel-images". Despite its name
-- it holds the photos of ALL properties (cars, apartments, destinations), and
-- every image URL points at it.
--
-- Deploy the app code that no longer reads hotels BEFORE running this.

-- 1. Hotel tables (their RLS policies are dropped with them)
drop table if exists public.hotel_images;
drop table if exists public.hotel;

-- 2. RLS helper: no hotel branch any more
create or replace function private.property_owner(p_type text, p_id text)
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_owner uuid;
begin
  if p_id is null or p_id !~ '^[0-9]+$' then
    return null;
  end if;

  case p_type
    when 'car' then
      select c."providerId" into v_owner from public.car c where c.id = p_id::bigint;
    when 'apartment' then
      select a."providerId" into v_owner from public.apartment a where a.id = p_id::bigint;
    else
      v_owner := null;
  end case;

  return v_owner;
end;
$$;

-- 3. Allowed property types: car and apartment only
alter table public.monthly_prices
  drop constraint if exists monthly_prices_property_type_check;
alter table public.monthly_prices
  add constraint monthly_prices_property_type_check
    check (property_type in ('car', 'apartment'));

alter table public.property_requests
  drop constraint if exists property_requests_property_type_check;
alter table public.property_requests
  add constraint property_requests_property_type_check
    check (property_type in ('car', 'apartment'));

-- booking."propertyType" had no check at all
alter table public.booking
  drop constraint if exists booking_property_type_check;
alter table public.booking
  add constraint booking_property_type_check
    check ("propertyType" in ('car', 'apartment'));
