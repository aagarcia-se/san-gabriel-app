import { useMutation, useQueryClient } from '@tanstack/react-query';
import { desactivarCategoria } from './categoriasApi';
import { queryKeys } from '@/shared/api/queryClient';

export function useDesactivarCategoria() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: desactivarCategoria,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.categorias.list() });
      },
    });
  }

