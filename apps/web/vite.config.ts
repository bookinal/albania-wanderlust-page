import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import checker from "vite-plugin-checker";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env from monorepo root directory
  const env = loadEnv(mode, path.resolve(__dirname, "../.."), "");

  // Helper to get package path - use dist in production, src in development
  const getPackagePath = (packageName: string) => {
    const isProduction = mode === "production";
    const basePath = `../../packages/${packageName}`;
    return path.resolve(
      __dirname,
      isProduction ? `${basePath}/dist` : `${basePath}/src`,
    );
  };

  return {
    server: {
      host: "::",
      port: 8080,
    },
    base: "/",
    plugins: [
      react(),
      checker({
        typescript: true,
      }),
    ],
    resolve: {
      alias: [
        {
          find: "@/services/api",
          replacement: getPackagePath("api-client"),
        },
        {
          find: "@/types",
          replacement: getPackagePath("shared-types"),
        },
        {
          find: "@",
          replacement: path.resolve(__dirname, "./src"),
        },
        {
          find: "@albania/shared-types",
          replacement: getPackagePath("shared-types"),
        },
        {
          find: "@albania/api-client",
          replacement: getPackagePath("api-client"),
        },
        {
          find: "@albania/hooks",
          replacement: getPackagePath("hooks"),
        },
        {
          find: "@albania/utils",
          replacement: getPackagePath("utils"),
        },
      ],
    },
    // Expose VITE_ prefixed env vars to the client
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
        env.VITE_SUPABASE_URL,
      ),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(
        env.VITE_SUPABASE_ANON_KEY,
      ),
      "import.meta.env.VITE_PAYPAL_CLIENT_ID": JSON.stringify(
        env.VITE_PAYPAL_CLIENT_ID,
      ),
      "import.meta.env.VITE_PAYPAL_BASE_URL": JSON.stringify(
        env.VITE_PAYPAL_BASE_URL,
      ),
      "import.meta.env.VITE_PAYPAL_CLIENT_SECRET": JSON.stringify(
        env.VITE_PAYPAL_CLIENT_SECRET,
      ),
      "import.meta.env.VITE_FRONTEND_URL": JSON.stringify(
        env.VITE_FRONTEND_URL,
      ),
      "import.meta.env.VITE_GEOCODE_MAPS_API_KEY": JSON.stringify(
        env.VITE_GEOCODE_MAPS_API_KEY,
      ),
      "import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY": JSON.stringify(
        env.VITE_STRIPE_PUBLISHABLE_KEY,
      ),
    },
  };
});
