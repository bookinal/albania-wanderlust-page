# Mailing Overview

This project sends transactional emails through the Supabase Edge Function `send-email`, which forwards messages to Resend.

## Core flow

1. An edge function builds an email payload on the server: `to`, `subject`, `html`, optional `text`, `replyTo`, `tags`.
2. It sends the payload to `send-email` with the service role key.
3. `supabase/functions/send-email/index.ts` checks that key, validates the payload, and sends the message to Resend.
4. Success and failure events are written to `email_logs` when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are available.

## Main pieces

- App triggers: `packages/api-client/src/bookingService.ts` and `emailService.ts`
  - The app never sends email content. It calls `notify-provider-booking` or `notify-booking-status` with a booking id.
- Edge function: `supabase/functions/send-email/index.ts`
  - Internal only: requests without the service role key get a 401. Handles validation, Resend API calls, and response formatting.
  - Uses `from: "Bookinal <noreply@bookinal.com>"` when calling Resend.
- Function config: `supabase/config.toml`
  - `send-email` is configured with `verify_jwt = false`.
  - The gateway lets the request through and the function checks the service role key itself.
- Email logs table: `supabase/migrations/create_email_logs_table.sql`
  - Stores `recipient`, `subject`, `status`, `message_id`, `error`, timestamps, and optional `user_id`.

## Active email triggers

### 1. Provider notification on booking creation

- Trigger file: `packages/api-client/src/bookingService.ts`
- Trigger moment: after `createBooking()` successfully inserts a booking.
- Trigger transport: `notify-provider-booking` Edge Function, called with the booking id only.
- Recipient: provider email from the `users` table, resolved server-side.
- Template used: `supabase/functions/_shared/providerBookingTemplate.ts`
- Subject pattern: `New booking request for ${propertyName}`
- Notes:
  - Only the client who made the booking can trigger it, within 15 minutes, and only once (`booking.provider_email_sent_at`).
  - Cars use `brand + name`; apartments use `name`.
  - Guest contact details are hidden on a new request, and there is no `replyTo`.
  - The dashboard link is a fixed URL, so emails from dev also link to production.

### 2. Client confirmation email when booking becomes confirmed

- Trigger file: `apps/web/src/pages/dashboard/bookings/BookingsManagement.tsx`
- Trigger moment: when a booking status is updated to `confirmed`.
- Recipient: resolved server-side from the booking record
- Trigger transport: `notify-booking-status` Edge Function
- Template path: `supabase/functions/_shared/clientBookingStatusTemplate.ts`
- Sender helper: `notifyClientBookingStatus()` in `packages/api-client/src/emailService.ts`
- Notes:
  - This flow now sends from the backend so the provider UI does not need the client email address.
  - The CTA points the user back to `/myBookings`.

### 3. Client cancellation email when the provider rejects or cancels a booking

- Trigger file: `apps/web/src/pages/dashboard/bookings/BookingsManagement.tsx`
- Trigger moment: when a provider cancels a booking, including conflict-driven auto-declines.
- Recipient: resolved server-side from the booking record
- Trigger transport: `notify-booking-status` Edge Function
- Template path: `supabase/functions/_shared/clientBookingStatusTemplate.ts`
- Notes:
  - The cancellation reason selected by the provider is included in the email.
  - Auto-declined conflicting bookings use the date-conflict reason in the email.

### 4. Client cancellation email from the scheduled expiry function

- Trigger file: `supabase/functions/expire-bookings/index.ts`
- Trigger moment: when unpaid bookings are automatically cancelled before check-in.
- Recipient: `booking.contactMail`
- Template path: `supabase/functions/_shared/bookingCancellationTemplate.ts`
- Subject: `Your BOOKinAL booking has been cancelled`
- Notes:
  - This is a backend-to-backend flow.
  - It calls `send-email` with `Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}`.

### 5. Payment received and contact details unlocked

- Trigger files:
  - `supabase/functions/confirm-stripe-payment/index.ts`
  - `supabase/functions/stripe-webhook/index.ts`
- Trigger moment: when Stripe payment moves a booking from `payment_status = pending` to `payment_status = paid`.
- Recipients:
  - client receives provider contact details
  - provider receives client contact details
- Template path: `supabase/functions/_shared/contactUnlockNotifications.ts`
- Notes:
  - The emails explain that Bookinal collected the platform booking fee.
  - They instruct both sides to coordinate the remaining rental/payment details directly outside the app.
  - Notifications are only sent on the actual transition from `pending` to `paid`, which avoids duplicate sends between confirm and webhook flows.

## Templates currently in the codebase

### Active templates

- `supabase/functions/_shared/providerBookingTemplate.ts`
  - Used for provider booking request notifications.
  - Recently updated to a more polished, professional layout.
- `packages/api-client/src/emailTemplates/clientBookingStatusTemplate.ts`
  - Used for client booking confirmation/status updates from the provider dashboard.
- `supabase/functions/_shared/bookingCancellationTemplate.ts`
  - Used by the expiry function when unpaid bookings are auto-cancelled.

### Existing but currently unused in production flows

- `apps/web/src/services/email/useEmailService.ts`
  - Includes `getBookingConfirmationTemplate()`.
  - This appears to be a helper/example template, not part of the active booking flow.
- `apps/web/src/components/examples/EmailComponentExample.tsx`
  - Demo component showing how to send booking confirmation and contact-form emails.
  - Not an active trigger, and it can no longer send: it goes through `sendEmailDirect()`, which `send-email` now rejects.

## Trigger-to-template map

| Trigger | File | Recipient | Template |
| --- | --- | --- | --- |
| Booking created | `packages/api-client/src/bookingService.ts` | Provider | `supabase/functions/_shared/providerBookingTemplate.ts` via `notify-provider-booking` |
| Booking confirmed | `apps/web/src/pages/dashboard/bookings/BookingsManagement.tsx` | Client | `supabase/functions/_shared/clientBookingStatusTemplate.ts` via `notify-booking-status` |
| Booking auto-cancelled | `supabase/functions/expire-bookings/index.ts` | Client | `supabase/functions/_shared/bookingCancellationTemplate.ts` |
| Payment received / contacts unlocked | `supabase/functions/confirm-stripe-payment/index.ts`, `supabase/functions/stripe-webhook/index.ts` | Client + Provider | `supabase/functions/_shared/contactUnlockNotifications.ts` |

## Reusable email helpers

- `packages/api-client/src/emailService.ts`
  - `notifyClientBookingStatus()` - booking status email through `notify-booking-status`.
  - `sendEmailDirect()` and `sendClientBookingStatusEmail()` - unused, and rejected by `send-email` because they send from the browser.
- `apps/web/src/services/email/useEmailService.ts`
  - React hook wrapper around `sendEmailDirect()`, used only by the demo component above.

## Operational details

- Resend secret is read inside `supabase/functions/send-email/index.ts` from `RESEND_API_KEY`.
- CORS currently allows these headers for browser invocation:
  - `authorization`
  - `x-client-info`
  - `apikey`
  - `content-type`
- The function logs email outcomes into `email_logs` when possible.
- Failed Resend requests are returned to the caller with the original error message.
- Provider-side booking fetches now mask guest contact details until `payment_status === "paid"`.

## Current observations

- The mailing system is centralized around `send-email`, and the main production flows now use dedicated templates instead of inline HTML.
- Provider-facing mail and provider booking fetches both protect guest contact details until payment is completed.
- Demo/example email utilities still exist separately from the production flows.

## Recommended next refactor

1. Review whether public property pages should also hide direct host contact details until payment, not just booking-related emails and provider dashboards.
2. Keep all transactional email subjects and brand copy aligned to `Bookinal` rather than the older `Discover Albania` / `BOOKinAL` strings still present in some files.
3. If needed, add a dedicated "payment received" email that notifies both sides when contact details become available.
