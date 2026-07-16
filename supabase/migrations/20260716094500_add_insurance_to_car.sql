-- Add insurance column to car table.
-- This column represents a fixed insurance price for a car booking.

ALTER TABLE public.car
  ADD COLUMN IF NOT EXISTS insurance bigint DEFAULT 0;
