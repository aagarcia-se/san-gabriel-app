import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryClient';
import { consultarOrdenesEspeciales } from './ordenesEspecialesApi';

export function useOrdenesEspeciales(idRol: number, idSucursal: number) {
  return useQuery({
    queryKey: queryKeys.ordenesEspeciales.list(idRol, idSucursal),
    queryFn: () => consultarOrdenesEspeciales(idRol, idSucursal),
    select: (data) => data.ordenesEspeciales,
    enabled: Number.isFinite(idRol) && Number.isFinite(idSucursal),
  });
}