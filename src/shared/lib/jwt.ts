import { jwtDecode } from 'jwt-decode';

// Solo decodifica el payload (no valida la firma — eso lo hace el backend
// en cada request vía jwt.verifyToken). Sirve para leer los claims
// (usuario, permisos, exp) y así no depender de un segundo endpoint.
export function decodeJwt<T>(token: string): T {
  return jwtDecode<T>(token);
}

export function isTokenExpired(token: string): boolean {
  try {
    const { exp } = decodeJwt<{ exp?: number }>(token);
    if (!exp) return false;
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}
