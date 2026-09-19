import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryClient';
import { consultarVentasPorSucursal } from './ventasApi';

export function useVentasPorSucursal(idSucursal: number) {
  return useQuery({
    queryKey: queryKeys.ventas.list(idSucursal),
    queryFn: () => consultarVentasPorSucursal(idSucursal),
    select: (data) => data.ventas,
    enabled: Number.isFinite(idSucursal) && idSucursal > 0,
  });
}