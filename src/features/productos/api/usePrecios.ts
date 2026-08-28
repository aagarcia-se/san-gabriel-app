import { useQuery } from '@tanstack/react-query';
import { getPrecios } from './preciosApi';
import { queryKeys } from '@/shared/api/queryClient';

export function usePrecios() {
  return useQuery({
    queryKey: queryKeys.precios.list(),
    queryFn: getPrecios,
    select: (data) => data.preciosProductos,
  });
}
