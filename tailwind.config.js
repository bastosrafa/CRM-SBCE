/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f6f7f6',
          100: '#e3e6e2',
          200: '#c7cdc5',
          300: '#a3aba0',
          400: '#858c82',
          500: '#6b7268',
          600: '#7B896F',
          700: '#4a5047',
          800: '#3d423b',
          900: '#343732',
          950: '#1a1c19',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
};