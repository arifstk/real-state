import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Action / CTA / Excitement color (buttons, links, highlights)
        primary: {
          DEFAULT: "#14B8A6",
          light: "#5EEAD4",
          dark: "#0F766E",
        },
        // Clean background color (cards, page bg)
        background: {
          DEFAULT: "#F9FAFB",
          card: "#FFFFFF",
        },
        // Typography / dark text & headers
        dark: {
          DEFAULT: "#1F2937",
          soft: "#374151",
        },
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
