import { httpClient } from '@/shared/api/httpClient';
import type { ConsultarPermisosResponse } from '../types/permiso.types';

export async function getPermisos(): Promise<ConsultarPermisosResponse> {
  const { data } = await httpClient.get<ConsultarPermisosResponse>('/consultarPermisos');
  return data;
}
