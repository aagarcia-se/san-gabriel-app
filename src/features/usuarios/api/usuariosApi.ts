import { httpClient } from '@/shared/api/httpClient';
import type {
  BloquearUsuarioResponse,
  ConsultarUsuariosResponse,
  DesbloquearUsuarioResponse,
  EliminarUsuarioResponse,
  ResetearContraseniaResponse,
} from '../types/usuario.types';

export async function getUsuarios(): Promise<ConsultarUsuariosResponse> {
  const { data } = await httpClient.get<ConsultarUsuariosResponse>('/consultarUsuarios');
  return data;
}

export async function bloquearUsuario(idUsuario: number): Promise<BloquearUsuarioResponse> {
  const { data } = await httpClient.put<BloquearUsuarioResponse>(`/bloquearUsuario/${idUsuario}`);
  return data;
}

export async function desbloquearUsuario(idUsuario: number): Promise<DesbloquearUsuarioResponse> {
  const { data } = await httpClient.put<DesbloquearUsuarioResponse>(
    `/desbloquearUsuario/${idUsuario}`,
  );
  return data;
}

export async function eliminarUsuario(idUsuario: number): Promise<EliminarUsuarioResponse> {
  const { data } = await httpClient.delete<EliminarUsuarioResponse>(
    `/eliminarUsuario/${idUsuario}`,
  );
  return data;
}

// El controller lee idUsuario de req.query, no de params — por eso va
// como querystring y no como segmento de ruta.
export async function resetearContrasenia(
  idUsuario: number,
): Promise<ResetearContraseniaResponse> {
  const { data } = await httpClient.put<ResetearContraseniaResponse>('/resetear-contrasenia', null, {
    params: { idUsuario },
  });
  return data;
}
