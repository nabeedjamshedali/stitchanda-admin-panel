/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf8f3',
          100: '#f9ede0',
          200: '#f2d9bf',
          300: '#e9bf94',
          400: '#dfa167',
          500: '#d2691e', // Main brown/orange
          600: '#c19a6b',
          700: '#a0724f',
          800: '#825c3f',
          900: '#6b4d35',
        },
        brown: {
          light: '#CD853F',
          DEFAULT: '#D2691E',
          dark: '#8B4513',
        }
      },
    },
  },
  plugins: [],
}
