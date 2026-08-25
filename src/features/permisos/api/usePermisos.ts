import { useQuery } from '@tanstack/react-query';
import { getPermisos } from './permisosApi';
import { queryKeys } from '@/shared/api/queryClient';

export function usePermisos() {
  return useQuery({
    queryKey: queryKeys.permisos.list(),
    queryFn: getPermisos,
    select: (data) => data.permisos,
  });
}
