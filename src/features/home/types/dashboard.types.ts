import type { WithPayload } from '@/shared/api/apiEnvelope';

export interface IngresoPorSucursalMensual {
  idSucursal: number;
  nombreSucursal: string;
  ingresoMensual: number;
}

export interface IngresoPorSucursalAnual {
  idSucursal: number;
  nombreSucursal: string;
  ingresoAnual: number;
}

export interface ResumenMensualItem {
  mes: string;
  total_ingresos: number;
}

export interface ProductoMasVendido {
  idProducto: number;
  nombreProducto: string;
  cantidad_total_vendida: number;
}

export interface DataDashboard {
  cantidadEmpleados: number;
  cantidadSucursales: number;
  ingresosMensuales: IngresoPorSucursalMensual[];
  ingresosAnuales: IngresoPorSucursalAnual[];
  resumenMensual: ResumenMensualItem[];
  topProductosMasVendidos: ProductoMasVendido[];
}

export type ConsultarDataDashboardResponse = WithPayload<'dataDashboard', DataDashboard>;