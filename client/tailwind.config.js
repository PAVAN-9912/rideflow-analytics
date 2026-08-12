/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      colors: {
        navy: "#0B1220",
        navyedge: "#182035",
        navysoft: "#141C30",
        paper: "#F5F6FA",
        border: "#E6E8F0",
        ink: "#10162A",
        sub: "#6B7284",
        faint: "#9BA1B4",
        accent: "#3160EE",
        accentsoft: "#EAF0FE",
        teal: "#0F9E8E",
        tealsoft: "#E4F6F3",
        amber: "#C9861A",
        ambersoft: "#FBF0DD",
        rose: "#D3453D",
      },
    },
  },
  plugins: [],
};
