-- Add built column to destination table.
-- Stores the year or approximate period when the attraction, monument, castle, church, bridge, or other site was built (e.g. "13th century", "1417", "1850").

ALTER TABLE public.destination
  ADD COLUMN IF NOT EXISTS "built" text;
