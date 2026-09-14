import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryClient';
import { consultarOrdenEspecial } from './ordenesEspecialesApi';

export function useOrdenEspecialDetalle(idOrdenEspecial: number) {
  return useQuery({
    queryKey: queryKeys.ordenesEspeciales.detail(idOrdenEspecial),
    queryFn: () => consultarOrdenEspecial(idOrdenEspecial),
    select: (data) => data.ordenEspecial,
    enabled: Number.isFinite(idOrdenEspecial) && idOrdenEspecial > 0,
  });
}