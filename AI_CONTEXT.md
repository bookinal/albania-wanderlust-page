# AI_CONTEXT.md — BOOKinAL Project Reference

> **Purpose**: This file is the authoritative quick-reference for any AI agent working on this codebase. Read this first before exploring files. It is kept up to date as features are added.
> **Last updated**: February 23, 2026

---

## 1. Project Identity

| Field           | Value                                                     |
| --------------- | --------------------------------------------------------- |
| Name            | **BOOKinAL** – Albania Booking Platform                   |
| Type            | Tourism booking app (apartments, hotels, cars) in Albania |
| Repo root       | `c:\Users\wolow\Desktop\Albania\FE-albania`               |
| Package manager | npm 10 with **npm workspaces** (monorepo)                 |
| Main app URL    | Deployed on Vercel                                        |
| Backend         | Supabase (PostgreSQL + Auth + Storage + Edge Functions)   |

---

## 2. Monorepo Structure

```
FE-albania/
├── apps/
│   ├── web/               ← Main React web app (@albania/web)
│   └── mobile/            ← React Native app (not fully configured)
├── packages/
│   ├── api-client/        ← @albania/api-client  – all Supabase calls
│   ├── shared-types/      ← @albania/shared-types – all TypeScript types
│   ├── hooks/             ← @albania/hooks        – shared React hooks
│   └── utils/             ← @albania/utils        – utility functions
├── supabase/
│   ├── functions/         ← Deno Edge Functions
│   └── migrations/        ← SQL migrations
├── AI_CONTEXT.md          ← THIS FILE
├── ARCHITECTURE.md        ← Detailed older architecture doc
└── package.json           ← Root workspace config
```

---

## 3. Path Aliases (critical for imports)

Defined in `apps/web/vite.config.ts`. **Always use these aliases** in `apps/web/src/`:

| Alias                   | Resolves to                  |
| ----------------------- | ---------------------------- |
| `@/services/api`        | `packages/api-client/src/`   |
| `@/types`               | `packages/shared-types/src/` |
| `@`                     | `apps/web/src/`              |
| `@albania/shared-types` | `packages/shared-types/src/` |
| `@albania/api-client`   | `packages/api-client/src/`   |
| `@albania/hooks`        | `packages/hooks/src/`        |
| `@albania/utils`        | `packages/utils/src/`        |

**Examples:**

```ts
import { Booking } from "@/types/booking.type"; // shared type
import bookingService from "@/services/api/bookingService"; // api service
import { Button } from "@/components/ui/button"; // UI component
```

---

## 4. Tech Stack

### Frontend (`apps/web`)

| Category      | Library / Version                                                 |
| ------------- | ----------------------------------------------------------------- |
| Framework     | React 18.3 + TypeScript 5.8                                       |
| Build         | Vite 5.4 + `@vitejs/plugin-react-swc`                             |
| Routing       | React Router v7 (both `react-router` and `react-router-dom` used) |
| State / Data  | `@tanstack/react-query` v5 (cache: 5min stale, 10min gc)          |
| Forms         | `react-hook-form` v7 + `zod` validation + `@hookform/resolvers`   |
| UI components | shadcn/ui (Radix UI based) + MUI v7 + Tailwind CSS v3             |
| Icons         | `lucide-react` v0.462                                             |
| Payments      | `@stripe/react-stripe-js` v5 + `@paypal/react-paypal-js` v8       |
| Maps          | `leaflet` + `react-leaflet` v4                                    |
| Lightbox      | `yet-another-react-lightbox` v3                                   |
| Animations    | `gsap` v3                                                         |
| i18n          | `i18next` v25 + `react-i18next` v16                               |
| PDF           | `jspdf` v4                                                        |
| Charts        | `recharts` v2                                                     |
| Alerts        | `sweetalert2` v11                                                 |
| Date utils    | `date-fns` v3 + `dayjs` v1                                        |
| Toasts        | shadcn `useToast` + `sonner`                                      |
| Phone input   | `react-phone-number-input`                                        |

### Backend

| Category       | Detail                                           |
| -------------- | ------------------------------------------------ |
| BaaS           | Supabase (PostgreSQL 15)                         |
| Auth           | Supabase Auth (email/password + Google OAuth)    |
| Storage        | Supabase Storage (images)                        |
| Edge Functions | Deno-based serverless (in `supabase/functions/`) |
| Email          | Supabase Edge Function `send-email`              |

---

## 5. Environment Variables

All must be prefixed `VITE_` to be available in the browser:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_PAYPAL_CLIENT_ID=
VITE_PAYPAL_BASE_URL=
VITE_FRONTEND_URL=
```

---

## 6. Database Tables

All accessed via `packages/api-client/src/apiClient.ts` (Supabase JS client).

| Table               | Description                           | Key columns                                                                                                                                                                                       |
| ------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth.users`        | Supabase auth table (managed)         | `id`, `email`                                                                                                                                                                                     |
| `users` _(public)_  | Public user profiles                  | `id`, `email`, `full_name`, `role` (`user`/`admin`), `status` (`active`/`suspended`)                                                                                                              |
| `apartments`        | Apartment listings                    | `id` (int), `name`, `providerId`, `imageUrls`, `location`, `lat`, `lng`, `pricePerNight`, `status`                                                                                                |
| `hotels`            | Hotel listings                        | `id` (int), `name`, `providerId`, `imageUrls`, `location`                                                                                                                                         |
| `cars`              | Car rental listings                   | `id` (int), `name`, `brand`, `type`, `transmission`, `fuelType`, `seats`, `pricePerDay`, `providerId`, `status` (`available`/`rented`/`maintenance`/`review`)                                     |
| `booking`           | All bookings (unified)                | `id` (uuid), `userId`, `propertyId`, `propertyType` (`hotel`/`apartment`/`car`), `status` (`pending`/`confirmed`/`canceled`/`completed`), `payment_status` (`pending`/`paid`/`failed`/`refunded`) |
| `destinations`      | Tourist destinations                  | `id`, `name`, `imageUrls`, `description`                                                                                                                                                          |
| `monthly_prices`    | Dynamic pricing by month              | `propertyId`, `propertyType`, `month`, `price`                                                                                                                                                    |
| `role_requests`     | Provider role upgrade requests        | `userId`, `status`                                                                                                                                                                                |
| `property_requests` | Provider property submission requests | `userId`, `propertyType`                                                                                                                                                                          |
| `email_logs`        | Email send tracking                   | `recipient`, `template`, `status`                                                                                                                                                                 |
| `reviews`           | Property reviews (added Feb 2026)     | `id` (uuid), `user_id`, `booking_id` (unique), `property_id` (int), `property_type` (`car`/`apartment`), `rating` (1-5), `comment`, `reviewer_name`, `created_at`                                 |
| `wishlist`          | User saved properties                 | `userId`, `propertyId`, `propertyType`                                                                                                                                                            |

> **RLS**: Most tables have Row Level Security enabled. Reviews allow public reads, owner writes.

---

## 7. User Roles & Auth

```
Roles:  "user" | "admin" | "provider"
```

- Stored in `public.users.role`
- `ProtectedRoute` component redirects to `/unauthorized` if `role !== "admin" && role !== "provider"`
- Auth via `authService.getCurrentUserRole()` which queries `public.users`
- Google OAuth supported (redirects back to origin)
- On sign-up: profile automatically created in `public.users` with role `"user"`

---

## 8. All Application Routes

### Public Routes

| Path                        | Component               | Description                |
| --------------------------- | ----------------------- | -------------------------- |
| `/`                         | `Index`                 | Home page                  |
| `/auth`                     | `OAuthSignInPage`       | Login / Register           |
| `/myAccount`                | `MyAccount`             | User profile               |
| `/CultureDetails`           | `CultureDetails`        | Culture page               |
| `/destination/:id`          | `DestinationDetails`    | Destination detail         |
| `/wishlist`                 | `Wishlist`              | Saved properties           |
| `/properties-map`           | `PropertiesMapPage`     | Map view                   |
| `/searchResults`            | `SearchPropertyResults` | Hotel/apartment search     |
| `/searchCarResults`         | `SearchCarResults`      | Car search                 |
| `/hotelReservation/:id`     | `HotelReservation`      | Hotel detail page          |
| `/apartmentReservation/:id` | `ApartmentReservation`  | Apartment detail + reviews |
| `/carReservation/:id`       | `CarReservation`        | Car detail + reviews       |
| `/carBilling/:id`           | `CarBilling`            | Car checkout/billing       |
| `/apartmentBilling/:id`     | `ApartmentBilling`      | Apartment checkout/billing |
| `/myBookings`               | `BookingsSummary`       | User's bookings list       |
| `/ProviderRequest`          | `ProviderRequest`       | Request provider role      |

### Protected Routes (admin or provider only)

| Path                                    | Component                    |
| --------------------------------------- | ---------------------------- |
| `/dashboard`                            | `Dashboard`                  |
| `/dashboard/HotelsList`                 | `AllHotels`                  |
| `/dashboard/hotels/:id`                 | `HotelDetails`               |
| `/dashboard/ApartmentsList`             | `AllApartments`              |
| `/dashboard/apartments/:id`             | `ApartmentDetails`           |
| `/dashboard/carsList`                   | `AllCars`                    |
| `/dashboard/carInfo/:id`                | `CarDetails`                 |
| `/dashboard/userManagement`             | `UserManagement`             |
| `/dashboard/user-details/:userId`       | `UserDetails`                |
| `/dashboard/bookings`                   | `BookingsManagement`         |
| `/dashboard/destinations`               | `DestinationsManagement`     |
| `/dashboard/requestsManagement`         | `RequestsManagement`         |
| `/dashboard/propertyRequestsManagement` | `PropertyRequestsManagement` |
| `/dashboard/support`                    | `SupportChat`                |

---

## 9. Packages: api-client Services

All in `packages/api-client/src/`. Always import in web via `@/services/api/<name>`.

| File                     | Named exports / default        | Key functions                                                                                                                      |
| ------------------------ | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `apiClient.ts`           | `apiClient`                    | Supabase JS client (lazy init)                                                                                                     |
| `authService.ts`         | `authService` (object)         | `signUp`, `signIn`, `signInWithGoogle`, `signOut`, `getCurrentUser`, `getCurrentUserId`, `getCurrentUserRole`, `ensureUserProfile` |
| `userService.ts`         | `userService` (class instance) | `getCurrentUser`, `getUserById`, `updateUser`, `getAllUsers`                                                                       |
| `apartmentService.ts`    | named exports                  | `getApartments`, `getApartmentById`, `getApartmentUnavailabilityDates`, `createApartment`, `updateApartment`, `deleteApartment`    |
| `hotelService.ts`        | named exports                  | `getHotels`, `getHotelById`, `createHotel`, `updateHotel`, `deleteHotel`                                                           |
| `carService.ts`          | named exports                  | `getCars`, `getCarById`, `getCarUnavailabilityDates`, `createCar`, `updateCar`, `deleteCar`                                        |
| `bookingService.ts`      | `default` (object) + named     | `createBooking`, `getCurrentUserBookings`, `getBookingById`, `updateBookingStatus`, `getAllBookings`                               |
| `paymentService.ts`      | `default` (object)             | `createStripePaymentIntent`, `confirmStripePayment`, `createPayPalOrder`, `capturePayPalOrder`                                     |
| `reviewService.ts`       | named exports                  | `createReview`, `getReviewsByProperty`, `hasUserReviewedBooking`, `getPropertyAverageRating`                                       |
| `destinationService.ts`  | named exports                  | CRUD for destinations + wishlist                                                                                                   |
| `monthlyPriceService.ts` | named exports                  | `getMonthlyPrices`, `upsertMonthlyPrice`                                                                                           |
| `emailService.ts`        | named exports                  | `sendEmailDirect`, `getProviderBookingNotificationTemplate`                                                                        |
| `storageService.ts`      | named exports                  | Image upload/delete to Supabase Storage                                                                                            |
| `roleRequestService.ts`  | `roleRequestService`           | `createRoleRequest`, `getAllRoleRequests`, `updateRoleRequestStatus`                                                               |
| `propertyRequest.ts`     | named exports                  | Property listing requests from providers                                                                                           |
| `chatService.ts`         | named exports                  | Support chat messages                                                                                                              |

---

## 10. Shared Types

All in `packages/shared-types/src/`. Import via `@/types/<file>`.

| File                   | Main interfaces                                              |
| ---------------------- | ------------------------------------------------------------ |
| `user.types.ts`        | `User`, `UserProfile`, `UpdateUser`, `UpdateUserProfileData` |
| `apartment.type.ts`    | `Apartment`, `CreateApartmentDto`, `PREDEFINED_AMENITIES`    |
| `hotel.types.ts`       | `Hotel`, `CreateHotelDto`, `UpdateHotelDto`, `HotelFilters`  |
| `car.types.ts`         | `Car`, `CreateCarDto`, `UpdateCarDto`, `CarFilters`          |
| `booking.type.ts`      | `Booking`, `CreateBookingDto`                                |
| `review.type.ts`       | `Review`, `CreateReviewDto`                                  |
| `destination.types.ts` | `Destination`                                                |
| `price.type.ts`        | `MonthlyPriceInput`, `Month`, `MONTHS`, `MONTH_NAMES`        |
| `request.type.ts`      | `RoleRequest`, `PropertyRequest`                             |
| `search.types.ts`      | Search filter interfaces                                     |
| `email.types.ts`       | Email template types                                         |
| `chat.types.ts`        | `ChatMessage`                                                |

---

## 11. Component Structure (`apps/web/src/components/`)

```
components/
├── ui/                    ← shadcn/ui primitives (button, dialog, input, etc.)
│                            50+ components, never modify these directly
├── home/                  ← Public-facing UI
│   ├── AppBar.tsx         ← Top navigation bar (used on all public pages)
│   ├── Footer.tsx         ← Global footer
│   ├── Hero/              ← Landing hero section
│   ├── PropertyCard/      ← Apartment/hotel card
│   ├── data-map/          ← Map components (Leaflet)
│   └── reservationPicker/ ← Date range picker for booking
├── dashboard/             ← Admin/provider UI
│   ├── AvailabilityCalendar.tsx  ← Blocked dates calendar (car/apartment)
│   ├── ImageUpload.tsx    ← Supabase storage image uploader
│   ├── MonthlyPricingEditor.tsx  ← Per-month price CRUD
│   └── mapPicker.tsx      ← Leaflet map coordinate picker
├── payments/
│   └── StripePaymentButton.tsx   ← Stripe payment UI
├── chat/
│   └── UserChatWidget.tsx ← Floating support chat widget
├── reviews/               ← Added Feb 2026
│   ├── ReviewModal.tsx    ← Dialog for submitting a review (stars + text)
│   └── ReviewsSection.tsx ← Displays all reviews for a property
├── LanguageSwitcher.tsx   ← EN/SQ toggle
└── ProtectedRoute.tsx     ← Route guard for admin/provider pages
```

---

## 12. Internationalization (i18n)

- **Languages**: English (`en`) and Albanian (`sq`)
- **Setup**: `apps/web/src/i18n/i18n.ts` + `apps/web/src/i18n/locales/en.json` + `sq.json`
- **Usage**: Always use `const { t } = useTranslation()` in components

```tsx
// Pattern for new translation keys:
t("review.addReview", "Add Review"); // key, fallback string
```

- When adding new UI text, add keys to **both** `en.json` and `sq.json`
- Translation key namespacing by feature: `booking.*`, `review.*`, `billing.*`, `common.*`, etc.

---

## 13. Payment Flow

### Stripe

1. User clicks `StripePaymentButton` (in `components/payments/`)
2. Calls Edge Function `create-stripe-payment-intent`
3. Returns `clientSecret`
4. Stripe Elements collects card
5. `confirm-stripe-payment` Edge Function confirms
6. `stripe-webhook` updates `booking.payment_status` to `"paid"`

### PayPal

1. `PayPalPaymentButton` (inline in `BookingsSummary`)
2. `createOrder` → calls `create-paypal-order` Edge Function
3. `onApprove` → calls `capture-paypal-order` Edge Function
4. Booking updated to `payment_status: "paid"`

---

## 14. Supabase Edge Functions (`supabase/functions/`)

| Function folder                 | Trigger        | Purpose                           |
| ------------------------------- | -------------- | --------------------------------- |
| `create-stripe-payment-intent/` | HTTP POST      | Creates Stripe PaymentIntent      |
| `confirm-stripe-payment/`       | HTTP POST      | Confirms Stripe payment           |
| `stripe-webhook/`               | Stripe webhook | Updates booking on payment events |
| `create-paypal-order/`          | HTTP POST      | Creates PayPal order              |
| `capture-paypal-order/`         | HTTP POST      | Captures PayPal payment           |
| `paypal-webhook/`               | PayPal webhook | Updates booking on PayPal events  |
| `send-email/`                   | HTTP POST      | Sends transactional emails        |

All Edge Functions are Deno runtime. Deploy with:

```bash
supabase functions deploy <function-name>
```

---

## 15. Booking Flow (User Journey)

```
Browse property  →  Detail page (CarReservation / ApartmentReservation / HotelReservation)
       ↓
Select dates  (AvailabilityCalendar blocks already-booked dates)
       ↓
Billing page (CarBilling / ApartmentBilling)
  - createBooking() → status: "pending", payment_status: "pending"
  - Email sent to provider
       ↓
Admin/Provider confirms booking → status: "confirmed"
       ↓
User pays (BookingsSummary page)
  - StripePaymentButton or PayPalPaymentButton
  - payment_status → "paid"
       ↓
User can:
  - Download Invoice PDF (jsPDF)     [condition: payment_status === "paid"]
  - Add Review                        [condition: payment_status === "paid" && propertyType === "car"|"apartment"]
```

---

## 16. Reviews Feature (Added Feb 2026)

### Database

Table: `reviews`

```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES auth.users
booking_id UUID REFERENCES booking (UNIQUE)  -- one review per booking
property_id INTEGER
property_type TEXT CHECK IN ('car', 'apartment')
rating INTEGER CHECK 1-5
comment TEXT
reviewer_name TEXT
created_at, updated_at TIMESTAMP
```

RLS: public read, owner write/update/delete.

### Who can review?

Only users where `booking.payment_status === "paid"` AND `booking.propertyType === "car" | "apartment"`. Hotel reviews are **not implemented yet**.

### Files

| File                                                 | Role                                                                                         |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `packages/shared-types/src/review.type.ts`           | `Review`, `CreateReviewDto`                                                                  |
| `packages/api-client/src/reviewService.ts`           | `createReview`, `getReviewsByProperty`, `hasUserReviewedBooking`, `getPropertyAverageRating` |
| `apps/web/src/components/reviews/ReviewModal.tsx`    | Review submission dialog                                                                     |
| `apps/web/src/components/reviews/ReviewsSection.tsx` | Review display on property pages                                                             |

### Where displayed?

- `CarReservation.tsx` — after `AvailabilityCalendar`
- `ApartmentReservation.tsx` — after `AvailabilityCalendar`
- `BookingsSummary.tsx` — "Add Review" button on eligible bookings

### React Query cache key pattern

```ts
queryKey: ["reviews", String(propertyId), propertyType];
```

---

## 17. React Query Conventions

```ts
// Query key patterns:
["bookings", "currentUser"][("reviews", String(propertyId), propertyType)][
  ("car", id)
][("apartment", id)];

// Invalidation after mutation:
await queryClient.invalidateQueries({
  queryKey: ["reviews", propertyId, propertyType],
});
```

Global QueryClient config (in `App.tsx`):

- `staleTime`: 5 minutes
- `gcTime`: 10 minutes
- `retry`: 1
- `refetchOnWindowFocus`: false

---

## 18. Key Patterns to Follow

### Adding a new API service

1. Create `packages/api-client/src/<feature>Service.ts`
2. Use `apiClient` from `./apiClient`
3. Import types from `@albania/shared-types`
4. Export named functions
5. Add export to `packages/api-client/src/index.ts`

### Adding a new type

1. Create or edit file in `packages/shared-types/src/`
2. Export from `packages/shared-types/src/index.ts`

### Adding a new page

1. Create component in `apps/web/src/pages/`
2. Register route in `apps/web/src/App.tsx`
3. Wrap in `<ProtectedRoute>` if admin/provider only

### Adding a new Supabase table

1. Write migration SQL
2. Apply via Supabase MCP tool (`mcp_supabase_apply_migration`)
3. Enable RLS + add policies
4. Add type to `shared-types`
5. Add service to `api-client`

### UI component usage

- Prefer shadcn/ui from `@/components/ui/` for all primitives
- Use `lucide-react` for all icons
- Use `useToast()` for notifications
- Use `Swal.fire()` for confirmation dialogs (sweetalert2)
- All pages include `<PrimarySearchAppBar />` at the top

---

## 19. Naming Conventions

| Thing              | Convention                | Example                       |
| ------------------ | ------------------------- | ----------------------------- |
| Components         | PascalCase                | `ReviewModal.tsx`             |
| Services           | camelCase + "Service"     | `reviewService.ts`            |
| Types              | PascalCase interface      | `CreateReviewDto`             |
| DB tables          | snake_case                | `reviews`, `monthly_prices`   |
| DB columns         | snake_case                | `user_id`, `created_at`       |
| React Query keys   | `["entity", "qualifier"]` | `["bookings", "currentUser"]` |
| Route paths        | camelCase or kebab-case   | `/carReservation/:id`         |
| i18n keys          | `namespace.key` camelCase | `review.addReview`            |
| Files (services)   | camelCase                 | `reviewService.ts`            |
| Files (components) | PascalCase                | `ReviewsSection.tsx`          |

---

## 20. Known Quirks & Gotchas

1. **"Apartment" typo** — intentional codebase convention. The DB table is `apartments`, the type is `Apartment`, the service is `apartmentService`. The route is `/apartmentReservation/:id`.
2. **Dual router imports** — some files import from `react-router`, others from `react-router-dom`. Both work (v7 re-exports).
3. **Packages resolve to `src/`** — In dev mode, aliases point to `packages/*/src/`, not `dist/`. No build step needed for packages during development.
4. **`booking` table name** (singular) — The bookings table is called `booking` not `bookings`.
5. **Hotels excluded from reviews** — Reviews only work for `car` and `apartment` property types.
6. **PropertyId is a number (int) for cars/apartments** — But `booking.propertyId` is stored as a string. Parse with `parseInt()` when querying.
7. **Email notifications** — Sent via Edge Function on booking creation, not client-side.
8. **MUI and shadcn/ui coexist** — Dashboard uses MUI heavily; public pages use shadcn/ui + Tailwind.
9. **`@mui/icons-material`** — Used in some apartment reservation amenity icons. Import `{ Pool, Spa }` from `@mui/icons-material`.

---

## 21. Development Commands

```bash
# From repo root:
npm install                    # Install all workspace deps
npm run dev                    # Start web app (port 8080) + package watcher
npm run typecheck              # TypeScript check all packages
npm run build                  # Production build

# Docker:
npm run docker:dev             # Dev with hot reload
npm run docker:up              # Production docker

# Supabase:
npm run supa functions deploy <name>   # Deploy edge function
npm run supa db push                   # Apply migrations
```
