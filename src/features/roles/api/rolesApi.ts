import { httpClient } from '@/shared/api/httpClient';
import type {
  ActualizarRolRequest,
  ActualizarRolResponse,
  ConsultarRolesResponse,
  ConsultarRolPermisosResponse,
  EliminarPermisosBatchRequest,
  EliminarRolPermisosBatchResponse,
  EliminarRolResponse,
  IngresarPermisosBatchRequest,
  IngresarPermisosBatchResponse,
  IngresarRolRequest,
  IngresarRolResponse,
} from '../types/rol.types';

export async function getRoles(): Promise<ConsultarRolesResponse> {
  const { data } = await httpClient.get<ConsultarRolesResponse>('/consultarRoles');
  return data;
}

export async function ingresarRol(payload: IngresarRolRequest): Promise<IngresarRolResponse> {
  const { data } = await httpClient.post<IngresarRolResponse>('/ingresarRol', payload);
  return data;
}

export async function actualizarRol(
  payload: ActualizarRolRequest,
): Promise<ActualizarRolResponse> {
  const { data } = await httpClient.put<ActualizarRolResponse>('/actualizarRol/', payload);
  return data;
}

export async function eliminarRol(idRol: number): Promise<EliminarRolResponse> {
  const { data } = await httpClient.delete<EliminarRolResponse>(`/eliminarRol/${idRol}`);
  return data;
}

export async function getRolPermisos(idRol: number): Promise<ConsultarRolPermisosResponse> {
  const { data } = await httpClient.get<ConsultarRolPermisosResponse>(
    `/consultarRolesPermisosId/${idRol}`,
  );
  return data;
}

// Batch: los que hay que usar para asignar/quitar permisos (más rápido
// que uno por uno, corren en una sola transacción del lado del backend).
export async function ingresarPermisosBatch(
  dataRolesPermisos: IngresarPermisosBatchRequest,
): Promise<IngresarPermisosBatchResponse> {
  const { data } = await httpClient.post<IngresarPermisosBatchResponse>('/ingresarPermisosBatch', {
    dataRolesPermisos,
  });
  return data;
}

export async function eliminarRolPermisosBatch(
  dataRolesPermisos: EliminarPermisosBatchRequest,
): Promise<EliminarRolPermisosBatchResponse> {
  const { data } = await httpClient.post<EliminarRolPermisosBatchResponse>(
    '/eliminarRolPermisosBatch',
    { dataRolesPermisos },
  );
  return data;
}
