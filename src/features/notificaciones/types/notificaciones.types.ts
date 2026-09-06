import type { WithPayload } from '@/shared/api/apiEnvelope';

export interface Notificacion {
  idUsuario: number;
  nombreUsuario: string;
  apellidoUsuario: string;
  correoUsuario: string;
  aliasUsuario: string | null;
  activo: number | null;
  tipoEvento: string | null;
}

export interface ActivarNotificaionRequest {
  idUsuario: number;
  tipoEvento: string;
  activo: number;
  fechaCreacion: string;
}

export interface GestionarNotificacionRequest {
  idUsuario: number;
  tipoEvento: string;
  activo: number;
  fechaActualizacion: string;
}

// Ambos endpoints reciben un array — uno o varios usuarios a la vez.
export type ActivarNotificacionesRequest = ActivarNotificaionRequest[];
export type ActivarNotificaionResponse = WithPayload<'usuariosNoti', number>;

export type GestionarNotificacionesRequest = GestionarNotificacionRequest[];
export type GestionarNotificacionesResponse = WithPayload<'usuariosNoti', number>;

export type ConsultarNotificacionesActivasResponse = WithPayload<'usuariosNoti', Notificacion[]>;