import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryClient';
import { consultarConsumoIngredientes } from './ordenesProduccionApi';

export function useConsumoIngredientes(idOrdenProduccion: number) {
    return useQuery({
      queryKey: queryKeys.ordenesProduccion.consumoIngredientes(idOrdenProduccion),
      queryFn: () => consultarConsumoIngredientes(idOrdenProduccion),
      select: (data) => data.IngredientesConsumidos,
      enabled: Number.isFinite(idOrdenProduccion) && idOrdenProduccion > 0,
    });
  }