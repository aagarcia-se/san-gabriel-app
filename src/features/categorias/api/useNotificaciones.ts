import { getUserNotifiacionesActivas } from "@/features/notificaciones/api/notificacionesApi";
import { queryKeys } from "@/shared/api/queryClient";
import { useQuery } from "@tanstack/react-query";

export function useUsuariosNotificaciones(){
    return useQuery({
        queryKey: queryKeys.notificaciones.list(),
        queryFn: getUserNotifiacionesActivas,
        select: (data) => data.usuariosNoti,
    });
}