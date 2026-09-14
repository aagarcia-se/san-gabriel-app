import { Badge } from '@/shared/ui/Badge';
import { calcularEstadoEntrega, ESTADO_ENTREGA_LABEL } from '../lib/estadoEntrega';

const VARIANT_POR_ESTADO = {
  pendiente: 'warning',
  en_proceso: 'brand',
  entregado: 'success',
} as const;

export function EstadoEntregaBadge({ fechaEntrega }: { fechaEntrega: string }) {
  const estado = calcularEstadoEntrega(fechaEntrega);
  return <Badge variant={VARIANT_POR_ESTADO[estado]}>{ESTADO_ENTREGA_LABEL[estado]}</Badge>;
}