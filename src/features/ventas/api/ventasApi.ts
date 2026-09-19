import { httpClient } from '@/shared/api/httpClient';
import type {
  ConsultarVentasPorSucursalResponse,
  EliminarVentaParams,
  EliminarVentaResponse,
} from '../types/ventas.types';

export async function consultarVentasPorSucursal(
  idSucursal: number,
): Promise<ConsultarVentasPorSucursalResponse> {
  const { data } = await httpClient.get<ConsultarVentasPorSucursalResponse>(
    `/consultar-venta-por-sucursal/${idSucursal}`,
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