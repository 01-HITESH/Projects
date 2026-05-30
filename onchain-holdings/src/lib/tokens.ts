export const colors = {
  bg: "#1e2330",
  surface: "#2c3140",
  border: "#454c5e",
  light: "#b6bac5",
  dark: "#383e4e",
  textPrimary: "#d4d8e4",
  textSecondary: "#8b90a0",
  accent: "#ffffff",
} as const;

export const typography = {
  hero: "clamp(4rem, 10vw, 9rem)",
  h1: "clamp(3rem, 6vw, 5.5rem)",
  h2: "clamp(2rem, 4vw, 3.5rem)",
  h3: "clamp(1.25rem, 2.5vw, 1.75rem)",
  body: "clamp(1rem, 1.5vw, 1.125rem)",
} as const;

export const motion = {
  easeOut: "cubic-bezier(0.0, 0.0, 0.2, 1.0)",
  easeInOut: "cubic-bezier(0.4, 0.0, 0.2, 1.0)",
  page: 0.35,
  reveal: 0.55,
  stagger: 0.08,
} as const;
