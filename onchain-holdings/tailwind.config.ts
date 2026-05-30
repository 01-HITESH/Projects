import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
        light: "var(--color-light)",
        dark: "var(--color-dark)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        accent: "var(--color-accent)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      maxWidth: {
        site: "1440px",
      },
      transitionTimingFunction: {
        brand: "cubic-bezier(0.0, 0.0, 0.2, 1.0)",
        "brand-in-out": "cubic-bezier(0.4, 0.0, 0.2, 1.0)",
      },
      keyframes: {
        scroll: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        scroll: "scroll var(--marquee-duration, 30s) linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
