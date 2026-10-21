/** @type {import('tailwindcss').Config} */
const palette = require("./src/theme/palette.json");
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: palette.greenDark,
          bright: palette.green,
          dark: palette.greenDark,
          soft: palette.greenSoft,
        },
        ink: palette.ink,
        muted: palette.muted,
        surface: palette.surface,
        line: palette.border,
        lj: {
          primary: "#0A8743",
          accent: "#12A150",
          soft: "#E8F6EE",
          tint: "#D3EFDF",
          deep: "#0B4A2C",
          deeper: "#053420",
          ink: "#0F2A1E",
          text: "#1C2B24",
          muted: "#5B6B63",
          subtle: "#8A9790",
          bg: "#F8F9F7",
          border: "#E3E9E5",
          danger: "#D92D20",
          "danger-soft": "#FDECEA",
          warning: "#B45309",
          "warning-soft": "#FFF4DD",
        },
      },
      borderRadius: { xl: "12px", "2xl": "16px", "3xl": "24px" },
    },
  },
  plugins: [],
};
