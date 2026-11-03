-- WhatsApp alert to the provider for each new booking request.
--
-- Written only by the notify-provider-whatsapp edge function (service role).
-- They record the outcome for each booking, prevent duplicate messages, and
-- show why a provider was not reached (no phone, not configured, API error).

alter table public.booking
  add column if not exists provider_whatsapp_status text,
  add column if not exists provider_whatsapp_sent_at timestamptz,
  add column if not exists provider_whatsapp_message_id text,
  add column if not exists provider_whatsapp_error text;

alter table public.booking
  drop constraint if exists booking_provider_whatsapp_status_check;
alter table public.booking
  add constraint booking_provider_whatsapp_status_check
    check (
      provider_whatsapp_status is null
      or provider_whatsapp_status in ('sending', 'sent', 'failed', 'no_phone', 'not_configured')
    );

comment on column public.booking.provider_whatsapp_status is
  'WhatsApp alert to the provider for this request: sending | sent | failed | no_phone | not_configured (null = not attempted)';
