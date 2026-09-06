// notificacionesApi.ts
import { httpClient } from '@/shared/api/httpClient';
import type {
  ActivarNotificacionesRequest,
  ActivarNotificaionResponse,
  ConsultarNotificacionesActivasResponse,
  GestionarNotificacionesRequest,
  GestionarNotificacionesResponse,
} from '../types/notificaciones.types';

export async function getUserNotifiacionesActivas(): Promise<ConsultarNotificacionesActivasResponse> {
  const { data } = await httpClient.get<ConsultarNotificacionesActivasResponse>(
    '/consultar-activaciones-notificaciones',
  );
  return data;
}

export async function activarNotificaciones(
  payload: ActivarNotificacionesRequest,
): Promise<ActivarNotificaionResponse> {
  const { data } = await httpClient.post<ActivarNotificaionResponse>(
    '/activar-notificaciones',
    payload,
  );
  return data;
}

export async function gestionarNotificaciones(
  payload: GestionarNotificacionesRequest,
): Promise<GestionarNotificacionesResponse> {
  const { data } = await httpClient.put<GestionarNotificacionesResponse>(
    '/gestion-de-notificaciones',
    payload,
  );
  return data;
}