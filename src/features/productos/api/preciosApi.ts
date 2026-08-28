import { httpClient } from '@/shared/api/httpClient';
import type {
  ActualizarPrecioResponse,
  ConsultarPreciosResponse,
  IngresarPrecioResponse,
  PrecioRequest,
} from '../types/precio.types';

export async function getPrecios(): Promise<ConsultarPreciosResponse> {
  const { data } = await httpClient.get<ConsultarPreciosResponse>('/consultarPrecios');
  return data;
}

export async function ingresarPrecio(payload: PrecioRequest): Promise<IngresarPrecioResponse> {
  const { data } = await httpClient.post<IngresarPrecioResponse>('/ingresarPrecio', payload);
  return data;
}

export async function actualizarPrecio(
  payload: PrecioRequest,
): Promise<ActualizarPrecioResponse> {
  const { data } = await httpClient.put<ActualizarPrecioResponse>('/actualizarPrecio/', payload);
  return data;
}
