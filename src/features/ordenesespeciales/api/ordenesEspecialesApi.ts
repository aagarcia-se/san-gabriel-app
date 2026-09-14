import { httpClient } from '@/shared/api/httpClient';
import type {
  ActualizarOrdenEspecialRequest,
  ActualizarOrdenEspecialResponse,
  ConsultarOrdenesEspecialesResponse,
  ConsultarOrdenEspecialResponse,
  EliminarOrdenEspecialResponse,
  IngresarOrdenEspecialRequest,
  IngresarOrdenEspecialResponse,
} from '../types/ordenesEspeciales.types';

export async function consultarOrdenesEspeciales(
  idRol: number,
  idSucursal: number,
): Promise<ConsultarOrdenesEspecialesResponse> {
  const { data } = await httpClient.get<ConsultarOrdenesEspecialesResponse>(
    '/consultar-ordenes-especiales',
    { params: { idRol, idSucursal } },
  );
  return data;
}

export async function ingresarOrdenEspecial(
  payload: IngresarOrdenEspecialRequest,
): Promise<IngresarOrdenEspecialResponse> {
  const { data } = await httpClient.post<IngresarOrdenEspecialResponse>(
    '/ingresar-orden-especial',
    payload,
  );
  return data;
}

export async function actualizarOrdenEspecial(
  payload: ActualizarOrdenEspecialRequest,
): Promise<ActualizarOrdenEspecialResponse> {
  const { data } = await httpClient.put<ActualizarOrdenEspecialResponse>(
    '/actualizar-orden-especial',
    payload,
  );
  return data;
}

export async function eliminarOrdenEspecial(
  idOrdenEspecial: number,
): Promise<EliminarOrdenEspecialResponse> {
  const { data } = await httpClient.delete<EliminarOrdenEspecialResponse>(
    `/eliminar-orden-especial/${idOrdenEspecial}`,
  );
  return data;
}

export async function consultarOrdenEspecial(
    idOrdenEspecial: number,
  ): Promise<ConsultarOrdenEspecialResponse> {
    const { data } = await httpClient.get<ConsultarOrdenEspecialResponse>(
      `/consultar-orden-especial-id/${idOrdenEspecial}`,
    );
    return data;
  }