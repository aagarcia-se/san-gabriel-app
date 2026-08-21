import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dbe6fe',
          200: '#bed0fe',
          300: '#91b1fc',
          400: '#5f89f8',
          500: '#3b63f2',
          600: '#2645e6',
          700: '#2135c9',
          800: '#212fa2',
          900: '#212c80',
          950: '#171b4e',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      screens: {
        xs: '380px',
      },
    },
  },
  plugins: [],
} satisfies Config;
