import { httpClient } from '@/shared/api/httpClient';
import type { ConsultarDataDashboardResponse } from '../types/dashboard.types';

export async function consultarDataDashboard(): Promise<ConsultarDataDashboardResponse> {
  const { data } = await httpClient.get<ConsultarDataDashboardResponse>(
    '/consultar-data-dashboard',
  );
  return data;
}