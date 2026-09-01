import { httpClient } from '@/shared/api/httpClient';
import type {
  ActualizarProductoRequest,
  ActualizarProductoResponse,
  ConsultarProductosResponse,
  IngresarProductoRequest,
  IngresarProductoResponse,
} from '../types/producto.types';
import type { ConsultarProductosConPreciosResponse } from '../types/precio.types';

// Fuente única para la sección de Productos por ahora (ver useProductos.ts).
export async function getProductosConPrecios(): Promise<ConsultarProductosConPreciosResponse> {
  const { data } = await httpClient.get<ConsultarProductosConPreciosResponse>(
    '/productos-con-precios',
  );
  return data;
}

// Sin usar por ahora — se deja implementado por si hace falta más
// adelante (ej. una pantalla que también muestre productos inactivos).
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
