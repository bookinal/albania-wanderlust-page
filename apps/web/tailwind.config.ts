import type { Config } from "tailwindcss";
import baseConfig from "../../tailwind.config";

export default {
  ...baseConfig,
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
    "../../packages/**/src/**/*.{ts,tsx,js,jsx}",
  ],
} satisfies Config;
