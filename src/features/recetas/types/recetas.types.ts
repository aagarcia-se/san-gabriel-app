import type { WithPayload } from '@/shared/api/apiEnvelope';

export interface Receta {
  idReceta: number;
  cantidadNecesaria: number;
  fechaCreacion: string;
  idProducto: number;
  nombreProducto: string;
  idIngrediente: number;
  nombreIngrediente: string;
  unidadMedida: string;
}

// GET /consultarRecetas responde:
// { status, message, recetas: [...] }
export type ConsultarRecetasResponse = WithPayload<'recetas', Receta[]>;

export interface DetalleReceta {
  idIngrediente: number;
  cantidadNecesaria: string;
  fechaCreacion: string;
}

export interface CrearRecetaRequest {
  idProducto: number;
  detallesReceta: DetalleReceta[];
}
export type CrearRecetaResponse = WithPayload<'idReceta', number>;

export interface ActualizarRecetaRequest {
  idReceta: number;
  idIngrediente: number;
  cantidadNecesaria: string;
}
export type ActualizarRecetaResponse = WithPayload<'recetaActualizada', number>;

export type EliminarRecetaResponse = WithPayload<'recetaEliminada', number>;