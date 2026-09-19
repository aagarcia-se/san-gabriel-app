import type { WithPayload } from '@/shared/api/apiEnvelope';

export type TurnoVenta = 'AM' | 'PM';

// Mismo patrón que EstadoOrdenProduccion: 'P' pendiente, 'C' completada.
// OJO: ajusta esto si el estado real de una venta usa otros valores.
export type EstadoVenta = 'P' | 'C';

export interface VentaItem {
  idVenta: number;
  ventaTurno: TurnoVenta;
  idUsuario: number;
  nombreUsuario: string;
  idSucursal: number;
  nombreSucursal: string;
  fechaVenta: string;
  totalVenta: number;
  estadoVenta: EstadoVenta;
}

export type ConsultarVentasPorSucursalResponse = WithPayload<'ventas', VentaItem[]>;

export interface EliminarVentaParams {
  idVenta: number;
  dateTime: string;
}

// La respuesta no trae payload adicional, solo status/message.
export interface EliminarVentaResponse {
  status: number;
  message: string;
}