import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryClient';
import { eliminarVenta, ingresarVenta } from './ventasApi';

export function useEliminarVenta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eliminarVenta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ventas.all });
    },
  });
}

export function useIngresarVenta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ingresarVenta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ventas.all });
      // La venta también afecta el stock disponible de la sucursal.
      queryClient.invalidateQueries({ queryKey: queryKeys.inventarios.all });
    },
  });
}