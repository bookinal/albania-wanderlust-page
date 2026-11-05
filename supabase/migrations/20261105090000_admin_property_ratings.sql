-- Private admin ratings for cars and apartments
--
-- The admin rates a property from 1 to 5 in the dashboard. The rating decides
-- the display order on the search pages and is never shown to clients or
-- providers. No row = not rated = listed after the rated properties.
--
--   car_admin_rating          one row per rated car, admin only
--   apartment_admin_rating    one row per rated apartment, admin only
--   ranked_cars()             all cars, best rated first
--   ranked_apartments()       all apartments, best rated first
--
-- Why separate tables and not a column on car / apartment: both tables are
-- publicly readable and the app reads them with select *, so a column would be
-- sent to every visitor, and providers could change it (they can update their
-- own rows). Revoking the column would make every select * fail.
--
-- The ranked_* functions run as their owner, so they can read the ratings for
-- the people who cannot. They only return car / apartment rows: visitors get the
-- order, not the rating, and cannot filter on it. The search filters and the
-- pagination are added by PostgREST on top of the function call.
--
-- Depends on the private.* helpers from 20261019083105_harden_rls_and_roles.sql
-- and private.touch_updated_at() from 20261021120000_add_insurance_plans.sql.

-- ---------------------------------------------------------------------------
-- car_admin_rating
-- ---------------------------------------------------------------------------

create table if not exists public.car_admin_rating (
  "carId" bigint primary key references public.car (id) on delete cascade,
  rating numeric(2,1) not null,
  "updatedAt" timestamptz not null default now(),
  constraint car_admin_rating_check check (rating between 1 and 5)
);

comment on table public.car_admin_rating is
  'Private admin rating of a car, used for the display order of the search results.';

drop trigger if exists car_admin_rating_touch_updated_at on public.car_admin_rating;
create trigger car_admin_rating_touch_updated_at
  before update on public.car_admin_rating
  for each row execute function private.touch_updated_at();

alter table public.car_admin_rating enable row level security;

drop policy if exists car_admin_rating_admin_only on public.car_admin_rating;
create policy car_admin_rating_admin_only on public.car_admin_rating
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

revoke all on public.car_admin_rating from anon;
revoke truncate, references, trigger on public.car_admin_rating from authenticated;

-- ---------------------------------------------------------------------------
-- apartment_admin_rating
-- ---------------------------------------------------------------------------

create table if not exists public.apartment_admin_rating (
  "apartmentId" bigint primary key references public.apartment (id) on delete cascade,
  rating numeric(2,1) not null,
  "updatedAt" timestamptz not null default now(),
  constraint apartment_admin_rating_check check (rating between 1 and 5)
);

comment on table public.apartment_admin_rating is
  'Private admin rating of an apartment, used for the display order of the search results.';

drop trigger if exists apartment_admin_rating_touch_updated_at on public.apartment_admin_rating;
create trigger apartment_admin_rating_touch_updated_at
  before update on public.apartment_admin_rating
  for each row execute function private.touch_updated_at();

alter table public.apartment_admin_rating enable row level security;

drop policy if exists apartment_admin_rating_admin_only on public.apartment_admin_rating;
create policy apartment_admin_rating_admin_only on public.apartment_admin_rating
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

revoke all on public.apartment_admin_rating from anon;
revoke truncate, references, trigger on public.apartment_admin_rating from authenticated;

-- ---------------------------------------------------------------------------
-- Ranked search sources
-- ---------------------------------------------------------------------------

-- The id as last sort key keeps the order stable between pages of results.
create or replace function public.ranked_cars()
returns setof public.car
language sql
stable
security definer
set search_path = ''
as $$
  select c.*
  from public.car c
  left join public.car_admin_rating r on r."carId" = c.id
  order by r.rating desc nulls last, c.id
$$;

create or replace function public.ranked_apartments()
returns setof public.apartment
language sql
stable
security definer
set search_path = ''
as $$
  select a.*
  from public.apartment a
  left join public.apartment_admin_rating r on r."apartmentId" = a.id
  order by r.rating desc nulls last, a.id
$$;

revoke all on function public.ranked_cars() from public;
revoke all on function public.ranked_apartments() from public;
grant execute on function public.ranked_cars() to anon, authenticated;
grant execute on function public.ranked_apartments() to anon, authenticated;
