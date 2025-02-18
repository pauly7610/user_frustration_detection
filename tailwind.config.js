/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'frustration': {
          light: '#FFD1DC',
          DEFAULT: '#FF6B6B',
          dark: '#FF4136'
        }
      }
    },
  },
  plugins: [],
} 