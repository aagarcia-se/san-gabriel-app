import { useQuery } from '@tanstack/react-query';
import { getRoles, getRolPermisos } from './rolesApi';
import { queryKeys } from '@/shared/api/queryClient';

export function useRoles() {
  return useQuery({
    queryKey: queryKeys.roles.list(),
    queryFn: getRoles,
    select: (data) => data.roles,
  });
}

// Permisos ya asignados a un rol puntual — se usa al editar (para
// precargar el checklist) y al expandir un rol en el listado (para
// mostrar sus permisos). Solo se monta/consulta cuando hace falta.
export function useRolPermisos(idRol: number) {
  return useQuery({
    queryKey: queryKeys.roles.permisos(idRol),
    queryFn: () => getRolPermisos(idRol),
    select: (data) => data.rolesPermisos,
  });
}
