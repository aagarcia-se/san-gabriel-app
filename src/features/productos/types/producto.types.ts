import type { WithPayload } from '@/shared/api/apiEnvelope';

// Coincide con el SELECT de consultarProductosDao — OJO: no trae precio,
// ni controlarStock/controlarStockDiario/controlarInventario/tipoProduccion.
// Para eso hay que cruzar con consultarPrecios (ver precio.types.ts).
export interface Producto {
  idProducto: number;
  nombreProducto: string;
  idCategoria: number;
  estado: 'A' | 'N';
}

// GET /consultarProductos responde:
// { status, message, productos: [...] }
export type ConsultarProductosResponse = WithPayload<'productos', Producto[]>;

export type TipoProduccion = 'harina' | 'bandejas';

// POST /ingresarProducto — fechaCreacion se genera en el navegador
// (dayjs), igual que en los demás módulos. unidadesPorBandeja solo se
// manda cuando tipoProduccion === 'bandejas' (el backend la enruta a
// ordenesprodconfig, no vive en la tabla productos).
export interface IngresarProductoRequest {
  nombreProducto: string;
  idCategoria: number;
  controlarStock: 0 | 1;
  controlarStockDiario: 0 | 1;
  controlarInventario: 0 | 1;
  tipoProduccion: TipoProduccion;
  fechaCreacion: string;
  unidadesPorBandeja?: number;
}
export type IngresarProductoResponse = WithPayload<'idProducto', number>;

// PUT /actualizarProducto/ — oldCategoria es la categoría ANTES de
// editar: el backend la usa para saber si hay que limpiar la config de
// bandejas cuando el producto deja de estar en la categoría 1.
export interface ActualizarProductoRequest {
  idProducto: number;
  nombreProducto: string;
  idCategoria: number;
  oldCategoria: number;
  controlarStock: 0 | 1;
  controlarStockDiario: 0 | 1;
  controlarInventario: 0 | 1;
  tipoProduccion: TipoProduccion;
  unidadesPorBandeja?: number;
}
// La key se llama "precioActualizado" en el controller real aunque es
// el producto lo que se actualiza — así quedó del lado del backend.
export type ActualizarProductoResponse = WithPayload<'precioActualizado', number>;
