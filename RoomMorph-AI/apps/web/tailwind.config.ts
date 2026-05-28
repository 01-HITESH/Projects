import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#eef2ef",
        ink: "#171816",
        chalk: "#fbfcf8",
        mist: "#d9e3df",
        sage: "#5f7f72",
        clay: "#b36b55",
        steel: "#405664",
        gold: "#c2a44f"
      },
      boxShadow: {
        soft: "0 18px 52px rgba(28, 27, 24, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
