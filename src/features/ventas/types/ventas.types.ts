import { TipoProduccionStock } from '@/features/inventarios/types/inventarios.types';
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

/* ==========================================================================
   DETALLE DE VENTA
   ========================================================================== */

// Mismos campos que VentaItem, más "usuario" (el login) que el
// encabezado del detalle sí incluye.
export interface EncabezadoVentaDetalle {
  idVenta: number;
  idUsuario: number;
  usuario: string;
  nombreUsuario: string;
  idSucursal: number;
  ventaTurno: TurnoVenta;
  nombreSucursal: string;
  fechaVenta: string;
  totalVenta: number;
  estadoVenta: EstadoVenta;
}

export interface DetalleVentaProducto {
  idDetalleVenta: number;
  idVenta: number;
  idProducto: number;
  nombreProducto: string;
  controlarStock: 0 | 1;
  controlarStockDiario: 0 | 1;
  cantidadVendida: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
}

export interface DetalleIngresosVenta {
  idIngreso: number;
  idVenta: number;
  montoTotalIngresado: number;
  montoTotalGastos: number;
  montoEsperado: number;
  diferencia: number;
  fechaIngreso: string;
}

// El array vino vacío en el ejemplo que compartiste, así que esta forma
// es una suposición razonable — ajústala en cuanto veas un gasto real
// en la respuesta.
export interface DetalleGastoVenta {
  idGasto: number;
  idVenta: number;
  concepto: string;
  monto: number;
  fechaGasto: string;
}

export interface VentaDetalleCompleta {
  encabezadoVenta: EncabezadoVentaDetalle;
  detalleVenta: DetalleVentaProducto[];
  detalleIngresos: DetalleIngresosVenta;
  detalleGastos: DetalleGastoVenta[];
}

export type ConsultarDetalleVentaResponse = WithPayload<'venta', VentaDetalleCompleta>;

export interface EncabezadoVentaRequest {
  idOrdenProduccion: number | null;
  idUsuario: number;
  idSucursal: number;
  ventaTurno: TurnoVenta;
  fechaVenta: string;
  fechaCreacion: string;
  fechaYHoraVenta: string;
}

export interface DetalleVentaProductoRequest {
  idProducto: number;
  tipoProduccion: TipoProduccionStock;
  controlarStock: 0 | 1;
  controlarStockDiario: 0 | 1;
  idCategoria: number;
  fechaCreacion: string;
  unidadesNoVendidas: number;
}

export interface DetalleIngresoRequest {
  montoTotalIngresado: number;
  fechaIngreso: string;
}

export interface DetalleGastoRequest {
  detalleGasto: string;
  subTotal: number;
}

export interface EncabezadoGastosDiariosRequest {
  idUsuario: number;
  montoTotalGasto: number;
  fechaIngreso: string;
}

export interface GastosDiariosRequest {
  encabezadoGastosDiarios: EncabezadoGastosDiariosRequest;
  detalleGastosDiarios: DetalleGastoRequest[];
}

export interface IngresarVentaRequest {
  encabezadoVenta: EncabezadoVentaRequest;
  detalleVenta: DetalleVentaProductoRequest[];
  detalleIngreso: DetalleIngresoRequest;
  // null cuando no se registra ningún gasto en el turno — confirmar si
  // el backend en cambio espera un objeto con detalleGastosDiarios: []
  // en vez de null cuando no hay gastos.
  gastosDiarios: GastosDiariosRequest | null;
}

export type IngresarVentaResponse = WithPayload<'idVenta', number>;

export interface VentaBatchPayload {
  encabezadoVenta: EncabezadoVentaRequest;
  detalleIngreso: DetalleIngresoRequest;
  gastosDiarios: GastosDiariosRequest | null;
}

// Misma forma de respuesta que /ingresar-venta.
export type IngresarVentaBatchResponse = WithPayload<'idVenta', number>;