import type {
  DetalleOrdenProducto,
  IngredienteConsumido,
  OrdenProduccionDetalle,
} from '../types/ordenesProduccion.types';

export interface ProductoConsumo {
  producto: string;
  ingredientes: IngredienteConsumido[];
}

// Ajusta esta comparación si el nombre del ingrediente de harina en tu
// catálogo no es exactamente "Harina" (p. ej. "Harina blanca").
export function esIngredienteHarina(nombreIngrediente: string): boolean {
  return nombreIngrediente.trim().toLowerCase() === 'harina';
}

function agruparConsumoPorProducto(lineas: IngredienteConsumido[]): ProductoConsumo[] {
  const mapa = new Map<string, ProductoConsumo>();
  for (const linea of lineas) {
    const existente = mapa.get(linea.Producto);
    if (existente) {
      existente.ingredientes.push(linea);
    } else {
      mapa.set(linea.Producto, { producto: linea.Producto, ingredientes: [linea] });
    }
  }
  return Array.from(mapa.values()).sort((a, b) => a.producto.localeCompare(b.producto));
}

export interface OrdenProduccionViewModel {
  productosBandejas: DetalleOrdenProducto[];
  productosHarina: DetalleOrdenProducto[];
  harinaPorProductoBandeja: Map<string, number>;
  sumaBandejas: number;
  sumaHarina: number;
  totalHarina: number;
  hayResumenHarina: boolean;
  productosConsumo: ProductoConsumo[];
  hayOtrosIngredientes: boolean;
}

// Única fuente de verdad para derivar todo lo que la página de detalle y
// el PDF necesitan mostrar — así ambos siempre coinciden en los números.
export function buildOrdenProduccionViewModel(
  detalle: OrdenProduccionDetalle,
  consumo: IngredienteConsumido[],
): OrdenProduccionViewModel {
  const productosBandejas = detalle.detalleOrden.filter((p) => p.tipoProduccion === 'bandejas');
  const productosHarina = detalle.detalleOrden.filter((p) => p.tipoProduccion === 'harina');

  const harinaPorProductoBandeja = new Map<string, number>();
  for (const linea of consumo) {
    if (!esIngredienteHarina(linea.Ingrediente)) continue;
    harinaPorProductoBandeja.set(
      linea.Producto,
      (harinaPorProductoBandeja.get(linea.Producto) ?? 0) + linea.CantidadUsada,
    );
  }

  const sumaBandejas = consumo
    .filter((linea) => esIngredienteHarina(linea.Ingrediente))
    .reduce((acc, linea) => acc + linea.CantidadUsada, 0);

  const sumaHarina = productosHarina.reduce((acc, p) => acc + p.cantidadHarina, 0);

  const sinHarina = consumo.filter((linea) => !esIngredienteHarina(linea.Ingrediente));
  const productosConsumo = agruparConsumoPorProducto(sinHarina);

  return {
    productosBandejas,
    productosHarina,
    harinaPorProductoBandeja,
    sumaBandejas,
    sumaHarina,
    totalHarina: sumaBandejas + sumaHarina,
    hayResumenHarina: sumaBandejas > 0 || sumaHarina > 0,
    productosConsumo,
    hayOtrosIngredientes: productosConsumo.length > 0,
  };
}