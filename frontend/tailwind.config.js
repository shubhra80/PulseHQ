/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#fcfcfb",
          page: "#f9f9f7",
          sidebar: "#14161a",
          sidebarHover: "#1e2126",
        },
        ink: {
          primary: "#0b0b0b",
          secondary: "#52514e",
          muted: "#898781",
        },
        line: {
          hairline: "#e1e0d9",
          axis: "#c3c2b7",
        },
        status: {
          good: "#0ca30c",
          goodBg: "#e7f7e7",
          warning: "#c98500",
          warningBg: "#fdf3dc",
          critical: "#d03b3b",
          criticalBg: "#fbe8e8",
        },
        brand: {
          50: "#eaf1fc",
          100: "#cde2fb",
          400: "#3987e5",
          500: "#2a78d6",
          600: "#256abf",
          700: "#184f95",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", '"Segoe UI"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
