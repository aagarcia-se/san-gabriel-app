import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/shared/config/env';

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de request: aquí se inyecta el token de auth cuando exista.
httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tipo de error normalizado que usará toda la app.
export interface ApiError {
  status: number | null;
  code: number | null;
  message: string;
  details?: unknown;
}

// Shape real de error de tu API (ver generalErrors.js / middleware de errores):
// { error: { message, code, data } }
interface ApiErrorBody {
  error?: {
    message?: string;
    code?: number;
    data?: unknown;
  };
}

// Interceptor de response: normaliza cualquier error de la API a un solo shape.
httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const backendError = error.response?.data?.error;

    const apiError: ApiError = {
      status: error.response?.status ?? null,
      code: backendError?.code ?? error.response?.status ?? null,
      message:
        backendError?.message ??
        error.message ??
        'Ocurrió un error inesperado. Intenta de nuevo.',
      details: backendError?.data ?? error.response?.data,
    };

    if (apiError.status === 401) {
      // Punto único para manejar sesión expirada / logout forzado.
      localStorage.removeItem('auth_token');
    }

    return Promise.reject(apiError);
  },
);
