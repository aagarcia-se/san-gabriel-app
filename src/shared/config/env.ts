// Acceso centralizado a variables de entorno.
// Todas las vars públicas de Vite deben empezar con VITE_.
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
  appEnv: import.meta.env.MODE,
} as const;
