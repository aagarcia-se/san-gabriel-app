import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryClient';
import { consultarEncuestas } from './encuestasApi';

export function useEncuestas() {
  return useQuery({
    queryKey: queryKeys.encuestas.list(),
    queryFn: consultarEncuestas,
    select: (data) => data.encuestas,
  });
}