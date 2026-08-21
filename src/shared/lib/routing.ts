import type { Permiso } from '@/features/auth/types/auth.types';

// A dónde mandar al usuario después de loguear / al entrar a "/".
// Ya no asumimos que todos tienen Dashboard: se usa el primer permiso
// que le corresponda a su rol. Si el rol no tiene ningún permiso
// asignado, cae a /sin-permisos.
export function getDefaultRoute(permisos: Permiso[]): string {
  return permisos[0]?.rutaAcceso ?? '/sin-permisos';
}
