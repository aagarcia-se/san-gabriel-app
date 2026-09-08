import { httpClient } from '@/shared/api/httpClient';
import type {
  ActivarFechaRequest,
  ActivarFechaResponse,
  ConsultarFechaActivaResponse,
} from '../types/activacionfecha.types';

export async function getFechaActiva(fecha: string): Promise<ConsultarFechaActivaResponse> {
  const { data } = await httpClient.get<ConsultarFechaActivaResponse>('/fecha-produccion', {
    params: { fecha },
  });
  return data;
}

export async function activarFechaProduccion(
  payload: ActivarFechaRequest,
): Promise<ActivarFechaResponse> {
  const { data } = await httpClient.post<ActivarFechaResponse>(
    '/activar-fecha-produccion',
    payload,
  );
  return data;
}