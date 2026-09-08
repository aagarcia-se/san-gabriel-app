import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryClient';
import { eliminarOrdenProduccion, ingresarOrdenProduccionBatch } from './ordenesProduccionApi';
import type { OrdenProduccionHeader } from '../types/ordenesProduccion.types';

interface IngresarOrdenBatchVars {
    ordenHaader: OrdenProduccionHeader;
    archivo: File;
}

export function useIngresarOrdenProduccion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ ordenHaader, archivo }: IngresarOrdenBatchVars) =>
            ingresarOrdenProduccionBatch(ordenHaader, archivo),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.ordenesProduccion.all });
        },
    });
}

export function useEliminarOrdenProduccion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: eliminarOrdenProduccion,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.ordenesProduccion.all });
        },
    });
}