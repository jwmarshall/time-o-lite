/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'gold-400': '#d4af37',
        'gold-500': '#b8941f',
        'gold-600': '#9c7a1a',
        'vintage-green': '#4a5d23',
        'vintage-green-light': '#5a6d33',
        'vintage-green-dark': '#3a4d13',
      },
      fontFamily: {
        'mono': ['Monaco', 'Menlo', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
};