import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryClient';
import { consultarEncuestaDetalle } from './encuestasApi';

export function useEncuestaDetalle(idCampania: number) {
  return useQuery({
    queryKey: queryKeys.encuestas.detail(idCampania),
    queryFn: () => consultarEncuestaDetalle(idCampania),
    select: (data) => data.campania,
    enabled: Number.isFinite(idCampania) && idCampania > 0,
  });
}