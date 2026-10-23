-- Free apartment bookings.
--
-- Apartment bookings no longer cost anything on the platform: no service fee,
-- no online payment. The client sends a request, the provider confirms it, and
-- both sides then see each other's contact details.
--
-- Car bookings are unchanged: 5% service fee (minimum €2) paid online after the
-- provider confirms, and the contact details unlock once it is paid.
--
-- payment_status = 'not_required' marks a free booking. It keeps those bookings
-- out of every payment flow (expire-bookings only cancels confirmed bookings
-- whose payment is still 'pending').

-- 1. Existing apartment bookings that were never paid become free bookings
update public.booking
set fee = 0,
    payment_status = 'not_required'
where "propertyType" = 'apartment'
  and coalesce(payment_status, 'pending') in ('pending', 'failed');

-- 2. Known payment statuses only
alter table public.booking
  drop constraint if exists booking_payment_status_check;
alter table public.booking
  add constraint booking_payment_status_check
    check (payment_status in ('pending', 'paid', 'failed', 'refunded', 'not_required'));

-- 3. Fee rules per property type: apartments are free, cars pay at least €2
alter table public.booking
  drop constraint if exists booking_fee_check;
alter table public.booking
  add constraint booking_fee_check
    check (
      case
        when "propertyType" = 'apartment' then fee = 0
        else fee >= 2
      end
    );

-- 4. New apartment bookings are always saved as free, whatever the client sends.
--    BEFORE triggers run before the RLS insert check, so the policy below sees
--    the corrected values.
create or replace function private.set_booking_payment_defaults()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new."propertyType" = 'apartment' then
    new.fee := 0;
    new.payment_status := 'not_required';
  elsif new.payment_status is null then
    new.payment_status := 'pending';
  end if;

  return new;
end;
$$;

drop trigger if exists set_booking_payment_defaults on public.booking;
create trigger set_booking_payment_defaults
  before insert on public.booking
  for each row execute function private.set_booking_payment_defaults();

-- 5. Insert policy: a new booking starts unpaid (cars) or free (apartments)
drop policy if exists booking_insert_own on public.booking;
create policy booking_insert_own on public.booking
  for insert to authenticated
  with check (
    "userId" = (select auth.uid())
    and (select private.current_user_role()) is not null -- active (not suspended) account
    and status = 'pending'
    and coalesce(payment_status, 'pending') =
      case when "propertyType" = 'apartment' then 'not_required' else 'pending' end
    and paid_at is null
    and payment_intent_id is null
    and paypal_order_id is null
    and stripe_payment_intent_id is null
    -- providerId must be the real owner (null for admin-managed properties)
    and "providerId" is not distinct from private.property_owner("propertyType", "propertyId")
  );
