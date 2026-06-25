import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/dashboard/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:          "var(--color-bg)",
        panel:       "var(--color-panel)",
        "panel-2":   "var(--color-panel-2)",
        line:        "var(--color-line)",
        text:        "var(--color-text)",
        "text-dim":  "var(--color-text-dim)",
        add:         "var(--color-add)",
        "add-dim":   "var(--color-add-dim)",
        fix:         "var(--color-fix)",
        "fix-dim":   "var(--color-fix-dim)",
        chore:       "var(--color-chore)",
        "chore-dim": "var(--color-chore-dim)",
        docs:        "var(--color-docs)",
        "docs-dim":  "var(--color-docs-dim)",
        style:       "var(--color-style)",
        "style-dim": "var(--color-style-dim)",
        test:        "var(--color-test)",
        "test-dim":  "var(--color-test-dim)",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        mono:    ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        sm:   "var(--radius-sm)",
        md:   "var(--radius-md)",
        lg:   "var(--radius-lg)",
        xl:   "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      fontSize: {
        micro:   "var(--text-micro)",
        label:   "var(--text-label)",
        caption: "var(--text-caption)",
        sm:      "var(--text-sm)",
        base:    "var(--text-base)",
        md:      "var(--text-md)",
        lg:      "var(--text-lg)",
        xl:      "var(--text-xl)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
    },
  },
  plugins: [],
} satisfies Config;
