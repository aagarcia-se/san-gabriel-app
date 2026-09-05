import { useMutation, useQueryClient } from '@tanstack/react-query';
import { actualizarProducto, ingresarProducto } from './productosApi';
import { actualizarPrecio, desactivarProducto, ingresarPrecio } from './preciosApi';
import { queryKeys } from '@/shared/api/queryClient';

export function useIngresarProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ingresarProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productos.list() });
    },
  });
}

export function useActualizarProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: actualizarProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productos.list() });
    },
  });
}

export function useIngresarPrecio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ingresarPrecio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.precios.list() });
    },
  });
}

export function useActualizarPrecio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: actualizarPrecio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.precios.list() });
    },
  });
}

export function useDescativarProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: desactivarProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productos.list() });
    },
  });
}
