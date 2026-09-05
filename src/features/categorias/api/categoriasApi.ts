import { httpClient } from '@/shared/api/httpClient';
import { ConsultarCategoriasResponse, DesactivarCategoriaResponse } from '../types/categorias.types';

export async function getCategorias(): Promise<ConsultarCategoriasResponse>{
    const {data} = await httpClient.get<ConsultarCategoriasResponse>(
        '/consultarcategorias',
    )
    return data;
}

export async function desactivarCategoria(idProducto: number): Promise<DesactivarCategoriaResponse> {
    const { data } = await httpClient.delete<DesactivarCategoriaResponse>(
      `/descativar-categoria/${idProducto}`,
    );
    return data;
  }
  