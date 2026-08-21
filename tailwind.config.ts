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
        // Tokens semánticos: mismo nombre de clase en toda la app,
        // el VALOR cambia solo con la clase "dark" en <html> (ver
        // globals.css y src/shared/theme/useTheme.ts). Así cada
        // componente se escribe una sola vez y funciona en ambos temas.
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--color-surface-2) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
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
