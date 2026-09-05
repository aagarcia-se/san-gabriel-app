import { httpClient } from "@/shared/api/httpClient";
import type { ActualizarRecetaRequest, ActualizarRecetaResponse, ConsultarRecetasResponse, CrearRecetaRequest, CrearRecetaResponse, EliminarRecetaResponse } from "../types/recetas.types";

export async function getRecetas(): Promise<ConsultarRecetasResponse>{
    const {data} = await httpClient.get<ConsultarRecetasResponse>(
        '/consultar-recetas',
    )
    return data;
}

export async function crearReceta(payload: CrearRecetaRequest): Promise<CrearRecetaResponse> {
    const { data } = await httpClient.post<CrearRecetaResponse>(
        '/ingresar-receta',
        payload);
    return data;
}

export async function actualizarReceta(
    payload: ActualizarRecetaRequest,
  ): Promise<ActualizarRecetaResponse> {
    const { data } = await httpClient.put<ActualizarRecetaResponse>(
      '/actualizar-receta',
      payload,
    );
    return data;
  }

export async function eliminarReceta(idProducto: number): Promise<EliminarRecetaResponse> {
    const { data } = await httpClient.delete<EliminarRecetaResponse>(
      `/elminar-receta/${idProducto}`,
    );
    return data;
  }