import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryClient';
import { activarFechaProduccion } from './activarfechaApi';

export function useActivarFecha() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activarFechaProduccion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fechaactiva.list() });
    },
  });
}