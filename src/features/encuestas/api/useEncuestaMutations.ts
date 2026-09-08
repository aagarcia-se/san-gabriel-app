import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryClient';
import { crearCampania, eliminarEncuesta, modificarCampania } from './encuestasApi';

export function useCrearEncuesta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearCampania,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.encuestas.list() });
    },
  });
}

export function useModificarEncuesta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: modificarCampania,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.encuestas.list() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.encuestas.detail(variables.idCampania),
      });
    },
  });
}

export function useEliminarEncuesta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eliminarEncuesta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.encuestas.list() });
    },
  });
}