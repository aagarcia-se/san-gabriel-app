import { httpClient } from '@/shared/api/httpClient';
import type { LoginRequest, LoginResponse } from '../types/auth.types';

// El baseURL ya incluye /api (ej. http://localhost:3000/api), así que
// aquí solo va el nombre de la ruta — sin /auth ni otro prefijo.
// Convención para TODOS los servicios de aquí en adelante:
// httpClient.<método>('/nombre-de-la-ruta', ...)
export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await httpClient.post<LoginResponse>('/login', payload);
  return data;
}
