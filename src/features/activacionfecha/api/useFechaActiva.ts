import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryClient';
import { getFechaActiva } from './activarfechaApi';

export function useFechaActiva() {
  return useQuery({
    queryKey: queryKeys.fechaactiva.list(),
    // "fecha" se calcula al momento real de cada fetch, no en cada
    // render — así la queryKey se mantiene estable y no se dispara un
    // refetch infinito por cambiar de milisegundo a milisegundo.
    queryFn: () => getFechaActiva(dayjs().format('YYYY-MM-DD HH:mm:ss')),
    select: (data) => data.diaProduccion,
    // Revalida cada 30s para detectar cuando la ventana expira sin
    // depender de que el usuario recargue la página.
    refetchInterval: 30 * 1000,
  });
}