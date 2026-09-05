import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryClient';
import { getCategorias } from './categoriasApi';

export function useCategorias(){
    return useQuery({
        queryKey: queryKeys.categorias.list(),
        queryFn: getCategorias,
        select: (data) => data.categorias,
    });
}