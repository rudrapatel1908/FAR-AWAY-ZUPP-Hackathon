import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        surface: "#f8fafc",
        accent: "#0f766e"
      }
    }
  },
  plugins: []
};

export default config;

