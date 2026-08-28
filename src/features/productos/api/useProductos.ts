import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProductos } from './productosApi';
import { usePrecios } from './usePrecios';
import { queryKeys } from '@/shared/api/queryClient';
import type { Producto } from '../types/producto.types';
import type { PrecioProducto } from '../types/precio.types';

export interface ProductoConPrecio extends Producto {
  // undefined si el producto está inactivo o todavía no tiene precio
  // cargado — consultarPrecios excluye esos casos (INNER JOIN + solo
  // estado 'A'), así que no siempre hay match.
  precio?: PrecioProducto;
}

// Fuente de verdad para la LISTA completa: consultarProductos (trae
// todos, activos e inactivos). consultarPrecios se usa para enriquecer
// cada uno con precio/categoría/config de stock cuando está disponible
// — no se puede usar consultarPrecios solo porque no incluye inactivos
// ni productos sin precio (ver nota en preciosApi.ts / usePrecios.ts).
export function useProductos() {
  const productosQuery = useQuery({
    queryKey: queryKeys.productos.list(),
    queryFn: getProductos,
    select: (data) => data.productos,
  });
  const preciosQuery = usePrecios();

  const data = useMemo<ProductoConPrecio[] | undefined>(() => {
    if (!productosQuery.data) return undefined;
    const preciosPorProducto = new Map(
      (preciosQuery.data ?? []).map((precio) => [precio.idProducto, precio]),
    );
    return productosQuery.data.map((producto) => ({
      ...producto,
      precio: preciosPorProducto.get(producto.idProducto),
    }));
  }, [productosQuery.data, preciosQuery.data]);

  return {
    data,
    isLoading: productosQuery.isLoading || preciosQuery.isLoading,
    isError: productosQuery.isError,
    error: productosQuery.error,
    refetch: productosQuery.refetch,
  };
}
