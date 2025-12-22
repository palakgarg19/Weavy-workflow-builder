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
        background: "var(--background)",
        foreground: "var(--foreground)",
        weavy: {
          bg: "#0a0a0a", // Almost black for canvas
          sidebar: "#121212", // Dark gray for sidebar
          panel: "#1e1e1e", // Node background
          border: "#333333", // Node borders
          primary: "#7c3aed", // Purple accent (Violet-600)
          "primary-hover": "#6d28d9",
          text: "#e4e4e7", // Zinc-200
          "text-secondary": "#a1a1aa", // Zinc-400
        },
      },
      backgroundImage: {
         'dot-pattern': 'radial-gradient(#333 1px, transparent 1px)',
      }
    },
  },
  plugins: [],
};
export default config;
