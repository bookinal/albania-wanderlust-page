# Albania Monorepo - FE Application

A monorepo project for the Albania tourism platform, featuring a web application built with React + Vite and a planned mobile application using React Native.

## 📁 Project Structure

```
FE-albania/
├── apps/
│   ├── web/                 # React + Vite web application
│   └── mobile/             # React Native mobile app (coming soon)
├── packages/
│   ├── api-client/         # Shared API client services
│   ├── shared-types/       # TypeScript type definitions
│   ├── hooks/              # Shared React hooks
│   └── utils/              # Shared utility functions
└── supabase/               # Supabase backend functions and migrations
```

## 🛠️ Tech Stack

- **Web Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **UI Components:** Radix UI, Material-UI
- **Styling:** Tailwind CSS
- **State Management:** TanStack Query (React Query)
- **Backend:** Supabase (PostgreSQL, Authentication, Storage)
- **Payment:** PayPal Integration
- **Maps:** Leaflet + React Leaflet

## 📋 Prerequisites

- **Node.js:** v18 or higher
- **npm:** v10 or higher
- **Supabase CLI:** (optional, for backend development)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd FE-albania
```

### 2. Install Dependencies

Install all workspace dependencies from the root:

```bash
npm install
```

This will install dependencies for:

- Root workspace
- Web application (`apps/web`)
- All shared packages (`packages/*`)

### 3. Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
VITE_PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
VITE_PAYPAL_CLIENT_SECRET=your_paypal_client_secret
VITE_FRONTEND_URL=http://localhost:8080
```

## 🖥️ Running the Web Application

### Development Mode

Start the development server with hot reload:

```bash
npm run dev:web
```

The application will be available at `http://localhost:8080` (or the next available port).

### Build for Production

Build the web application for production:

```bash
npm run build:web
```

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## 📱 Running the Mobile Application

> **Note:** The mobile application is currently under development.

Once the React Native mobile app is set up, you'll be able to run it with:

```bash
npm run dev:mobile
```

### Prerequisites for Mobile Development

- **React Native CLI** or **Expo CLI**
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

## 🔧 Available Scripts

From the root directory:

| Command              | Description                                        |
| -------------------- | -------------------------------------------------- |
| `npm run dev`        | Start web development server (alias for `dev:web`) |
| `npm run dev:web`    | Start web development server                       |
| `npm run dev:mobile` | Start mobile development (coming soon)             |
| `npm run build`      | Build web app for production                       |
| `npm run build:web`  | Build web app for production                       |
| `npm run lint`       | Run ESLint on all workspaces                       |
| `npm run preview`    | Preview production build                           |
| `npm run typecheck`  | Run TypeScript type checking                       |
| `npm run clean`      | Remove all node_modules                            |

## 🏗️ Workspace Commands

Run commands in specific workspaces:

```bash
# Run a command in the web workspace
npm run <command> --workspace=@albania/web

# Install a package in the web workspace
npm install <package-name> --workspace=@albania/web

# Run a command in a specific package
npm run <command> --workspace=@albania/api-client
```

## 📦 Workspace Packages

### `@albania/api-client`

Shared API client services for interacting with Supabase backend.

**Features:**

- Apartment, Hotel, and Car services
- Booking and payment services
- User authentication and management
- Storage service for file uploads

### `@albania/shared-types`

TypeScript type definitions shared across web and mobile applications.

### `@albania/hooks`

Custom React hooks used across the applications.

### `@albania/utils`

Shared utility functions and helpers.

## 🔍 TypeScript Configuration

The project uses TypeScript project references and composite builds for faster incremental compilation:

```bash
# Build all TypeScript projects
npm run typecheck

# Build with verbose output
npx tsc --build --verbose

# Clean TypeScript build cache
npx tsc --build --clean
```

## 🗄️ Supabase Backend

### Local Development

If you need to work with Supabase functions locally:

```bash
# Start Supabase locally
npm run supa start

# Deploy edge functions
npm run supa functions deploy <function-name>
```

### Edge Functions

Located in `supabase/functions/`:

- `create-paypal-order` - Create PayPal payment orders
- `capture-paypal-order` - Capture completed payments
- `paypal-webhook` - Handle PayPal webhooks
- `send-email` - Email notification service

## 🧪 Testing

```bash
# Run linting
npm run lint

# Run type checking
npm run typecheck
```

## 📝 Code Style

- **ESLint:** Configured for TypeScript and React
- **Prettier:** Auto-formatting on save (recommended)
- **TypeScript:** Strict mode disabled for gradual migration

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run `npm run typecheck` to ensure no TypeScript errors
4. Run `npm run lint` to check code style
5. Submit a pull request

## 📄 License

[Add your license here]

## 🐛 Troubleshooting

### Port Already in Use

If port 8080 is already in use, Vite will automatically try the next available port (8081, 8082, etc.).

### Module Resolution Issues

If you encounter module resolution issues:

```bash
# Clean install
npm run clean
npm install

# Rebuild TypeScript projects
npx tsc --build --clean
npx tsc --build
```

### Missing Dependencies

If you see missing peer dependency warnings:

```bash
# Install in the appropriate workspace
npm install <package-name> --workspace=@albania/web
```

## 📞 Support

For issues or questions, please open an issue on the GitHub repository.


cd c:\Users\wolow\Desktop\Albania\FE-albania\packages\api-client ; npx tsc --build