/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_PAYPAL_CLIENT_ID: string;
  readonly VITE_PAYPAL_BASE_URL: string;
  readonly VITE_PAYPAL_CLIENT_SECRET: string;
  readonly VITE_FRONTEND_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
