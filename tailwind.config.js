/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ikea-blue': '#0058A3',
        'ikea-blue-dark': '#004F93',
        'ikea-blue-light': '#0077C8',
        'ikea-yellow': '#FFDB00',
        'ikea-yellow-dark': '#E6C500',
        'ikea-gray': {
          50: '#F8F8F8',
          100: '#F0F0F0',
          200: '#E0E0E0',
          300: '#CCCCCC',
          400: '#999999',
          500: '#666666',
          600: '#4A4A4A',
          700: '#333333',
          800: '#1A1A1A',
        }
      },
      fontFamily: {
        'sans': ['Noto Sans', 'system-ui', 'sans-serif'],
        'display': ['Noto Sans', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}

