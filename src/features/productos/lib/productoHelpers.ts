export type ControlType = 'ninguno' | 'stock' | 'stockDiario';

// controlarStock y controlarStockDiario son mutuamente excluyentes —
// el formulario los representa como una sola opción de 3 estados.
export function controlTypeToFlags(controlType: ControlType): {
  controlarStock: 0 | 1;
  controlarStockDiario: 0 | 1;
} {
  return {
    controlarStock: controlType === 'stock' ? 1 : 0,
    controlarStockDiario: controlType === 'stockDiario' ? 1 : 0,
  };
}

export function flagsToControlType(
  controlarStock: number | undefined,
  controlarStockDiario: number | undefined,
): ControlType {
  if (controlarStock) return 'stock';
  if (controlarStockDiario) return 'stockDiario';
  return 'ninguno';
}

// cantidad/precio vienen como texto del formulario — se calcula el
// precio por unidad automáticamente (ej. 3 unidades x Q1 = Q0.3333/u),
// en vez de pedirle al admin que lo calcule a mano.
export function computePrecioPorUnidad(cantidad: string, precio: string): number {
  const cantidadNum = Number(cantidad);
  const precioNum = Number(precio);
  if (!cantidadNum || !precioNum) return 0;
  return Number((precioNum / cantidadNum).toFixed(4));
}
