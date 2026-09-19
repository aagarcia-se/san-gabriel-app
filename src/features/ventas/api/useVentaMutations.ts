import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryClient';
import { eliminarVenta } from './ventasApi';

export function useEliminarVenta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eliminarVenta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ventas.all });
    },
  });
}