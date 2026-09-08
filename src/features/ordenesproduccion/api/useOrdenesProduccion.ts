import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryClient';
import { consultarOrdenesProduccion } from './ordenesProduccionApi';

export function useOrdenesProduccion(idRol: number, idSucursal: number) {
  return useQuery({
    queryKey: queryKeys.ordenesProduccion.list(idRol, idSucursal),
    queryFn: () => consultarOrdenesProduccion(idRol, idSucursal),
    select: (data) => data.ordenesProduccion,
    enabled: Number.isFinite(idRol) && Number.isFinite(idSucursal),
  });
}