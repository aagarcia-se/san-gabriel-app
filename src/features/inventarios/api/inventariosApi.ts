import { httpClient } from '@/shared/api/httpClient';
import type {
  CancelarDescuentoResponse,
  ConsultarDescuentosResponse,
  ConsultarDetalleDescuentoResponse,
  ConsultarDetalleTrasladoResponse,
  ConsultarStockGeneralResponse,
  ConsultarTrasladosResponse,
  DescontarStockRequest,
  DescontarStockResponse,
  EliminarTrasladoResponse,
  IngresarStockRequest,
  IngresarStockResponse,
  RegistrarTrasladoRequest,
  RegistrarTrasladoResponse,
} from '../types/inventarios.types';

export async function consultarStockGeneral(
  idSucursal: number,
  fecha: string,
): Promise<ConsultarStockGeneralResponse> {
  const { data } = await httpClient.get<ConsultarStockGeneralResponse>(
    '/consultar-stock-general',
    { params: { idSucursal, fecha } },
  );
  return data;
}

export async function ingresarStockProductos(
  payload: IngresarStockRequest,
): Promise<IngresarStockResponse> {
  const { data } = await httpClient.post<IngresarStockResponse>(
    '/ingresar-stock-productos',
    payload,
  );
  return data;
}

export async function descontarStock(
  payload: DescontarStockRequest,
): Promise<DescontarStockResponse> {
  const { data } = await httpClient.post<DescontarStockResponse>(
    '/descontar-stock',
    payload,
  );
  return data;
}

export async function registrarTraslado(
  payload: RegistrarTrasladoRequest,
): Promise<RegistrarTrasladoResponse> {
  const { data } = await httpClient.post<RegistrarTrasladoResponse>(
    '/registrar-traslado',
    payload,
  );
  return data;
}

export async function consultarDescuentosPorSucursal(
  idSucursal: number,
): Promise<ConsultarDescuentosResponse> {
  const { data } = await httpClient.get<ConsultarDescuentosResponse>(
    `/consultar-descuento-stock-por-sucursal/${idSucursal}`,
  );
  return data;
}

export async function consultarTraslados(): Promise<ConsultarTrasladosResponse> {
  const { data } = await httpClient.get<ConsultarTrasladosResponse>('/consultar-traslados');
  return data;
}

export async function cancelarDescuentoStock(
  idDescuento: number,
): Promise<CancelarDescuentoResponse> {
  const { data } = await httpClient.delete<CancelarDescuentoResponse>(
    `/cancelar-descuento-stock/${idDescuento}`,
  );
  return data;
}

export async function eliminarTraslado(
  idTraslado: number,
): Promise<EliminarTrasladoResponse> {
  const { data } = await httpClient.delete<EliminarTrasladoResponse>(
    `/eliminar-traslado/${idTraslado}`,
  );
  return data;
}

export async function consultarDetalleTraslado(
  idTraslado: number,
): Promise<ConsultarDetalleTrasladoResponse> {
  const { data } = await httpClient.get<ConsultarDetalleTrasladoResponse>(
    `/consultar-detalle-traslado/${idTraslado}`,
  );
  return data;
}

export async function consultarDetalleDescuento(
  idDescuento: number,
): Promise<ConsultarDetalleDescuentoResponse> {
  const { data } = await httpClient.get<ConsultarDetalleDescuentoResponse>(
    `/consultar-detalle-descuento/${idDescuento}`,
  );
  return data;
}