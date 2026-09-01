import { useQuery } from '@tanstack/react-query';
import { getProductosConPrecios } from './productosApi';
import { queryKeys } from '@/shared/api/queryClient';

// Fuente ÚNICA para la sección de Productos por ahora: un solo viaje
// (producto + categoría + precio + config de stock juntos). OJO: solo
// trae productos ACTIVOS con precio cargado (mismo INNER JOIN + WHERE
// estado='A' que tenía consultarPrecios) — los inactivos no aparecen
// acá; su gestión vive en otra sección, según definiste.
//
// Quedan disponibles sin usar por ahora: getProductos() (todos, sin
// precio) y getPrecios() (mismo JOIN, ruta vieja) — por si hacen falta
// más adelante.
export function useProductos() {
  return useQuery({
    queryKey: queryKeys.productos.list(),
    queryFn: getProductosConPrecios,
    select: (data) => data.productos,
  });
}
