import { httpClient } from '@/shared/api/httpClient';
import type {
  ActualizarPasswordRequest,
  ActualizarPasswordResponse,
  ActualizarPerfilRequest,
  ActualizarPerfilResponse,
} from '../types/perfil.types';

export async function actualizarPerfil(
  payload: ActualizarPerfilRequest,
): Promise<ActualizarPerfilResponse> {
  const { data } = await httpClient.put<ActualizarPerfilResponse>('/actualizarUsuario', payload);
  return data;
}

export async function actualizarPassword(
  payload: ActualizarPasswordRequest,
): Promise<ActualizarPasswordResponse> {
  const { data } = await httpClient.put<ActualizarPasswordResponse>('/actualizar-pass', payload);
  return data;
}