import type { WithPayload } from '@/shared/api/apiEnvelope';

// POST /ingresarPrecio y PUT /actualizarPrecio/ — cantidad y precio van
// como string (así lo espera el backend, según el payload de ejemplo);
// precioPorUnidad va como number. fechaFin puede ser null (precio
// vigente sin fecha de cierre).
export interface PrecioRequest {
  idProducto: number;
  cantidad: string;
  precio: string;
  precioPorUnidad: number;
  fechaInicio: string;
  fechaFin: string | null;
}

export type IngresarPrecioResponse = WithPayload<'idPrecio', number>;
export type ActualizarPrecioResponse = WithPayload<'precioActualizado', number>;

// Coincide con el JOIN de consultarPreciosProductosDao — solo trae
// productos activos ("estado = 'A'"). Se usa para mostrar/precargar el
// precio actual de un producto, ya que consultarProductos no lo trae.
export interface PrecioProducto {
  idProducto: number;
  nombreProducto: string;
  controlarStock: 0 | 1;
  controlarStockDiario: 0 | 1;
  controlarInventario: 0 | 1;
  tipoProduccion: string;
  unidadesPorBandeja: number | null;
  idCategoria: number;
  nombreCategoria: string;
  cantidad: number;
  idPrecio: number;
  precio: number;
  precioPorUnidad: number;
  fechaInicio: string;
  fechaFin: string | null;
}

// GET /consultarPrecios responde:
// { status, message, preciosProductos: [...] }
export type ConsultarPreciosResponse = WithPayload<'preciosProductos', PrecioProducto[]>;

// GET /productos-con-precios — MISMO JOIN y MISMO filtro (estado='A')
// que consultarPrecios, solo que expone la key como "productos". Es la
// fuente ÚNICA que usa la sección de Productos por ahora (lista, crear,
// editar) — un solo viaje, ya trae producto + categoría + precio +
// config de stock juntos. No incluye "estado" en el SELECT porque el
// filtro ya garantiza que siempre es 'A'.
export type ProductoConPrecio = PrecioProducto;
export type ConsultarProductosConPreciosResponse = WithPayload<'productos', ProductoConPrecio[]>;
