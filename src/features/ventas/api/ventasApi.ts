import { httpClient } from '@/shared/api/httpClient';
import type {
  ConsultarDetalleVentaResponse,
  ConsultarVentasPorSucursalResponse,
  EliminarVentaParams,
  EliminarVentaResponse,
  IngresarVentaRequest,
  IngresarVentaResponse,
} from '../types/ventas.types';

export async function consultarVentasPorSucursal(
  idSucursal: number,
): Promise<ConsultarVentasPorSucursalResponse> {
  const { data } = await httpClient.get<ConsultarVentasPorSucursalResponse>(
    `/consultar-venta-por-sucursal/${idSucursal}`,
  );
  return data;
}

export async function consultarDetalleVenta(
  idVenta: number,
): Promise<ConsultarDetalleVentaResponse> {
  const { data } = await httpClient.get<ConsultarDetalleVentaResponse>(
    `/consultar-detalle-venta/${idVenta}`,
  );
  return data;
}

export async function eliminarVenta(
  params: EliminarVentaParams,
): Promise<EliminarVentaResponse> {
  const { data } = await httpClient.delete<EliminarVentaResponse>('/eliminar-venta', {
    params,
  });
  return data;
}

export async function ingresarVenta(
  payload: IngresarVentaRequest,
): Promise<IngresarVentaResponse> {
  const { data } = await httpClient.post<IngresarVentaResponse>('/ingresar-venta', payload);
  return data;
}