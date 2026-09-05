import { useMutation, useQueryClient } from '@tanstack/react-query';
import { actualizarCategoria, crearCategoria, desactivarCategoria } from './categoriasApi';
import { queryKeys } from '@/shared/api/queryClient';

export function useDesactivarCategoria() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: desactivarCategoria,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categorias.list() });
        },
    });
}

export function useCrearCategoria() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: crearCategoria,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categorias.list() });
        },
    });
}

export function useActualizarCategoria() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: actualizarCategoria,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categorias.list() });
        },
    });
}