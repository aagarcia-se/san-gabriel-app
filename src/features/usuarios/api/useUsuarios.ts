import { useQuery } from '@tanstack/react-query';
import { getUsuarios } from './usuariosApi';
import { queryKeys } from '@/shared/api/queryClient';

export function useUsuarios() {
  return useQuery({
    queryKey: queryKeys.usuarios.list(),
    queryFn: getUsuarios,
    select: (data) => data.usuarios,
  });
}
