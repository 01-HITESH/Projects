import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f5f2eb",
        ink: "#171816",
        chalk: "#fffdf7",
        mist: "#e5e0d6",
        sage: "#748475",
        clay: "#a96f55",
        steel: "#58636b",
        gold: "#c4a35a"
      },
      boxShadow: {
        soft: "0 18px 52px rgba(28, 27, 24, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
