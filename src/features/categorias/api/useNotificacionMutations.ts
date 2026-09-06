import { activarNotificaciones, gestionarNotificaciones } from "@/features/notificaciones/api/notificacionesApi";
import { queryKeys } from "@/shared/api/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useActivarNotificacion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: activarNotificaciones,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notificaciones.list() });
        },
    });
}

export function useGestionarNotificaciones() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: gestionarNotificaciones,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notificaciones.list() });
        },
    });
}
