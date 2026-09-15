import { httpClient } from '@/shared/api/httpClient';
import type {
  ConsultarStockGeneralResponse,
  IngresarStockRequest,
  IngresarStockResponse,
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