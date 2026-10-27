/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#1e1b4b', // deep navy
          950: '#0f172a',
        },
        royal: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#2563eb', // royal blue
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e3a8a',
        }
      }
    },
  },
  plugins: [],
}
