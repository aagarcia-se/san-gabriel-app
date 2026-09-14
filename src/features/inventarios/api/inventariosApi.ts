// inventariosApi.ts
import { httpClient } from '@/shared/api/httpClient';
import type { ConsultarStockGeneralResponse } from '../types/inventarios.types';

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