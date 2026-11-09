-- New booking request email to the provider, now sent by the
-- notify-provider-booking edge function (service role).
--
-- Set when the email is sent, so one booking can never email its provider twice.

alter table public.booking
  add column if not exists provider_email_sent_at timestamptz;

comment on column public.booking.provider_email_sent_at is
  'When the new booking request email was sent to the provider (null = not sent)';
