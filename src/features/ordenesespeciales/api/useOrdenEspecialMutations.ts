import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryClient';
import {
  actualizarOrdenEspecial,
  eliminarOrdenEspecial,
  ingresarOrdenEspecial,
} from './ordenesEspecialesApi';

export function useIngresarOrdenEspecial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ingresarOrdenEspecial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ordenesEspeciales.all });
    },
  });
}

export function useActualizarOrdenEspecial() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: actualizarOrdenEspecial,
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.ordenesEspeciales.all });
        queryClient.invalidateQueries({
          queryKey: queryKeys.ordenesEspeciales.detail(variables.ordenEncabezado.idOrdenEspecial),
        });
      },
    });
  }

export function useEliminarOrdenEspecial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eliminarOrdenEspecial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ordenesEspeciales.all });
    },
  });
}

