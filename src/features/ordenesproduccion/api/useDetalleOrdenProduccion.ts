import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryClient';
import { consultarDetalleOrdenProduccion } from './ordenesProduccionApi';

export function useDetalleOrdenProduccion(idOrdenProduccion: number) {
  return useQuery({
    queryKey: queryKeys.ordenesProduccion.detalleOrden(idOrdenProduccion),
    queryFn: () => consultarDetalleOrdenProduccion(idOrdenProduccion),
    select: (data) => data.detalleOrden,
    enabled: Number.isFinite(idOrdenProduccion) && idOrdenProduccion > 0,
  });
}