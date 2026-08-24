import { useMutation, useQueryClient } from '@tanstack/react-query';
import { actualizarSucursal, eliminarSucursal, ingresarSucursal } from './sucursalesApi';
import { queryKeys } from '@/shared/api/queryClient';

export function useIngresarSucursal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ingresarSucursal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sucursales.list() });
    },
  });
}

export function useActualizarSucursal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: actualizarSucursal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sucursales.list() });
    },
  });
}

export function useEliminarSucursal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eliminarSucursal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sucursales.list() });
    },
  });
}
