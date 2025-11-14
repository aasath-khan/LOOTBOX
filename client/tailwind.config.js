/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'letterboxd-red': '#E50000',
        'letterboxd-dark': '#14181C',
        'letterboxd-dark-hover': '#1A1F24',
        'letterboxd-card': '#1F2937',
        'letterboxd-text': '#ECF0F1',
        'letterboxd-text-secondary': '#9CA3AF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

