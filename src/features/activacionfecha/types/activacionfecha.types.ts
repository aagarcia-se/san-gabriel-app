import type { WithPayload } from '@/shared/api/apiEnvelope';

export interface ActivacionFecha {
  idActivacion: number;
  activado_por: number;
  activado_en: string;
  expira_en: string;
  segundos_restantes: number;
  fecha_produccion_a_setear: string;
}

export type ConsultarFechaActivaResponse = WithPayload<'diaProduccion', ActivacionFecha[]>;

export interface ActivarFechaRequest {
  activado_por: number;
  activado_en: string;
  expira_en: string;
  notas: string;
}
export type ActivarFechaResponse = WithPayload<'fechaId', number>;