-- Add deliveryFee column to booking table.
-- Stores the pick-up delivery fee charged at booking time based on the
-- selected pick-up location. Drop-off is always free, so no equivalent
-- column is needed for it.

ALTER TABLE public.booking
  ADD COLUMN IF NOT EXISTS "deliveryFee" numeric(10,2);
