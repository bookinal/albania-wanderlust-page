-- Fix: bookings with the minimum service fee could not be saved.
--
-- The booking pages (CarBilling / ApartmentBilling) charge 5% of the booking
-- with a minimum of exactly €2, but booking_fee_check required fee > 2, so
-- any booking small enough to hit the minimum was rejected by the database.
-- The minimum itself must be allowed: fee >= 2.

alter table public.booking
  drop constraint if exists booking_fee_check;

alter table public.booking
  add constraint booking_fee_check
    check (fee >= 2);
