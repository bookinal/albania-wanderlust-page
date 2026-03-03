# 📋 Project Architecture Analysis - Albania Booking Platform

## 🏛️ Architecture Overview

### Project Type

**Monorepo** using npm workspaces with multiple packages and applications

### Tech Stack

- **Frontend Framework**: React 18.3+ with TypeScript
- **Build Tool**: Vite 5.4+
- **UI Framework**:
  - Material-UI (MUI) v7
  - Radix UI components
  - Tailwind CSS for styling
  - shadcn/ui component library
- **Backend**: Supabase (BaaS)
  - PostgreSQL database
  - Edge Functions (Deno-based serverless)
  - Authentication
  - Storage
- **State Management**:
  - React Query (@tanstack/react-query)
  - React Hook Form
- **Routing**: React Router v7
- **Payment Integration**:
  - Stripe
  - PayPal
- **Maps**: Leaflet & React-Leaflet
- **Animations**: GSAP

---

## 📁 Monorepo Structure

```
FE-albania/
├── apps/
│   ├── web/                    # Main React web application
│   └── mobile/                 # Mobile app (React Native - not shown)
│
├── packages/                   # Shared packages
│   ├── api-client/            # Supabase API service layer
│   ├── shared-types/          # TypeScript type definitions
│   ├── hooks/                 # Shared React hooks
│   └── utils/                 # Utility functions
│
├── supabase/
│   ├── functions/             # Edge Functions
│   │   ├── create-stripe-payment-intent/
│   │   ├── confirm-stripe-payment/
│   │   ├── create-paypal-order/
│   │   ├── capture-paypal-order/
│   │   ├── stripe-webhook/
│   │   ├── paypal-webhook/
│   │   └── send-email/
│   └── migrations/            # Database migrations
│
└── public/                    # Static assets
```

---

## 🎯 Core Features

### 1. Property Management

- **Apartments** (apartments)
- **Hotels**
- **Destinations** (tourist locations)

### 2. Vehicle Rentals

- **Cars** with different types, transmissions, fuel types
- **Monthly pricing** system
- Availability calendar

### 3. Booking System

- Property bookings
- Car reservations
- Date range selection
- Pick-up/drop-off locations
- Billing and invoicing

### 4. User Management

- **Authentication** (Supabase Auth)
- **User Roles**:
  - Regular users
  - Property providers
  - Administrators
- Role request system
- User profile management

### 5. Payment Processing

- **Stripe** integration
- **PayPal** integration
- Payment intent creation
- Webhook handling
- Transaction tracking

### 6. Search & Filtering

- Property search with filters
- Car search with multiple criteria
- Map-based property discovery
- Advanced filter bar

### 7. Dashboard (Admin/Provider)

- Property management (CRUD)
- Booking management
- User management
- Request handling
- Analytics

### 8. Public Pages

- Home page with hero section
- Property listings
- Destination details
- Culture information
- Food & tourism
- Interactive map
- Wishlist

---

## 📦 Package Details

### @albania/api-client

**Purpose**: Centralized API service layer

**Services**:

- `authService` - Authentication & authorization
- `userService` - User CRUD operations
- `apartmentService` - Apartment management
- `hotelService` - Hotel management
- `carService` - Car management
- `bookingService` - Booking operations
- `destinationService` - Tourist destinations
- `paymentService` - Payment processing
- `emailService` - Email notifications
- `storageService` - File uploads/downloads
- `roleRequestService` - Role change requests
- `propertyRequest` - Property listing requests
- `monthlyPriceService` - Dynamic pricing

**Key Features**:

- Supabase client wrapper
- Type-safe API calls
- Error handling
- Real-time subscriptions

### @albania/shared-types

**Purpose**: TypeScript type definitions shared across all packages

**Type Files**:

- `apartment.type.ts` - Apartment models
- `hotel.types.ts` - Hotel models
- `car.types.ts` - Car models
- `booking.type.ts` - Booking models
- `user.types.ts` - User & role models
- `destination.types.ts` - Destination models
- `price.type.ts` - Pricing models
- `request.type.ts` - Request models
- `review.type.ts` - Review/rating models
- `search.types.ts` - Search filter types
- `email.types.ts` - Email template types

### @albania/hooks

**Purpose**: Shared React hooks

**Hooks**:

- `use-mobile` - Responsive breakpoint detection
- (Can be extended with more hooks)

### @albania/utils

**Purpose**: Utility functions (currently minimal)

---

## 🗄️ Database Architecture

### Core Tables (Inferred)

- `users` - User accounts
- `apartments` - Apartment listings
- `hotels` - Hotel listings
- `cars` - Car rentals
- `destinations` - Tourist locations
- `bookings` - Reservations
- `monthly_prices` - Dynamic pricing
- `role_requests` - User role change requests
- `property_requests` - Provider property submissions
- `email_logs` - Email tracking (from migration)

### Features

- Row Level Security (RLS)
- Foreign key relationships
- Real-time subscriptions
- File storage buckets

---

## 🔧 Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev              # Starts web app on port 8080

# Build for production
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint
```

### Workspace Commands

```bash
# Run command in specific workspace
npm run dev --workspace=@albania/web

# Run command in all workspaces
npm run lint --workspaces
```

---

## 🐳 Docker Configuration

### Production Setup

- **Multi-stage build** for optimized image size
- **Nginx** as web server
- **Alpine Linux** base images
- Health checks enabled
- Security headers configured

### Development Setup

- Hot reload with volume mounts
- Port 8080 exposed
- Source code mounted for live updates

### Key Files

- `apps/web/Dockerfile` - Production build
- `apps/web/Dockerfile.dev` - Development build
- `docker-compose.yml` - Production compose
- `docker-compose.dev.yml` - Development compose
- `apps/web/nginx.conf` - Nginx configuration

---

## 🔐 Environment Variables

### Required Variables

```env
VITE_SUPABASE_URL=              # Supabase project URL
VITE_SUPABASE_ANON_KEY=         # Supabase anonymous key
VITE_STRIPE_PUBLISHABLE_KEY=    # Stripe public key
VITE_PAYPAL_CLIENT_ID=          # PayPal client ID
VITE_PAYPAL_BASE_URL=           # PayPal API URL
VITE_FRONTEND_URL=              # Frontend URL for callbacks
```

### Why VITE\_ prefix?

Vite only exposes environment variables prefixed with `VITE_` to the client-side code for security.

---

## 🎨 Component Architecture

### Component Organization

```
src/components/
├── ui/                     # shadcn/ui components (50+ reusable)
├── home/                   # Public-facing components
│   ├── Hero
│   ├── AppBar
│   ├── PropertyCard
│   ├── data-map/          # Map components
│   └── reservationPicker
├── dashboard/             # Admin/Provider components
│   ├── AvailabilityCalendar
│   ├── ImageUpload
│   ├── MonthlyPricingEditor
│   └── MapPicker
├── payments/              # Payment components
└── ProtectedRoute         # Route guard
```

### Page Organization

```
src/pages/
├── home/                  # Public pages
│   ├── Index              # Home page
│   ├── Auth               # Login/Register
│   ├── SearchPropertyResults/
│   ├── booking/           # Booking flow
│   └── MyAccount
└── dashboard/             # Protected pages
    ├── Apartments/
    ├── Hotels/
    ├── Cars/
    ├── bookings/
    ├── Destinations/
    ├── Requests/
    └── Users/
```

---

## 🔄 Data Flow

### User Journey Example: Booking an Apartment

1. **Browse** - User views apartment listings
   - `ApartmentsPreview` component
   - `apartmentService.getApartments()`
2. **Search** - User applies filters
   - `FilterBar` component
   - `useSearchFilters` hook
3. **Select** - User clicks on apartment
   - Navigate to `ApartmentReservation`
   - `apartmentService.getApartmentById(id)`
4. **Book** - User selects dates
   - `AvailabilityCalendar` component
   - Date validation
5. **Pay** - User completes payment
   - `ApartmentBilling` component
   - `StripePaymentButton` or PayPal
   - `paymentService.createStripePaymentIntent()`
6. **Confirm** - Booking created
   - Edge function confirms payment
   - `bookingService.createBooking()`
   - Email confirmation sent

---

## 🚀 Deployment Strategy

### Current Setup

The application is configured for **Vercel** deployment (vercel.json present)

### Docker Deployment

1. Build image: `docker-compose build`
2. Run container: `docker-compose up -d`
3. Access at: `http://localhost:3000`

### Recommended Production Setup

1. **Frontend (Web App)**
   - Vercel/Netlify (static hosting)
   - Or Docker container on Cloud Run/ECS
2. **Backend (Supabase)**

   - Managed Supabase (supabase.com)
   - Or self-hosted Supabase

3. **Edge Functions**
   - Deployed via Supabase CLI
   - `supabase functions deploy`

---

## 🔍 Key Design Patterns

### 1. Service Layer Pattern

- All API calls abstracted in `@albania/api-client`
- Components never call Supabase directly
- Easy to mock for testing

### 2. Shared Types

- Single source of truth for TypeScript types
- Ensures consistency across packages
- Prevents type drift

### 3. Monorepo Workspaces

- Code reusability
- Atomic commits across packages
- Simplified dependency management

### 4. Protected Routes

- `ProtectedRoute` component wraps authenticated pages
- Role-based access control
- Automatic redirect to auth page

### 5. Optimistic UI Updates

- React Query for caching
- Optimistic mutations
- Automatic refetching

---

## ⚡ Performance Optimizations

- **Code Splitting**: React Router lazy loading
- **Image Optimization**: Next-gen formats (WebP)
- **Caching**:
  - React Query for data
  - Nginx for static assets
- **Compression**: Gzip enabled
- **Bundle Size**: Tree-shaking with Vite
- **CDN**: Static assets can be served via CDN

---

## 🧪 Testing Strategy (Recommended)

Currently no test files present. Recommended setup:

```bash
# Unit Tests
- Vitest for unit/integration tests
- React Testing Library for components

# E2E Tests
- Playwright or Cypress for end-to-end

# Type Checking
- TypeScript strict mode
- Pre-commit hooks with Husky
```

---

## 📈 Future Enhancements

### Potential Improvements

1. **Add testing suite**
2. **Implement CI/CD pipeline**
3. **Add Storybook for component documentation**
4. **Implement proper build scripts for shared packages**
5. **Add logging/monitoring (Sentry)**
6. **Implement analytics (Google Analytics)**
7. **Add Progressive Web App (PWA) features**
8. **Implement rate limiting**
9. **Add Redis for caching**
10. **Implement microservices architecture if scale requires**

---

## 📝 Notes

- The project uses **development mode for package resolution** in Docker because packages don't have build scripts
- **Type checking is disabled** during Docker builds for faster builds (Vite handles TS transpilation)
- All packages use `src` as entry point, not `dist`
- The mobile app (`apps/mobile`) is present but not configured in workspaces
- Email service uses Supabase Edge Functions, not a traditional email service

---

## 🤝 Contributing Guidelines (Recommended)

1. Create feature branch from `main`
2. Make changes in appropriate workspace
3. Run `npm run typecheck` before committing
4. Test locally with `npm run dev`
5. Create pull request with description
6. Ensure Docker build passes
7. Get review from maintainers

---

## 📞 Support & Contact

- Project Repository: [Add GitHub URL]
- Documentation: See `DOCKER_README.md` for Docker specifics
- Issue Tracker: [Add URL]

---

**Last Updated**: February 2, 2026
**Architecture Version**: 1.0
