import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Backgrounds
        "bg-base": "#0F172A",
        "bg-secondary": "#111827",
        "bg-surface": "#172554",
        // Text Hierarchy
        "text-primary": "#F8FAFC",
        "text-secondary": "#CBD5E1",
        "text-muted": "#94A3B8",
        // System States
        "state-success": "#34D399",
        "state-warning": "#FBBF24",
        "state-danger": "#FB7185",
        // Brand
        "brand-blue": "#60A5FA",
        "brand-indigo": "#818CF8",
        "brand-violet": "#A78BFA",
      },
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(135deg, #60A5FA 0%, #818CF8 50%, #A78BFA 100%)",
        "gradient-brand-subtle":
          "linear-gradient(135deg, rgba(96,165,250,0.15) 0%, rgba(129,140,248,0.15) 50%, rgba(167,139,250,0.15) 100%)",
        "gradient-surface":
          "linear-gradient(180deg, rgba(23,37,84,0.6) 0%, rgba(17,24,39,0.4) 100%)",
        "holographic-grid":
          "linear-gradient(rgba(96,165,250,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.04) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "48px 48px",
      },
      fontFamily: {
        display: ["'DM Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
        body: ["'DM Sans'", "system-ui", "sans-serif"],
      },
      borderColor: {
        subtle: "rgba(255,255,255,0.08)",
        "subtle-hover": "rgba(255,255,255,0.14)",
        brand: "rgba(96,165,250,0.3)",
      },
      boxShadow: {
        "card-glow": "0 0 0 1px rgba(255,255,255,0.06), 0 4px 32px rgba(0,0,0,0.4)",
        "brand-glow": "0 0 40px rgba(96,165,250,0.15), 0 0 80px rgba(129,140,248,0.08)",
        "success-glow": "0 0 20px rgba(52,211,153,0.2)",
        "warning-glow": "0 0 20px rgba(251,191,36,0.2)",
        "danger-glow": "0 0 20px rgba(251,113,133,0.2)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.08)",
      },
      animation: {
        "pulse-slow": "pulse-slow 4s ease-in-out infinite",
        "breathe": "breathe 6s ease-in-out infinite",
        "float": "float 8s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "spin-slow": "spin 12s linear infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "particle-flow": "particle-flow 2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "count-up": "count-up 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-up": "fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in-right": "slide-in-right 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.04)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.7" },
          "50%": { transform: "scale(1.08)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(96,165,250,0.1)" },
          "50%": { boxShadow: "0 0 40px rgba(129,140,248,0.3), 0 0 80px rgba(96,165,250,0.1)" },
        },
        "particle-flow": {
          "0%": { strokeDashoffset: "100", opacity: "0" },
          "20%": { opacity: "1" },
          "100%": { strokeDashoffset: "0", opacity: "0" },
        },
        "count-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.16, 1, 0.3, 1)",
        "spring-soft": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      backdropBlur: {
        xs: "2px",
        glass: "16px",
        heavy: "32px",
      },
    },
  },
  plugins: [],
};

export default config;