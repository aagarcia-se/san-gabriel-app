import { httpClient } from '@/shared/api/httpClient';
import type {
  ActualizarProductoRequest,
  ActualizarProductoResponse,
  ConsultarProductosResponse,
  IngresarProductoRequest,
  IngresarProductoResponse,
} from '../types/producto.types';

export async function getProductos(): Promise<ConsultarProductosResponse> {
  const { data } = await httpClient.get<ConsultarProductosResponse>('/consultarProductos');
  return data;
}

export async function ingresarProducto(
  payload: IngresarProductoRequest,
): Promise<IngresarProductoResponse> {
  const { data } = await httpClient.post<IngresarProductoResponse>('/ingresarProducto', payload);
  return data;
}

export async function actualizarProducto(
  payload: ActualizarProductoRequest,
): Promise<ActualizarProductoResponse> {
  const { data } = await httpClient.put<ActualizarProductoResponse>(
    '/actualizarProducto/',
    payload,
  );
  return data;
}
