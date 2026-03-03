/// <reference types="vite/client" />

// Extend ImportMeta for Vite environment variables
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Re-export supabase types for consumers
export * from "@supabase/supabase-js";
