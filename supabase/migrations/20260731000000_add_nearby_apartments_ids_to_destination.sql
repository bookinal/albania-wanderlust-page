-- Add nearbyApartmentsIds column to destination table.
-- Stores apartment ids (bigint) that are nearby this destination,
-- mirroring the existing nearbyDestinationIds column.

ALTER TABLE public.destination
  ADD COLUMN IF NOT EXISTS "nearbyApartmentsIds" bigint[];


-- car
-- additionalDriverPrice
-- childSeatPrice

ALTER TABLE public.car
  ADD COLUMN IF NOT EXISTS "additionalDriverPrice" numeric(10,2);
  ADD COLUMN IF NOT EXISTS "childSeatPrice" numeric(10,2);

-- same for table booking 
-- additionalDriverPrice
-- childSeatPrice

ALTER TABLE public.booking
  ADD COLUMN IF NOT EXISTS "additionalDriverPrice" numeric(10,2);
  ADD COLUMN IF NOT EXISTS "childSeatPrice" numeric(10,2);
  ADD COLUMN IF NOT EXISTS "fee" numeric(10,2);



   supabase functions deploy create-stripe-payment-intent                                
  │   supabase functions deploy create-paypal-order 