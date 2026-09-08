import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryClient';
import { actualizarPassword, actualizarPerfil } from './perfilApi';

export function useActualizarPerfil() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: actualizarPerfil,
    onSuccess: () => {
      // Este mismo usuario también aparece en la tabla de UsuariosPage
      // (admin gestionando personal) — se invalida para que refleje el
      // cambio ahí también, no solo en esta pantalla.
      queryClient.invalidateQueries({ queryKey: queryKeys.usuarios.list() });
    },
  });
}

export function useActualizarPassword() {
  return useMutation({
    mutationFn: actualizarPassword,
  });
}