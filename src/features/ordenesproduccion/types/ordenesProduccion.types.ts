import type { WithPayload } from '@/shared/api/apiEnvelope';

export type EstadoOrdenProduccion = 'P' | 'C'; // P = Pendiente, C = Completada — confirmar valores reales
export type TurnoProduccion = 'AM' | 'PM';

export interface OrdenProduccionListItem {
  idOrdenProduccion: number;
  idSucursal: number;
  ordenTurno: TurnoProduccion;
  nombreSucursal: string;
  nombrePanadero: string;
  fechaAProducir: string;
  estadoOrden: EstadoOrdenProduccion;
}

export type ConsultarOrdenesProduccionResponse = WithPayload<'ordenesProduccion',OrdenProduccionListItem[]>;

// --- Detalle: consumo de ingredientes ---
export interface IngredienteConsumido {
  OrdenID: number;
  FechaProduccion: string;
  Producto: string;
  CantidadProducida: number;
  Ingrediente: string;
  CantidadUsada: number;
  UnidadMedida: string;
  FechaConsumo: string;
}

export type ConsultarConsumoIngredientesResponse = WithPayload<'IngredientesConsumidos',IngredienteConsumido[]>;

// --- Ingreso de orden por batch (CSV + encabezado) ---
// El backend recibe multipart/form-data: un archivo binario bajo la
// clave "ordenProduccionBatch" y este objeto stringificado bajo la
// clave "ordenHaader" (el nombre respeta el typo real del backend,
// que hace JSON.parse(req.body.ordenHaader) — corregirlo aquí rompería
// la lectura del lado del servidor).
export interface OrdenProduccionHeader {
  idSucursal: string;
  ordenTurno: TurnoProduccion;
  nombrePanadero: string;
  fechaAProducir: string;
  idUsuario: number;
  fechaCreacion: string;
}

export type IngresarOrdenProduccionBatchResponse = WithPayload<'idOrdenProduccion', number>;

// --- Detalle de la orden: encabezado + productos ---
export interface OrdenProduccionEncabezado {
    idOrdenProduccion: number;
    idSucursal: number;
    nombreSucursal: string;
    ordenTurno: TurnoProduccion;
    nombrePanadero: string;
    fechaAProducir: string;
    idUsuario: number;
    nombreUsuario: string;
    fechaCierre: string | null;
    fechaCreacion: string;
    estadoOrden: EstadoOrdenProduccion;
  }
  
  export type TipoProduccionDetalle = 'bandejas' | 'harina';
  
  export interface DetalleOrdenProducto {
    idDetalleOrdenProduccion: number;
    idOrdenProduccion: number;
    idProducto: number;
    nombreProducto: string;
    idCategoria: number;
    nombreCategoria: string;
    tipoProduccion: TipoProduccionDetalle;
    cantidadBandejas: number;
    cantidadUnidades: number;
    cantidadHarina: number;
    fechaCreacion: string;
  }
  
  export interface OrdenProduccionDetalle {
    encabezadoOrden: OrdenProduccionEncabezado;
    detalleOrden: DetalleOrdenProducto[];
  }
  
  export type ConsultarDetalleOrdenesProduccionResponse = WithPayload<'detalleOrden',OrdenProduccionDetalle>;

  // --- Eliminar orden ---
// La respuesta no trae ningún payload adicional, solo status/message.
export interface EliminarOrdenProduccionResponse {
    status: number;
    message: string;
  }