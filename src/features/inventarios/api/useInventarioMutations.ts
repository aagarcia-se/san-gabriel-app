import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryClient';
import { cancelarDescuentoStock, descontarStock, eliminarTraslado, ingresarStockProductos, registrarTraslado } from './inventariosApi';

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

export function useCancelarDescuento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelarDescuentoStock,
    onSuccess: () => {
      // Se invalida todo el prefijo: al cancelar un descuento cambia
      // tanto el historial como las existencias actuales.
      queryClient.invalidateQueries({ queryKey: queryKeys.inventarios.all });
    },
  });
}

export function useEliminarTraslado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eliminarTraslado,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventarios.all });
    },
  });
}