import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy-initialized client to allow environment variables to be set up
let _apiClient: SupabaseClient | null = null;

// Platform-agnostic environment variable access
// Works with both Vite (web) and Expo (mobile)
function getEnvVar(key: string): string | undefined {
  // Vite environment (web) - check import.meta.env first
  // @ts-ignore - import.meta.env is available in Vite
  if (typeof import.meta !== "undefined" && import.meta.env) {
    // @ts-ignore
    const value = import.meta.env[key];
    if (value) return value;
  }

  // React Native / Expo environment
  // Expo injects EXPO_PUBLIC_ variables into process.env
  if (typeof process !== "undefined" && process.env) {
    const value = process.env[key];
    if (value) return value;
  }

  return undefined;
}

function getSupabaseConfig() {
  const supabaseUrl =
    getEnvVar("EXPO_PUBLIC_SUPABASE_URL") || getEnvVar("VITE_SUPABASE_URL");

  const supabaseAnonKey =
    getEnvVar("EXPO_PUBLIC_SUPABASE_ANON_KEY") ||
    getEnvVar("VITE_SUPABASE_ANON_KEY");

  return { supabaseUrl, supabaseAnonKey };
}

function createApiClient(): SupabaseClient {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  if (!supabaseUrl || !supabaseUrl.startsWith("http")) {
    throw new Error(
      `Missing or invalid SUPABASE_URL environment variable. Got: ${supabaseUrl}. ` +
        `Make sure EXPO_PUBLIC_SUPABASE_URL is set in your .env file and restart Metro with --clear cache.`,
    );
  }
  if (!supabaseAnonKey) {
    throw new Error(
      "Missing SUPABASE_ANON_KEY environment variable. " +
        "Make sure EXPO_PUBLIC_SUPABASE_ANON_KEY is set in your .env file.",
    );
  }

  // Check if we're in React Native environment - multiple detection methods
  const hasHermes =
    typeof global !== "undefined" && !!(global as any).HermesInternal;
  const hasExpoEnv =
    typeof process !== "undefined" && !!process.env?.EXPO_PUBLIC_SUPABASE_URL;
  const hasReactNativeNavigator =
    typeof navigator !== "undefined" && navigator.product === "ReactNative";
  const isReactNative = hasHermes || hasExpoEnv || hasReactNativeNavigator;

  console.log("[apiClient] Environment detection:", {
    hasHermes,
    hasExpoEnv,
    hasReactNativeNavigator,
    isReactNative,
    detectSessionInUrl: !isReactNative,
  });

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Disable auto URL detection in React Native to prevent conflicts with expo-router
      // This must be false for React Native apps, true for web
      detectSessionInUrl: !isReactNative,
      // Storage will be handled by AsyncStorage in React Native
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

// Export as a getter to ensure lazy initialization
export const apiClient: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_apiClient) {
      _apiClient = createApiClient();
    }
    return (_apiClient as any)[prop];
  },
});
