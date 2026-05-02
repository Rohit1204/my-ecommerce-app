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
        brand: {
          DEFAULT: "#2874f0",
          dark: "#1a5dc9",
          light: "#5b9cff",
        },
        accent: {
          DEFAULT: "#fb641b",
          dark: "#e85a0f",
        },
        surface: {
          DEFAULT: "#f4f6f9",
          muted: "#e8ecf2",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 14px rgba(15, 23, 42, 0.06), 0 0 1px rgba(15, 23, 42, 0.04)",
        "card-hover":
          "0 12px 40px rgba(15, 23, 42, 0.1), 0 0 1px rgba(15, 23, 42, 0.06)",
        nav: "0 4px 24px rgba(40, 116, 240, 0.15)",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out forwards",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
