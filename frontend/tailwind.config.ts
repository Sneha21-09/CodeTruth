import type { Config } from "tailwindcss";

// Palette values recovered from the compiled stylesheet of the original build.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#101c33", 400: "#94a0b5", 500: "#69778f", 600: "#4b5b7a", 700: "#334262", 800: "#1b2a47", 900: "#101c33", 950: "#0b1426" },
        brand: { 50: "#eff5ff", 100: "#dbe8ff", 200: "#bcd3ff", 500: "#2f6fe4", 600: "#1f5bd0", 700: "#1a4aab", 800: "#153c8a" },
        line: { DEFAULT: "#e3e8ef", strong: "#cfd7e3" },
        surface: { muted: "#f6f8fb", sunken: "#eef2f7" },
        ok: { 50: "#ecfdf3", 600: "#15803d", 700: "#116932" },
        warn: { 50: "#fffbeb", 600: "#b45309", 700: "#92400e" },
        bad: { 50: "#fef2f2", 600: "#c0262d", 700: "#9b1c22" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px #101c330d, 0 1px 1px #101c3308",
        pop: "0 12px 32px -8px #101c332e, 0 2px 6px #101c330f",
      },
    },
  },
  plugins: [],
};
export default config;
