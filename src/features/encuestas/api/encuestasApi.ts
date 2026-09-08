import { httpClient } from '@/shared/api/httpClient';
import type {
  ConsultarEncuestaDetalleResponse,
  ConsultarEncuestasResponse,
  CrearCampaniaRequest,
  CrearCampaniaResponse,
  EliminarEncuestaResponse,
  ModificarCampaniaRequest,
  ModificarCampaniaResponse,
} from '../types/encuestas.types';

export async function consultarEncuestas(): Promise<ConsultarEncuestasResponse> {
  const response = await httpClient.get<ConsultarEncuestasResponse>('/consultar-encuestas');

  // El backend responde 204 sin body cuando no hay encuestas — Axios no
  // trae el shape esperado en ese caso. Se normaliza acá para que el
  // resto de la app (hooks, componentes) nunca piense en el 204 como
  // caso especial: siempre recibe un array, vacío o no.
  if (response.status === 204) {
    return { status: 204, message: 'Sin encuestas registradas', encuestas: [] };
  }

  return response.data;
}

export async function consultarEncuestaDetalle(
  idCampania: number,
): Promise<ConsultarEncuestaDetalleResponse> {
  const { data } = await httpClient.get<ConsultarEncuestaDetalleResponse>(
    '/consultar-encuesta-detalle',
    { params: { idCampania } },
  );
  return data;
}

export async function crearCampania(
  payload: CrearCampaniaRequest,
): Promise<CrearCampaniaResponse> {
  const { data } = await httpClient.post<CrearCampaniaResponse>('/crear-campania', payload);
  return data;
}

export async function modificarCampania(
  payload: ModificarCampaniaRequest,
): Promise<ModificarCampaniaResponse> {
  const { data } = await httpClient.put<ModificarCampaniaResponse>(
    '/modificar-campania',
    payload,
  );
  return data;
}

export async function eliminarEncuesta(idCampania: number): Promise<EliminarEncuestaResponse> {
  const { data } = await httpClient.delete<EliminarEncuestaResponse>('/eliminar-encuesta', {
    params: { idCampania },
  });
  return data;
}