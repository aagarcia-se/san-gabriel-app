import { httpClient } from '@/shared/api/httpClient';
import type {
  ConsultarStockGeneralResponse,
  DescontarStockRequest,
  DescontarStockResponse,
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