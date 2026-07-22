import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dae6ff",
          200: "#bcd2ff",
          300: "#8eb4ff",
          400: "#598bff",
          500: "#3462f5",
          600: "#2048e0",
          700: "#1b39b6",
          800: "#1c3390",
          900: "#1c3072",
        },
      },
    },
  },
  plugins: [],
};

export default config;
