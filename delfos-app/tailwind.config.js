/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hey: {
          dark: '#1A1A2E',
          light: '#F8F9FA',
          accent: '#FF3366',
          blue: '#2B4162'
        }
      }
    },
  },
  plugins: [],
}