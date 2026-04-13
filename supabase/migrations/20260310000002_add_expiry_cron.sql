-- Enable required extensions for scheduled HTTP calls.
-- pg_cron  : runs scheduled jobs inside PostgreSQL
-- pg_net   : allows PostgreSQL to make outbound HTTP requests
--
-- BEFORE applying this migration:
--   1. Enable both extensions in Supabase Dashboard → Database → Extensions
--   2. Replace <PROJECT_REF> with your Supabase project reference ID
--      (found in: Dashboard → Project Settings → General → Reference ID)
--   3. Replace <SERVICE_ROLE_KEY> with your service role key
--      (found in: Dashboard → Project Settings → API → service_role key)
--      For production, store the key in Supabase Vault instead of hardcoding:
--        SELECT vault.create_secret('<SERVICE_ROLE_KEY>', 'service_role_key');
--      Then read it at runtime:
--        SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key';

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the expire-bookings edge function to run every day at 00:00 UTC.
-- The function cancels pending/unconfirmed bookings whose check-in date has arrived.
--
-- To test immediately (runs every minute), temporarily change the schedule to: '* * * * *'
-- then revert to '0 0 * * *' once verified.
SELECT cron.schedule(
  'expire-bookings-daily',   -- job name (unique)
  '0 0 * * *',               -- cron expression: midnight UTC every day
  $$
    SELECT net.http_post(
      url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/expire-bookings',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer <SERVICE_ROLE_KEY>'
      ),
      body    := '{}'::jsonb
    );
  $$
);

-- After applying, verify the job was created:
--   SELECT * FROM cron.job;
--
-- To check recent executions:
--   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
--
-- To remove the job if needed:
--   SELECT cron.unschedule('expire-bookings-daily');
