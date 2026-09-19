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
  idSucursal: number;
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
  stockADescontar: number;
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

/* ==========================================================================
   TRASLADO DE STOCK ENTRE SUCURSALES
   ========================================================================== */

export interface TrasladoHeaderPayload {
  idSucursalOrigen: number;
  idSucursalDestino: number;
  idUsuario: number;
  fechaTraslado: string;
}

export interface TrasladoDetalleItem {
  idProducto: number;
  tipoProduccion: TipoProduccionStock;
  controlarStock: 0 | 1;
  controlarStockDiario: 0 | 1;
  cantidadATrasladar: number;
  fechaTraslado: string;
}

// OJO: la key "traladoHeader" (sin la "s" de "traslado") es tal cual la
// espera tu API — no es un typo mío, es el nombre real del campo.
export interface RegistrarTrasladoRequest {
  traladoHeader: TrasladoHeaderPayload;
  trasladoDetalle: TrasladoDetalleItem[];
}

export interface TrasladoRegistrado {
  idTraslado: string;
  idSucursalOrigen: number;
  idSucursalDestino: number;
  idUsuario: number;
  fechaTraslado: string;
}

export type RegistrarTrasladoResponse = WithPayload<'resTraslado', TrasladoRegistrado>;

/* ==========================================================================
   HISTORIAL DE MOVIMIENTOS
   ========================================================================== */

export interface DescuentoListItem {
  idDescuento: number;
  idSucursal: number;
  descuentoTurno: TurnoDescuento;
  nombreSucursal: string;
  idUsuario: number;
  nombreUsuario: string;
  tipoDescuento: TipoDescuento;
  fechaDescuento: string;
  fechaCreacion: string;
  estado: string;
}

export type ConsultarDescuentosResponse = WithPayload<'descuentos', DescuentoListItem[]>;

export interface TrasladoListItem {
  idTraslado: number;
  sucursalOrigen: string;
  sucursalDestino: string;
  usuarioResponsable: string;
  fechaTraslado: string;
}

export type ConsultarTrasladosResponse = WithPayload<'traslados', TrasladoListItem[]>;

// Vista unificada para el historial: ambos tipos de movimiento
// normalizados a una sola forma, para poder mostrarlos mezclados
// y ordenados por fecha en la misma lista.
export type TipoMovimiento = 'descuento' | 'traslado';

export interface MovimientoUnificado {
  tipo: TipoMovimiento;
  id: number;
  fecha: string;
  usuario: string;
  /** Descuento: tipo + turno. Traslado: origen → destino. */
  descripcion: string;
  detalle: string;
}

export type CancelarDescuentoResponse = WithPayload<'gestionEliminada', number>;

// OJO: la key "TraladaoElminado" viene así del backend (con typos y
// mayúscula inicial) — no la corrijas aquí o dejará de leerse.
export type EliminarTrasladoResponse = WithPayload<'TraladaoElminado', number>;


/* ==========================================================================
   DETALLE DE MOVIMIENTOS
   ========================================================================== */

   export interface TrasladoEncabezado {
    idTraslado: number;
    idSucursalOrigen: number;
    sucursalOrigen: string;
    idSucursalDestino: number;
    sucursalDestino: string;
    idUsuario: number;
    usuarioResponsable: string;
    fechaTraslado: string;
  }
  
  export interface TrasladoDetalleLinea {
    idTrasladoDetalle: number;
    idProducto: number;
    nombreProducto: string;
    cantidadATrasladar: number;
    controlarStock: 0 | 1;
    controlarStockDiario: 0 | 1;
  }
  
  export interface TrasladoDetalleCompleto {
    encabezadoTraslado: TrasladoEncabezado;
    detalle: TrasladoDetalleLinea[];
  }
  
  export type ConsultarDetalleTrasladoResponse = WithPayload<'traslado', TrasladoDetalleCompleto>;
  
  export interface DescuentoEncabezado {
    idDescuento: number;
    idSucursal: number;
    descuentoTurno: TurnoDescuento;
    nombreSucursal: string;
    idUsuario: number;
    nombreUsuario: string;
    tipoDescuento: TipoDescuento;
    fechaDescuento: string;
    estado: string;
  }
  
  export interface DescuentoDetalleLinea {
    idDetalleDescuento: number;
    idProducto: number;
    nombreProducto: string;
    controlarStock: 0 | 1;
    controlarStockDiario: 0 | 1;
    unidadesDescontadas: number;
  }
  
  export interface DescuentoDetalleCompleto {
    encabezadoDescuento: DescuentoEncabezado;
    detalleDescuento: DescuentoDetalleLinea[];
  }
  
  export type ConsultarDetalleDescuentoResponse = WithPayload<'descuentoStock', DescuentoDetalleCompleto >;