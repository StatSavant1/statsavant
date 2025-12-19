/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* =========================
           BRAND COLORS
        ========================= */

        // Primary brand (teal)
        brand: {
          DEFAULT: "#22D3A6",   // teal-400 equivalent
          dark: "#14B8A6",      // teal-500
          light: "#5EEAD4",     // teal-300
        },

        // Secondary / neutral (cool slate gray)
        slatecool: {
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },

        /* =========================
           BACKGROUNDS
        ========================= */
        surface: {
          DEFAULT: "#0D0F12",
          raised: "#12151A",
          border: "#1A1D21",
        },
      },
    },
  },
  plugins: [],
};

