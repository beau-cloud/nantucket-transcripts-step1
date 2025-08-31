/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        ui: ['"Noto Sans Myanmar"', '"Myanmar Text"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    },
  },
  darkMode: "class",
  plugins: [],
};