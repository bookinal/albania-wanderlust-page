-- Add cancellation_reason column to booking table.
-- This column already exists in the TypeScript Booking type and is written by
-- updateBookingStatus(), but was missing from the DB schema causing silent failures.

ALTER TABLE public.booking
  ADD COLUMN IF NOT EXISTS cancellation_reason text;
