import { httpClient } from '@/shared/api/httpClient';
import type {
  ActualizarSucursalRequest,
  ActualizarSucursalResponse,
  ConsultarSucursalesResponse,
  EliminarSucursalResponse,
  IngresarSucursalRequest,
  IngresarSucursalResponse,
} from '../types/sucursal.types';

export async function getSucursales(): Promise<ConsultarSucursalesResponse> {
  const { data } = await httpClient.get<ConsultarSucursalesResponse>('/getSucursales');
  return data;
}

export async function ingresarSucursal(
  payload: IngresarSucursalRequest,
): Promise<IngresarSucursalResponse> {
  const { data } = await httpClient.post<IngresarSucursalResponse>('/ingresarSucursal', payload);
  return data;
}

export async function actualizarSucursal(
  payload: ActualizarSucursalRequest,
): Promise<ActualizarSucursalResponse> {
  const { data } = await httpClient.put<ActualizarSucursalResponse>(
    '/actualizar-sucursal',
    payload,
  );
  return data;
}

export async function eliminarSucursal(idSucursal: number): Promise<EliminarSucursalResponse> {
  const { data } = await httpClient.delete<EliminarSucursalResponse>(
    `/eliminarSucursal/${idSucursal}`,
  );
  return data;
}
