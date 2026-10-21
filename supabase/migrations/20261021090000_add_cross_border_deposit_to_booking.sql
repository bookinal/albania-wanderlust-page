-- Add crossBorderDeposit column to booking table.
-- Stores the optional cross border extra deposit (EUR) the client chose at
-- booking time, copied from the car's "crossBorderDeposit". NULL means the
-- client did not choose to travel abroad. It is included in "totalPrice".

ALTER TABLE public.booking
  ADD COLUMN IF NOT EXISTS "crossBorderDeposit" numeric(10,2);

ALTER TABLE public.booking
  DROP CONSTRAINT IF EXISTS booking_cross_border_deposit_check;

ALTER TABLE public.booking
  ADD CONSTRAINT booking_cross_border_deposit_check
    CHECK ("crossBorderDeposit" IS NULL OR "crossBorderDeposit" >= 0);
