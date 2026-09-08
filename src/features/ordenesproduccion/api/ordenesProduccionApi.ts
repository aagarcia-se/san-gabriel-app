import { httpClient } from '@/shared/api/httpClient';
import type {
    ConsultarConsumoIngredientesResponse,
    ConsultarDetalleOrdenesProduccionResponse,
    ConsultarOrdenesProduccionResponse,
    EliminarOrdenProduccionResponse,
    IngresarOrdenProduccionBatchResponse,
    OrdenProduccionHeader,
} from '../types/ordenesProduccion.types';

export async function consultarOrdenesProduccion(
    idRol: number,
    idSucursal: number,
): Promise<ConsultarOrdenesProduccionResponse> {
    const { data } = await httpClient.get<ConsultarOrdenesProduccionResponse>(
        '/consultar-ordenes-produccion',
        { params: { idRol, idSucursal } },
    );
    return data;
}

export async function consultarConsumoIngredientes(
    idOrdenProduccion: number,
): Promise<ConsultarConsumoIngredientesResponse> {
    const { data } = await httpClient.get<ConsultarConsumoIngredientesResponse>(
        `/consultar-consumo-ingredientes/${idOrdenProduccion}`,
    );
    return data;
}

export async function ingresarOrdenProduccionBatch(
    ordenHaader: OrdenProduccionHeader,
    archivo: File,
): Promise<IngresarOrdenProduccionBatchResponse> {
    const formData = new FormData();
    formData.append('ordenProduccionBatch', archivo);
    formData.append('ordenHaader', JSON.stringify(ordenHaader));

    const { data } = await httpClient.post<IngresarOrdenProduccionBatchResponse>(
        '/ingresar-orden-batch',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
}

export async function consultarDetalleOrdenProduccion(
    idOrdenProduccion: number,
): Promise<ConsultarDetalleOrdenesProduccionResponse> {
    const { data } = await httpClient.get<ConsultarDetalleOrdenesProduccionResponse>(
        `/consultar-detalle-ordenes-produccion/${idOrdenProduccion}`,
    );
    return data;
}

export async function eliminarOrdenProduccion(
    idOrdenProduccion: number,
): Promise<EliminarOrdenProduccionResponse> {
    const { data } = await httpClient.delete<EliminarOrdenProduccionResponse>(
        `/eliminar-ordenes-produccion/${idOrdenProduccion}`,
    );
    return data;
}