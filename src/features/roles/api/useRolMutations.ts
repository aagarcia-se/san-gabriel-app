import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  actualizarRol,
  eliminarRol,
  eliminarRolPermisosBatch,
  ingresarPermisosBatch,
  ingresarRol,
} from './rolesApi';
import { queryKeys } from '@/shared/api/queryClient';

export function useIngresarRol() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ingresarRol,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.list() });
    },
  });
}

export function useActualizarRol() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: actualizarRol,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.list() });
    },
  });
}

export function useEliminarRol() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eliminarRol,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.list() });
    },
  });
}

// Estas dos no invalidan por sí solas — CrearRolPage/EditarRolPage
// invalidan queryKeys.roles.permisos(idRol) manualmente después de
// llamarlas, ya que ahí sí se sabe con certeza el idRol afectado.
export function useIngresarPermisosBatch() {
  return useMutation({
    mutationFn: ingresarPermisosBatch,
  });
}

export function useEliminarRolPermisosBatch() {
  return useMutation({
    mutationFn: eliminarRolPermisosBatch,
  });
}
