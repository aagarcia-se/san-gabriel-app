import { useQuery } from '@tanstack/react-query';
import { getSucursales } from './sucursalesApi';
import { queryKeys } from '@/shared/api/queryClient';

export function useSucursales() {
  return useQuery({
    queryKey: queryKeys.sucursales.list(),
    queryFn: getSucursales,
    select: (data) => data.sucursales,
  });
}
