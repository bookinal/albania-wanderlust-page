-- Switch the platform's default billing currency from USD to EUR going
-- forward. New payment_transactions rows will default to EUR.
--
-- Deliberately NOT relabeling existing rows that recorded 'USD' — those
-- transactions were actually charged in USD at the time, so rewriting the
-- currency column on historical records would misrepresent what was
-- actually collected. If a currency conversion/backfill of historical data
-- is wanted, that should be a separate, deliberate decision.

ALTER TABLE public.payment_transactions
  ALTER COLUMN currency SET DEFAULT 'EUR'::text;
