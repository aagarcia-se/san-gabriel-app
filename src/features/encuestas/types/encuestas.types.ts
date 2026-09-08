import type { WithPayload } from '@/shared/api/apiEnvelope';

export type EstadoEncuesta = 'draft' | 'active' | 'paused' | 'closed';
export type EstadoCalculado = 'draft' | 'active' | 'scheduled' | 'closed';
export type TipoEncuesta = 'presencial' | 'online';
export type TipoPregunta = 'pregunta' | 'texto';

// --- Listado ---
export interface EncuestaListItem {
  id: number;
  title: string;
  descripcion: string;
  status: EstadoEncuesta;
  type: TipoEncuesta;
  created: string;
  start_date: string;
  end_date: string;
  survey_url: string;
  questions: number;
  responses: number;
  calculated_status: EstadoCalculado;
}

export type ConsultarEncuestasResponse = WithPayload<'encuestas', EncuestaListItem[]>;

// --- Detalle ---
export interface PreguntaDetalle {
  idPregunta: number;
  tipo: TipoPregunta;
  pregunta: string;
}

export interface CampaniaDetalle {
  idCampania: number;
  nombreCampania: string;
  descripcion: string;
  usuario: string;
  fechaInicio: string;
  fechaFin: string;
  activa: number;
}

export interface EncuestaDetalle {
  detalle: CampaniaDetalle;
  preguntas: PreguntaDetalle[];
}

export type ConsultarEncuestaDetalleResponse = WithPayload<'campania', EncuestaDetalle>;

// --- Crear / Modificar ---
export interface PreguntaPayload {
    tipo: TipoPregunta;
    pregunta: string;
    orden: number;
    obligatoria: 0 | 1;
    fechaCreacion: string; // 👈 agregado — el batch de preguntas lo requiere
  }

  export interface CrearCampaniaRequest {
    nombreCampania: string;
    descripcion: string;
    fechaCreacion: string;
    fechaActualizacion: string;
    fechaInicio: string;
    fechaFin: string;
    idUsuarioCreo: number;
    tipoEncuesta: TipoEncuesta;
    urlEncuesta: string; // 👈 agregado
    preguntas: PreguntaPayload[];
  }
export type CrearCampaniaResponse = WithPayload<'idCampania', number>;

export interface ModificarCampaniaRequest extends CrearCampaniaRequest {
  idCampania: number;
}
export type ModificarCampaniaResponse = WithPayload<'idCampania', number>;

// --- Eliminar ---
export type EliminarEncuestaResponse = WithPayload<'encuestaEliminada', number>;