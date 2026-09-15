import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryClient';
import { descontarStock, ingresarStockProductos } from './inventariosApi';

export function useIngresarStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ingresarStockProductos,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventarios.all });
    },
  });
}

export function useDescontarStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: descontarStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventarios.all });
    },
  });
}