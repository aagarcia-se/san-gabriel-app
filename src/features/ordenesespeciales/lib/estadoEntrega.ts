import dayjs from 'dayjs';

export type EstadoEntrega = 'pendiente' | 'en_proceso' | 'entregado';

// Se calcula en el cliente comparando fechaEntrega contra hoy — no viene
// del backend (el campo "estado" que sí viene del backend es 'A'/'C',
// activo/cancelado, un concepto distinto).
export function calcularEstadoEntrega(fechaEntrega: string): EstadoEntrega {
  const hoy = dayjs().startOf('day');
  const entrega = dayjs(fechaEntrega).startOf('day');

  if (entrega.isAfter(hoy)) return 'pendiente';
  if (entrega.isSame(hoy)) return 'en_proceso';
  return 'entregado';
}

export const ESTADO_ENTREGA_LABEL: Record<EstadoEntrega, string> = {
  pendiente: 'Sin entregar',
  en_proceso: 'En proceso de entrega',
  entregado: 'Entregado',
};