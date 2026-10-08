/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#FF5B26", dark: "#E94A18", soft: "#FFF0EA" },
        ink: "#17212B",
        muted: "#6B7280",
        surface: "#F8FAFC"
      },
      borderRadius: { xl: "20px", '2xl': "28px" }
    }
  },
  plugins: []
};
