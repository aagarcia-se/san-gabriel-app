import { httpClient } from '@/shared/api/httpClient';
import type {
  ActualizarCategoriaRequest,
  ActualizarCategoriaResponse,
  ConsultarCategoriasResponse,
  CrearCategoriaRequest,
  CrearCategoriaResponse,
  DesactivarCategoriaResponse,
} from '../types/categorias.types';

export async function getCategorias(): Promise<ConsultarCategoriasResponse> {
  const { data } = await httpClient.get<ConsultarCategoriasResponse>(
    '/consultarcategorias',
  )
  return data;
}

export async function crearCategoria(payload: CrearCategoriaRequest): Promise<CrearCategoriaResponse> {
  const { data } = await httpClient.post<CrearCategoriaResponse>(
    '/ingresarcategoria',
    payload);
  return data;
}

export async function actualizarCategoria(
  payload: ActualizarCategoriaRequest,
): Promise<ActualizarCategoriaResponse> {
  const { data } = await httpClient.put<ActualizarCategoriaResponse>(
    '/actualizarcategoria',
    payload,
  );
  return data;
}

export async function desactivarCategoria(idProducto: number): Promise<DesactivarCategoriaResponse> {
  const { data } = await httpClient.delete<DesactivarCategoriaResponse>(
    `/descativar-categoria/${idProducto}`,
  );
  return data;
}
