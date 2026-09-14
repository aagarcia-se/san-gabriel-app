// useStockGeneral.ts
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryClient';
import { consultarStockGeneral } from './inventariosApi';

export function useStockGeneral(idSucursal: number, fecha: string) {
  return useQuery({
    queryKey: queryKeys.inventarios.stockGeneral(idSucursal, fecha),
    queryFn: () => consultarStockGeneral(idSucursal, fecha),
    select: (data) => data.stockProductos,
    enabled: Number.isFinite(idSucursal) && idSucursal > 0 && !!fecha,
  });
}