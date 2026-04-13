-- Schedule update-property-status edge function to run daily at 00:05 UTC.
-- This runs 5 minutes after expire-bookings (00:00) so cancelled bookings
-- are already processed before property statuses are evaluated.
--
-- BEFORE applying this migration:
--   1. Make sure pg_cron and pg_net extensions are already enabled
--      (done in migration 20260310000002_add_expiry_cron.sql)
--   2. Replace <PROJECT_REF> with your Supabase project reference ID
--   3. Replace <SERVICE_ROLE_KEY> with your service role key
--
-- Logic handled by the edge function:
--   → "rented":    confirmed+paid bookings where startDate <= today <= endDate
--                  → the car/apartment is marked as "rented"
--   → "available": cars/apartments currently "rented" with no active booking
--                  today → released back to "available"
--   ✗ "maintenance" and "review" statuses are never touched automatically.

SELECT cron.schedule(
  'update-property-status-daily',  -- job name (unique)
  '5 0 * * *',                     -- 00:05 UTC every day (after expire-bookings at 00:00)
  $$
    SELECT net.http_post(
      url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/update-property-status',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer <SERVICE_ROLE_KEY>'
      ),
      body    := '{}'::jsonb
    );
  $$
);

-- After applying, verify both jobs exist:
--   SELECT jobname, schedule, active FROM cron.job;
--
-- To check recent execution results:
--   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
--
-- To remove this job if needed:
--   SELECT cron.unschedule('update-property-status-daily');
