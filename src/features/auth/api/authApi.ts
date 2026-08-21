import { httpClient } from '@/shared/api/httpClient';
import type { LoginRequest, LoginResponse } from '../types/auth.types';

// Ruta real vista en auth.route.js: authRoute.post("/login", ...)
// montada bajo /auth -> junto con el baseURL (.../api) queda /api/auth/login
export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await httpClient.post<LoginResponse>('/auth/login', payload);
  return data;
}
