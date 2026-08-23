import { httpClient } from '@/shared/api/httpClient';
import type { ConsultarUsuariosResponse } from '../types/usuario.types';

export async function getUsuarios(): Promise<ConsultarUsuariosResponse> {
  const { data } = await httpClient.get<ConsultarUsuariosResponse>('/consultarUsuarios');
  return data;
}
