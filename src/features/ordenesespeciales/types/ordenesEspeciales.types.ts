import type { WithPayload } from '@/shared/api/apiEnvelope';

export type EstadoOrdenEspecial = 'A' | 'C'; // confirmar valores reales — solo vi 'A' en el ejemplo

export interface OrdenEspecialListItem {
  idOrdenEspecial: number;
  idSucursal: number;
  sucursalEntrega: string;
  nombreCliente: string;
  telefonoCliente: string;
  fechaEntrega: string;
  fechaAProducir: string;
  idUsuario: number;
  ordenIngresadaPor: string;
  estado: EstadoOrdenEspecial;
}

export type ConsultarOrdenesEspecialesResponse = WithPayload<'ordenesEspeciales', OrdenEspecialListItem[]>;

// --- Crear ---
export interface OrdenEspecialDetalleCrear {
  idProducto: number;
  cantidadUnidades: number;
  nombreProducto: string;
  fechaCreacion: string;
}

export interface OrdenEspecialEncabezadoCrear {
  idSucursal: number;
  nombreSucursal: string;
  idUsuario: number;
  nombreUsuario: string;
  nombreCliente: string;
  telefonoCliente: string;
  fechaEntrega: string;
  fechaAProducir: string;
  fechaCreacion: string;
}

export interface IngresarOrdenEspecialRequest {
  ordenDetalle: OrdenEspecialDetalleCrear[];
  ordenEncabezado: OrdenEspecialEncabezadoCrear;
}

export interface IngresarOrdenEspecialResult {
  idOrdenGenerada: number;
  idDetellaOrdenEspecial: number[]; // typo respeta el backend real
}

export type IngresarOrdenEspecialResponse = WithPayload<'ordenEspecial', IngresarOrdenEspecialResult>;

// --- Actualizar ---
export interface OrdenEspecialDetalleActualizar {
  idDetalleOrdenEspecial: number;
  idProducto: number;
  cantidadUnidades: number;
  nombreProducto: string;
}

export interface OrdenEspecialEncabezadoActualizar {
  idOrdenEspecial: number;
  nombreCliente: string;
  telefonoCliente: string;
  idSucursal: number;
  fechaEntrega: string;
  fechaAProducir: string;
  idUsuario: number;
}

export interface ActualizarOrdenEspecialRequest {
  ordenDetalle: OrdenEspecialDetalleActualizar[];
  ordenEncabezado: OrdenEspecialEncabezadoActualizar;
}

export interface OrdenEspecialDetalleItem {
  idDetalleOrdenEspecial: number;
  idProducto: number;
  cantidadUnidades: number;
  nombreProducto: string;
  precioUnitario: number;
}

export interface ActualizarOrdenEspecialResult {
  ordenEncabezado: OrdenEspecialEncabezadoActualizar;
  ordenDetalle: OrdenEspecialDetalleItem[];
}

export type ActualizarOrdenEspecialResponse = WithPayload<'ordenEspecial', ActualizarOrdenEspecialResult>;

// --- Eliminar ---
export type EliminarOrdenEspecialResponse = WithPayload<'ordenEspecial', string>;

export interface OrdenEspecialDetalleItemConsulta {
    idDetalleOrdenEspecial: number;
    idOrdenEspecial: number;
    idProducto: number;
    nombreProducto: string;
    cantidadUnidades: number;
    fechaCreacion: string;
  }
  
  export interface OrdenEspecialEncabezadoConsulta {
    idOrdenEspecial: number;
    idSucursal: number;
    sucursalEntrega: string;
    nombreCliente: string;
    telefonoCliente: string;
    fechaEntrega: string;
    fechaAProducir: string;
    idUsuario: number;
    ordenIngresadaPor: string;
    estado: EstadoOrdenEspecial;
  }
  
  export interface ConsultarOrdenEspecialDetalle {
    ordenEncabezado: OrdenEspecialEncabezadoConsulta;
    ordenDetalle: OrdenEspecialDetalleItemConsulta[];
  }
  
  export type ConsultarOrdenEspecialResponse = WithPayload<'ordenEspecial', ConsultarOrdenEspecialDetalle>;