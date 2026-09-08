import type { WithPayload } from '@/shared/api/apiEnvelope';

export interface ActualizarPerfilRequest {
  idUsuario: number;
  nombreUsuario: string;
  apellidoUsuario: string;
  correoUsuario: string;
  usuario: string;
}
export type ActualizarPerfilResponse = WithPayload<'usuarioActualizado', number>;

export interface ActualizarPasswordRequest {
  usuario: string;
  contrasena: string;
}
export type ActualizarPasswordResponse = WithPayload<'passActualizado', number>;