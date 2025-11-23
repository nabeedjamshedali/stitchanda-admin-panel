/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Main Color Palette 
        primary: {
          50: '#fef9f3',
          100: '#fdf3e7',
          200: '#fbe5c3',
          300: '#f8d79f',
          400: '#f0bb6f',
          500: '#D49649', 
          600: '#bf8541',
          700: '#a06f37',
          800: '#805a2d',
          900: '#664825',
        },
        caramel: '#D49649',
        gold: '#DEA666',
        coffee: '#BB7A49',
        beige: '#E6BA88',
        deepBrown: '#8E7051',
        chocolate: '#5B4632',
        brown: {
          light: '#DEA666',
          DEFAULT: '#D49649',
          dark: '#5B4632',
        },
        background: '#FFFDF9', 
        surface: '#FFFFFF',
        outline: '#E5E1DA',
        textBlack: '#2A2A2A',
        textGrey: '#7B7B7B',
        iconGrey: '#8E8E8E',
      },
    },
  },
  plugins: [],
}
