import type { WithPayload } from '@/shared/api/apiEnvelope';

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
}

export type ConsultarStockGeneralResponse = WithPayload<'stockProductos', StockGeneralItem[]>;