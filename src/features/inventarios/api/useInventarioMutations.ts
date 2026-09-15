import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryClient';
import { descontarStock, ingresarStockProductos, registrarTraslado } from './inventariosApi';

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

export function useRegistrarTraslado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registrarTraslado,
    onSuccess: () => {
      // Invalida todo el módulo: el traslado afecta el stock de DOS
      // sucursales (origen y destino) a la vez, así que no basta con
      // invalidar solo la de origen.
      queryClient.invalidateQueries({ queryKey: queryKeys.inventarios.all });
    },
  });
}