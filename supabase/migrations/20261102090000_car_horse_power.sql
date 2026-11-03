-- Engine power of a car, shown in the vehicle specifications. Optional: null
-- means the provider did not fill it in.
alter table public.car
  add column if not exists "horsePower" smallint;

alter table public.car
  drop constraint if exists car_horse_power_check;

alter table public.car
  add constraint car_horse_power_check
  check ("horsePower" is null or "horsePower" between 1 and 2000);

comment on column public.car."horsePower" is 'Engine power in horse power (hp); null when not provided';
