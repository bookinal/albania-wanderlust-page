# WhatsApp provider alerts

When a client sends a booking request, the provider gets a WhatsApp message on
their phone (in addition to the email), sent from the BOOKinAL WhatsApp Business
number through the official **WhatsApp Business Cloud API** (Meta).

## How it works

1. The client confirms the request on the booking ticket → the booking is created.
2. The app calls the edge function `notify-provider-whatsapp` (fire-and-forget:
   a WhatsApp problem never blocks the booking, and the email is still sent).
3. The function checks the caller is the client who made the booking, that it is a
   fresh pending request (< 15 minutes) and that no alert was sent yet, then sends
   the approved template to the provider's phone (`users.phone`).
4. The outcome is saved on the booking in `provider_whatsapp_status`:
   `sent`, `failed` (+ `provider_whatsapp_error`), `no_phone`, `not_configured`.

The guest's phone and email are never sent in the message: they unlock only
after payment (cars) or confirmation (apartments).

Code: `supabase/functions/notify-provider-whatsapp/`, `supabase/functions/_shared/whatsapp.ts`,
`packages/api-client/src/bookingService.ts` (`notifyProviderWhatsApp`),
migration `20261029090000_provider_whatsapp_notifications.sql`.

## Status (updated 6 Nov 2026)

**Dev works end to end with Meta's test number**: booking `2f25f994…` got
`provider_whatsapp_status = sent` and the message arrived on the provider phone.

What exists today (IDs are not secrets):

| Item | Value |
| --- | --- |
| Meta business portfolio | BookinAl, `business_id=1085017634162057` |
| Meta app | `1650425463247873` (WhatsApp use case added) |
| WhatsApp account (test) | "Test Messaging Account", WABA `1081347718064761` |
| Test number | +1 555 632 5802, Phone Number ID `1387408317789594` |
| Allowed recipient (test number only) | +216 25 516 261 (provider account used for tests) |
| Template | `new_booking_request`, Utility, **English (`en`)**, Active, in the test WABA |
| Token | permanent system user token (admin system user, full control of the app and of the test WhatsApp account) |
| Dev Supabase (`futuwdbxszdovuliybfu`) | migration applied, `notify-provider-whatsapp` deployed, secrets `WHATSAPP_ACCESS_TOKEN` + `WHATSAPP_PHONE_NUMBER_ID` set, `WHATSAPP_TEMPLATE_LANGUAGE` must stay **unset** (default `en`) |
| Dev number since 6 Nov 2026 | real number, Phone Number ID `1487116434487028` |
| Prod Supabase (`yjhfnpzqhiljkgxdbmka`) | nothing done yet |

Problems already hit (and fixed), in order: `131030` recipient not in the test number's
allowed list → `132001` template not created yet → `190` the secret was the 24 h token
from API Setup → replaced by the system user token. A `WHATSAPP_TEMPLATE_LANGUAGE=en_US`
secret was also set by mistake: the template is `en`, so it must be unset.

### Production number (5 Nov 2026)

**+355 68 434 3068 is registered and connected.**

| Item | Value |
| --- | --- |
| WhatsApp account (production) | "BookinAl", WABA `1889682209143197` |
| Phone Number ID | `1487116434487028` |
| Display name | Live: BookinAl. Rename to BookinAL requested on 5 Nov 2026, Meta review still pending on 6 Nov |
| Template | `new_booking_request`, Utility, English, **Active** (quality rating pending until messages are sent) |
| Time zone on the account | Europe/Tirane |
| System user | `bookinal-api` has full access to this account |
| Portfolio legal details | Flavi Mema, Person Fizik, NUIS `M52123021A`, from the QKB extract |

Steps 1, 2, 4 and 5 below are done. Still open: payment method, business verification, Supabase.

Payment: utility templates sent outside a customer service window are billed per message, and Meta's setup
page asks for a payment method to send business-initiated messages. The old 1,000 free conversations do not
apply here, so sending to providers needs a payment method.

Delivery: left on the default validity. The template editor says the standard is 10 minutes, but Meta's docs
say 30 days for utility messages, with a custom value capped at 12 hours, so a custom value could shorten it.
To settle it, include a phone-off test in the real booking test: turn the provider's phone off, book, wait
more than 10 minutes, then turn it back on and see if the alert arrives.

`provider_whatsapp_status = sent` only means Meta accepted the message. Failures after that, such as a missing
payment method, arrive through a webhook, and this project has none, so the app can't see them. On 6 Nov 2026 dev
was switched to the real number: the function returned `sent`, no message arrived, and WhatsApp Manager showed 0
messages sent on the number with a "missing valid payment method" alert. To go back to the test number on dev, set
`WHATSAPP_PHONE_NUMBER_ID=1387408317789594`.

Errors hit on the way:
- `#2494064`, number already linked to a WhatsApp account: delete that account in the app, wait 3 minutes.
- `#2494070`, business doesn't meet WhatsApp's policy criteria: went away after completing the portfolio's
  legal name, address, phone, website and tax ID. The business was not verified yet at that point, so
  verification is not required just to register the number.

The postal code on the portfolio (1032, Vore) is not on the QKB documents: it came from a web lookup and
still needs confirming.

### Next steps (production number)
1. Pick the real number (Albanian +355 preferred): it must receive an SMS or voice call
   and must **not** be registered in the WhatsApp / WhatsApp Business app.
2. API Setup → *Étape 2. Configuration de la production* → add the number, display name
   **BOOKinAL**, verify the code. Meta usually creates a **new WhatsApp account** for it:
   note its new **Phone Number ID**.
3. WhatsApp Manager: add a payment method. Business settings: start business verification
   (*Étape 3*) to lift the 250 recipients / 24 h limit.
4. Business settings → *Comptes WhatsApp* → new number → *Affecter des personnes* → the
   system user, full control. Regenerate the token only if sending fails with a permission error.
5. Create `new_booking_request` again in the **new** WhatsApp account (templates belong to
   one account), same content as below, language **English**.
6. Prod Supabase (checked on 9 Nov 2026 with read-only probes):
   - the Supabase account logged in on this PC gets a 403 on the prod project: log in with an account that has
     access (`npx supabase login`), or ask Flavi to invite this one to the prod organization;
   - SQL editor, in this order: `20261024090000_free_apartment_bookings.sql`, `20261029090000_provider_whatsapp_notifications.sql`,
     `20261105100000_featured_destinations_ten_slots.sql`. The WhatsApp columns are missing on prod; the other two
     can't be probed, and all three are safe to run again. Everything else (up to `20261106090000`) is already there;
   - `npx supabase functions deploy --project-ref yjhfnpzqhiljkgxdbmka` (all functions: `_shared/contactUnlockNotifications.ts`
     changed, and the Stripe functions use it too);
   - `npx supabase secrets set WHATSAPP_ACCESS_TOKEN=<token> WHATSAPP_PHONE_NUMBER_ID=1487116434487028 --project-ref yjhfnpzqhiljkgxdbmka`
     (same system user token as dev; leave `WHATSAPP_TEMPLATE_LANGUAGE` unset);
   - deploy the web app right after the functions (Vercel builds from `main`): the old app sends the provider email
     through `send-email`, which now rejects it, so providers get no new booking email until the new app is live.
   - Separate issue found on the way: `stripe-webhook` and `paypal-webhook` have the gateway JWT check on (dev and prod),
     so Stripe and PayPal calls get a 401 before the code runs. Payments still complete through the app's own calls.
7. Provider consent (Meta opt-in policy): the wording is on the *Become a Provider* form and under the phone
   field in *My Account* (providers only). Still to do: tell the providers who joined before this wording,
   or were made providers by an admin, because they never saw it. Optional: a "Receive WhatsApp alerts" switch
   in the provider profile, which would also keep a record of each provider's choice.

Tips: in PowerShell use `npx supabase … --project-ref …` (`npm run supa -- …` loses the
`--project-ref` flag). In the template editor, typing `{{` inserts the next numbered
variable by itself: don't type the number and the closing braces.

## Setup

### 1. Meta accounts
1. Create a Meta Business portfolio at business.facebook.com (verify the business
   later to lift the messaging limits).
2. developers.facebook.com → *My Apps* → *Create app* → type **Business** → add the
   **WhatsApp** product.
3. Under *WhatsApp > API Setup*, Meta gives a free **test number**. You can send to
   up to 5 recipient numbers that you verify there: use it for development.
4. For production, add the platform's own number (*Add phone number*). It must not
   be registered in the WhatsApp or WhatsApp Business **app** (use a new SIM or
   delete the account from the app first). Set the display name "BOOKinAL".
5. Add a payment method in WhatsApp Manager (utility messages are paid per message).

### 2. Permanent access token
Business settings → *Users > System users* → add an **Admin** system user →
*Add assets* → the app (full control) → *Generate token* with the permissions
`whatsapp_business_messaging` and `whatsapp_business_management`, expiry **Never**.
(The token shown on the API Setup page expires after 24 h: don't use it in production.)

### 3. Message template
WhatsApp Manager → *Message templates* → *Create template*:

- Category: **Utility** · Name: `new_booking_request` · Language: **English**
- Body (keep the variable order):

```
Hello {{1}}, you have a new booking request on BOOKinAL.

Property: {{2}}
Dates: {{3}}
Guest: {{4}}
Total: {{5}}

Please confirm or decline it in your dashboard so the guest can complete the booking.
```

- Sample values: `Ana` · `Car: Volkswagen Golf 7` · `28 Oct 2026 → 31 Oct 2026` · `John Doe` · `€430.00`
- Button: *Visit website* · text `Review request` · static URL `https://bookinal.com/dashboard/bookings`

Approval usually takes minutes to a few hours. Other languages: create the same
template in that language and set `WHATSAPP_TEMPLATE_LANGUAGE` (one language for all
providers for now).

### 4. Supabase secrets
Dashboard → Edge Functions → Secrets (or `supabase secrets set NAME=value`):

| Secret | Value |
| --- | --- |
| `WHATSAPP_ACCESS_TOKEN` | permanent system user token (step 2) |
| `WHATSAPP_PHONE_NUMBER_ID` | *Phone number ID* from API Setup (an id, not the phone number) |
| `WHATSAPP_TEMPLATE_NEW_REQUEST` | optional, default `new_booking_request` |
| `WHATSAPP_TEMPLATE_LANGUAGE` | optional, default `en` |
| `WHATSAPP_GRAPH_VERSION` | optional, default `v25.0` |

### 5. Database and deploy
1. Run `supabase/migrations/20261029090000_provider_whatsapp_notifications.sql`.
2. `supabase functions deploy notify-provider-whatsapp`

Until the secrets are set the function records `not_configured` and the app keeps
working with emails only.

## Testing
- Use the test number and add your own phone as a recipient in *API Setup*.
- Set that phone (international format, e.g. `+355 69 123 4567`) on a provider account.
- Book one of that provider's properties with another account.
- Check the result: `select provider_whatsapp_status, provider_whatsapp_error from booking order by "createdAt" desc limit 5;`
  and the function logs (Edge Functions → notify-provider-whatsapp → Logs).

Common errors in `provider_whatsapp_error`:
- `131030` recipient not in the allowed list → add the number in *API Setup* (test number only).
- `132001` template does not exist in this language → name/language mismatch or not approved yet.
- `190` / `OAuthException` → token expired or missing permissions (the API Setup token
  expires after 24 h: use the system user token).
- `131026` the number has no WhatsApp account.

## Rules to keep in mind
- Providers must agree to receive WhatsApp messages (Meta opt-in policy): mention it in
  the provider terms / sign-up. Messages from users who block the number lower its quality rating.
- Only approved templates can start a conversation; free text is possible only for 24 h
  after the provider writes to the number.
