/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#16A34A", dark: "#15803D", soft: "#DCFCE7" },
        ink: "#102018",
        muted: "#64748B",
        surface: "#F6F8F6"
      },
      borderRadius: { xl: "20px", '2xl': "28px" }
    }
  },
  plugins: []
};
