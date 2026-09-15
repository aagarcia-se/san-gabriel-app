import type { WithPayload } from '@/shared/api/apiEnvelope';

export type TipoProduccionStock = 'bandejas' | 'harina' | 'Otros';

// idStock e idStockDiario nunca vienen ambos con valor — el backend une
// dos tablas distintas (stock general vs. stock diario) en una sola
// consulta, y cada fila pertenece a una sola de las dos.
export interface StockGeneralItem {
  orden: number;
  idStock: number | null;
  idStockDiario: number | null;
  idProducto: number;
  nombreProducto: string;
  idCategoria: number;
  nombreCategoria: string;
  idSucursal: number;
  nombreSucursal: string;
  cantidadExistente: number;
  controlarStock: 0 | 1;
  controlarStockDiario: 0 | 1;
  tipoStock: 'Stock General' | 'Stock Diario';
  tipoProduccion: TipoProduccionStock;
}

export type ConsultarStockGeneralResponse = WithPayload<'stockProductos', StockGeneralItem[]>;

export interface IngresarStockItem {
  idUsuario: number;
  idProducto: number;
  idSucursal: number;
  stock: number;
  tipoProduccion: TipoProduccionStock;
  controlarStock: 0 | 1;
  controlarStockDiario: 0 | 1;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface IngresarStockRequest {
  stockProductos: IngresarStockItem[];
}

// La respuesta no trae payload adicional, solo status/message.
export interface IngresarStockResponse {
  status: number;
  message: string;
}

/* ==========================================================================
   DESCUENTO DE STOCK
   ========================================================================== */

export type TipoDescuento = 'MAYOREO' | 'MAL ESTADO' | 'CORRECCION';
export type TurnoDescuento = 'AM' | 'PM';

export interface DescuentoInfoPayload {
  idSucursal: string;
  idUsuario: number;
  tipoDescuento: TipoDescuento;
  descuentoTurno: TurnoDescuento;
  fechaDescuento: string;
  fechaCreacion: string;
}

export interface DetalleDescuentoItem {
  idProducto: number;
  controlarStock: 0 | 1;
  controlarStockDiario: 0 | 1;
  stockADescontar: string;
  fechaDescuento: string;
}

export interface DescontarStockRequest {
  descuentoInfo: DescuentoInfoPayload;
  detalleDescuento: DetalleDescuentoItem[];
}

export interface DescuentoRegistrado {
  idDescuento: string;
  descuentoInfo: DescuentoInfoPayload;
  detalleDescuento: DetalleDescuentoItem[];
}

export type DescontarStockResponse = WithPayload<'stockADescontar', DescuentoRegistrado>;