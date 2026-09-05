import { useMutation, useQueryClient } from "@tanstack/react-query";
import { actualizarReceta, crearReceta, eliminarReceta } from "./recetasApi";
import { queryKeys } from "@/shared/api/queryClient";

export function useCrearReceta() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: crearReceta,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.recetas.list() });
        },
    });
}

export function useActualizarReceta() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: actualizarReceta,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.recetas.list() });
        },
    });
}

export function useEliminarReceta() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: eliminarReceta,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.recetas.list() });
        },
    });
}