# Mailing Overview

This project sends transactional emails through the Supabase Edge Function `send-email`, which forwards messages to Resend.

## Core flow

1. Frontend or backend code builds an email payload: `to`, `subject`, `html`, optional `text`, `replyTo`, `tags`.
2. The payload is sent to `send-email`.
3. `supabase/functions/send-email/index.ts` validates the payload, applies rate limiting, and sends the message to Resend.
4. Success and failure events are written to `email_logs` when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are available.

## Main pieces

- Client sender: `packages/api-client/src/emailService.ts`
  - `sendEmailDirect()` is the main reusable sender.
  - It calls `apiClient.functions.invoke("send-email", { body })`.
  - It is the shared entry point used by the web app.
- Edge function: `supabase/functions/send-email/index.ts`
  - Handles CORS, validation, optional JWT inspection, rate limiting, Resend API calls, and response formatting.
  - Uses `from: "Bookinal <noreply@bookinal.com>"` when calling Resend.
- Function config: `supabase/config.toml`
  - `send-email` is configured with `verify_jwt = false`.
  - This allows public invocation at the gateway level; app-level auth checks can still be added in code if needed.
- Email logs table: `supabase/migrations/create_email_logs_table.sql`
  - Stores `recipient`, `subject`, `status`, `message_id`, `error`, timestamps, and optional `user_id`.

## Active email triggers

### 1. Provider notification on booking creation

- Trigger file: `packages/api-client/src/bookingService.ts`
- Trigger moment: after `createBooking()` successfully inserts a booking.
- Recipient: provider email from the `users` table.
- Template used: `packages/api-client/src/emailTemplates/providerBookingTemplate.ts`
- Subject pattern: `New booking request for ${propertyName}`
- Notes:
  - Property name is resolved before sending.
  - Cars use `brand + name`; apartments and hotels use `name`.
  - Guest contact details are hidden until payment is completed.
  - `replyTo` is only set when contact sharing is allowed.

Payload shape sent to `send-email`:

```ts
{
  to: providerData.email,
  subject: `New booking request for ${propertyName}`,
  html,
  replyTo: payload.contactMail,
  tags: {
    category: "booking_notification",
    bookingId: booking.id,
    providerId: payload.providerId,
  },
}
```

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

## Templates currently in the codebase

### Active templates

- `packages/api-client/src/emailTemplates/providerBookingTemplate.ts`
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
  - Useful as reference, but not an active production trigger.

## Trigger-to-template map

| Trigger | File | Recipient | Template |
| --- | --- | --- | --- |
| Booking created | `packages/api-client/src/bookingService.ts` | Provider | `packages/api-client/src/emailTemplates/providerBookingTemplate.ts` |
| Booking confirmed | `apps/web/src/pages/dashboard/bookings/BookingsManagement.tsx` | Client | `supabase/functions/_shared/clientBookingStatusTemplate.ts` via `notify-booking-status` |
| Booking auto-cancelled | `supabase/functions/expire-bookings/index.ts` | Client | `supabase/functions/_shared/bookingCancellationTemplate.ts` |
| Manual/example send | `apps/web/src/components/examples/EmailComponentExample.tsx` | User/Admin | `getBookingConfirmationTemplate()` or inline HTML |

## Reusable email helpers

- `packages/api-client/src/emailService.ts`
  - `sendEmailDirect()` - generic sender through the Supabase Edge Function.
  - `sendClientBookingStatusEmail()` - specialized helper for client booking status emails.
- `apps/web/src/services/email/useEmailService.ts`
  - React hook wrapper around `sendEmailDirect()`.
  - Adds loading and error state for UI usage.

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
