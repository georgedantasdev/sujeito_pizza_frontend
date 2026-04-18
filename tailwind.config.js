/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#1d1d2e',
          100: '#2d2d3e',
          200: '#3d3d4e',
          300: '#4d4d5e',
        },
        brand: {
          red: '#EE1822',
          green: '#3fffa3',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
