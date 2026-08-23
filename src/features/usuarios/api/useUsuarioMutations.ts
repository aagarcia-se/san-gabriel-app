import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bloquearUsuario, desbloquearUsuario, eliminarUsuario, resetearContrasenia } from './usuariosApi';
import { queryKeys } from '@/shared/api/queryClient';

export function useBloquearUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bloquearUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.usuarios.list() });
    },
  });
}

export function useDesbloquearUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: desbloquearUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.usuarios.list() });
    },
  });
}

export function useEliminarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eliminarUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.usuarios.list() });
    },
  });
}

// No invalida la lista: resetear la contraseña no cambia ningún dato
// visible en la tabla/tarjetas.
export function useResetearContrasenia() {
  return useMutation({
    mutationFn: resetearContrasenia,
  });
}
