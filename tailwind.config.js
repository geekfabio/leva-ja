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
      },
      borderRadius: { xl: "12px", "2xl": "16px", "3xl": "24px" },
    },
  },
  plugins: [],
};
