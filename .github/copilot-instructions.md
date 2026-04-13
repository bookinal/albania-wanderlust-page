# Copilot Instructions for BOOKinAL (Albania Booking Platform)

## Quick Reference

- **Project**: BOOKinAL – Tourism booking platform (apartments, hotels, cars) in Albania
- **Root**: `FE-albania` (npm monorepo)
- **Main App**: `@albania/web` (React 18 + TypeScript + Vite)
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Deployment**: Vercel

---

## Build, Test, and Lint Commands

All commands run from repository root unless specified.

### Development

```bash
npm run dev              # Start web app + watch packages (port 8080)
npm run dev:prod        # Start web app in production mode while watching packages
npm run dev:packages    # Watch TypeScript compilation for all packages
```

### Building

```bash
npm run build           # Build web app for production
npm run build:web       # Explicit: build only web app
```

### Code Quality

```bash
npm run lint            # Run ESLint on all workspaces
npm run typecheck       # TypeScript type checking (all packages)
npm run preview         # Preview production build locally
```

### Workspace-Specific Commands

Run in a specific workspace (example with `@albania/web`):

```bash
npm run dev --workspace=@albania/web
npm run lint --workspace=@albania/web
npm run build --workspace=@albania/api-client
```

### Docker (Development & Production)

```bash
npm run docker:build    # Build production image
npm run docker:up       # Start production containers
npm run docker:dev      # Start development containers with hot reload
npm run docker:logs     # View container logs
npm run docker:down     # Stop containers
```

### Supabase (Backend)

```bash
npm run supa start      # Start Supabase locally
npm run supa functions deploy <function-name>  # Deploy edge functions
```

---

## High-Level Architecture

### Monorepo Structure

```
FE-albania/
├── apps/
│   ├── web/                    # @albania/web – Main React app
│   └── mobile/                 # React Native (not fully configured)
├── packages/                   # Shared code (consumed by apps)
│   ├── api-client/            # @albania/api-client – all Supabase API calls
│   ├── shared-types/          # @albania/shared-types – single source of truth for types
│   ├── hooks/                 # @albania/hooks – shared React hooks
│   └── utils/                 # @albania/utils – utility functions
├── supabase/
│   ├── functions/             # Deno Edge Functions (payments, email, webhooks)
│   └── migrations/            # SQL migrations
└── public/                    # Static assets
```

### Key Design Patterns

1. **Service Layer** (`@albania/api-client`)
   - All Supabase calls are abstracted here
   - Components never call Supabase directly
   - Improves testability and maintainability

2. **Shared Types** (`@albania/shared-types`)
   - Single source of truth for TypeScript definitions
   - Prevents type drift across packages
   - **Key types**: `apartment.type.ts`, `booking.type.ts`, `user.types.ts`, `car.types.ts`, `hotel.types.ts`, `destination.types.ts`, `price.type.ts`, `review.type.ts`, `request.type.ts`

3. **React Query (TanStack Query)**
   - Handles data caching: 5-minute stale time, 10-minute garbage collection
   - Enables optimistic UI updates
   - Auto-refetching on window focus

4. **Protected Routes**
   - `ProtectedRoute` component wraps authenticated pages
   - Role-based access control (users, providers, admins)
   - Auto-redirects to auth page if not logged in

### Data Flow Example: Booking an Apartment

1. **Browse** → `ApartmentsPreview` component calls `apartmentService.getApartments()`
2. **Search** → `FilterBar` applies filters via `useSearchFilters` hook
3. **Select** → Navigate to `ApartmentReservation`, fetch details with `apartmentService.getApartmentById(id)`
4. **Dates** → `AvailabilityCalendar` component + date validation
5. **Payment** → `StripePaymentButton` or PayPal via `paymentService.createStripePaymentIntent()`
6. **Confirm** → Edge function confirms payment, `bookingService.createBooking()`, email sent

### Component Organization

```
apps/web/src/
├── components/
│   ├── ui/                   # shadcn/ui reusable components (50+)
│   ├── home/                 # Public-facing (Hero, PropertyCard, etc.)
│   ├── dashboard/            # Admin/provider (Calendar, ImageUpload, etc.)
│   ├── payments/             # Payment-related components
│   └── ProtectedRoute        # Auth guard component
├── pages/
│   ├── home/                 # Public pages (Index, Auth, SearchResults, booking/, MyAccount)
│   └── dashboard/            # Protected pages (Apartments, Hotels, Cars, bookings, etc.)
├── hooks/                    # Component-specific hooks
├── services/                 # Local service layer (some calls to @albania/api-client)
└── utils/                    # Local utilities
```

---

## Key Conventions

### Import Paths (Path Aliases)

**In `apps/web/src/`**, use these aliases (defined in `apps/web/vite.config.ts`):

```ts
// Shared types
import { Booking } from "@/types/booking.type";
import { User } from "@albania/shared-types";

// API services
import bookingService from "@/services/api/bookingService";
import apartmentService from "@/services/api/apartmentService";

// UI components
import { Button } from "@/components/ui/button";

// Shared hooks
import { useMobile } from "@albania/hooks";

// Utilities
import { someUtil } from "@albania/utils";
```

**Do NOT use relative imports** when path aliases are available.

### TypeScript Configuration

- **Strict mode**: Disabled (gradual migration in progress)
- **Module format**: ES modules (`"type": "module"` in package.json)
- **Compilation**: Uses TypeScript project references for faster incremental builds
- **In Docker builds**: Type checking is skipped for speed; Vite handles transpilation

### ESLint Rules

- **File coverage**: `**/*.{ts,tsx}`
- **Custom rules**:
  - `react-refresh/only-export-components`: Components must be pure exports (not logic)
  - `@typescript-eslint/no-unused-vars`: Disabled (gradual cleanup)
  - React Hooks rules enforced

**Run locally**: `npm run lint` or `npm run lint --workspace=@albania/web`

### State Management

- **Data fetching**: `@tanstack/react-query` (cache: 5min stale, 10min gc)
- **Forms**: `react-hook-form` + `zod` validation
- **Local state**: React `useState`
- **Context** (if needed): Create in `apps/web/src/context/`

### Styling

- **Framework**: Tailwind CSS v3 (primary)
- **Component library**: Radix UI (via shadcn/ui) + MUI v7 (supplementary)
- **Styled-components**: Used for some advanced styling
- **Emotion**: Used by MUI for theme support

### Environment Variables

**Must be prefixed with `VITE_`** to expose to client (Vite security rule):

```env
VITE_SUPABASE_URL=              # Supabase project URL
VITE_SUPABASE_ANON_KEY=         # Supabase anonymous key
VITE_STRIPE_PUBLISHABLE_KEY=    # Stripe public key
VITE_PAYPAL_CLIENT_ID=          # PayPal client ID
VITE_PAYPAL_BASE_URL=           # PayPal API URL (sandbox or production)
VITE_FRONTEND_URL=              # Frontend URL for payment callbacks
```

### Package Entry Points

- **Packages without build scripts** (api-client, shared-types, etc.) use `src/` directly in development mode. Docker builds use development mode for this reason.
- **Main exports** typically in `src/index.ts` (check each package's `package.json` for `main` and `exports` fields)

---

## Edge Functions (Supabase)

Located in `supabase/functions/`:

- **`create-stripe-payment-intent`** – Create payment intent for Stripe
- **`confirm-stripe-payment`** – Confirm/capture Stripe payment
- **`create-paypal-order`** – Create PayPal order
- **`capture-paypal-order`** – Capture PayPal payment
- **`stripe-webhook`** – Handle Stripe webhooks
- **`paypal-webhook`** – Handle PayPal webhooks
- **`send-email`** – Email notification service (Deno-based)

**Deploy changes**:
```bash
npm run supa functions deploy create-stripe-payment-intent
```

---

## Common Workflows

### Adding a New Feature to a Shared Package

1. Add types to `packages/shared-types/src/`
2. Add logic/services to `packages/api-client/src/`
3. Import in `@albania/web` using path aliases
4. Run `npm run typecheck` to verify
5. Run `npm run lint` to check style

### Adding a New Page

1. Create folder in `apps/web/src/pages/`
2. Export default component from `index.tsx`
3. Add route to `apps/web/src/router.tsx` or routing file
4. Wrap with `<ProtectedRoute>` if authentication required

### Modifying API Service

1. Update types in `packages/shared-types/src/`
2. Update service in `packages/api-client/src/`
3. Update components consuming the service
4. Run `npm run typecheck`

### Database Changes

1. Create migration in `supabase/migrations/`
2. Run locally: `npm run supa start`
3. Test migration
4. Push to production via Supabase CLI

---

## Troubleshooting

### TypeScript Errors After Dependency Changes

```bash
npm run clean           # Remove all node_modules
npm install
npm run typecheck
npx tsc --build --clean && npx tsc --build
```

### Port Already in Use

Vite automatically tries the next available port (8081, 8082, etc.) if 8080 is in use.

### Module Resolution Issues

Verify path aliases in `apps/web/vite.config.ts` match `packages/` structure.

---

## Deployment

### Frontend (Vercel)

- Configured via `vercel.json`
- Automatic deployments on push to main

### Docker

- Production build: `npm run docker:build && npm run docker:up`
- Uses multi-stage builds with Alpine for size optimization
- Nginx serves static assets with security headers

### Supabase

- Use managed Supabase or self-hosted
- Edge functions deployed via CLI
- Database migrations applied manually or via CI/CD

---

## Recent Changes & Notes

- **TypeScript project references** enabled for faster builds
- **Packages don't have build scripts** – development mode resolves `src/` directly
- **Mobile app** (`apps/mobile`) present in repo but not fully configured in workspaces
- **Type checking disabled in Docker** for faster builds; Vite handles transpilation
- **React Router v7** in use (both `react-router` and `react-router-dom` packages)
- **No test files** currently present (Vitest + React Testing Library recommended for future)

---

## Recommended MCP Servers

### Playwright MCP
**Use case**: E2E testing of booking flows, payment integrations, and user interactions.

Features:
- Browser automation and testing
- Visual regression testing
- Performance profiling
- Screenshot and video recording

Setup:
```bash
npm install --save-dev @playwright/test
npx playwright install
```

Recommended for:
- Testing apartment booking flow end-to-end
- Verifying payment gateway integrations (Stripe, PayPal)
- Testing map interactions and search filters
- Multi-browser compatibility testing

---

## References

- **AI_CONTEXT.md** – Quick reference for AI agents (updated regularly)
- **ARCHITECTURE.md** – Detailed architecture and feature breakdown
- **README.md** – User-facing documentation and getting started guide
