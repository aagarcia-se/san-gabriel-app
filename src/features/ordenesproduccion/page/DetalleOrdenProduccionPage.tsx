import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Boxes, Croissant, Package, Wheat } from 'lucide-react';
import { useDetalleOrdenProduccion } from '../api/useDetalleOrdenProduccion';
import { useConsumoIngredientes } from '../api/useConsumoIngredientes';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Badge } from '@/shared/ui/Badge';
import type {
  DetalleOrdenProducto,
  EstadoOrdenProduccion,
  IngredienteConsumido,
} from '../types/ordenesProduccion.types';

interface ProductoConsumo {
  producto: string;
  ingredientes: IngredienteConsumido[];
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

// Ajusta esta comparación si el nombre del ingrediente de harina en tu catálogo
// no es exactamente "Harina" (p. ej. "Harina blanca").
function esIngredienteHarina(nombreIngrediente: string): boolean {
  return nombreIngrediente.trim().toLowerCase() === 'harina';
}

function EstadoBadge({ estado }: { estado: EstadoOrdenProduccion }) {
  return estado === 'P' ? (
    <Badge variant="warning">Pendiente</Badge>
  ) : (
    <Badge variant="success">Completada</Badge>
  );
}

function ResumenHarina({
  sumaBandejas,
  sumaHarina,
}: {
  sumaBandejas: number;
  sumaHarina: number;
}) {
  const total = sumaBandejas + sumaHarina;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="card space-y-1 text-center">
          <p className="text-xs font-medium text-muted">Productos solicitados por bandejas</p>
          <p className="text-lg font-semibold text-ink">{sumaBandejas} Lb</p>
        </div>
        <div className="card space-y-1 text-center">
          <p className="text-xs font-medium text-muted">Productos solicitados por harina</p>
          <p className="text-lg font-semibold text-ink">{sumaHarina} Lb</p>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-line pt-3">
        <p className="text-sm font-semibold text-ink">Total general de harina</p>
        <p className="text-lg font-semibold text-brand-600 dark:text-brand-400">{total} Lb</p>
      </div>
    </div>
  );
}

// Estilo de acento por tipo de producción: bandejas usa el color de marca,
// harina usa ámbar para que la diferencia se note de un vistazo, sin
// depender solo del texto.
const ACENTOS = {
  bandejas: {
    icono: Boxes,
    iconoBg: 'bg-brand-500/10',
    iconoText: 'text-brand-600 dark:text-brand-400',
    tira: 'bg-brand-500',
  },
  harina: {
    icono: Wheat,
    iconoBg: 'bg-amber-500/10',
    iconoText: 'text-amber-600 dark:text-amber-400',
    tira: 'bg-amber-500',
  },
} as const;

function SeccionProductosPorTipo({
  titulo,
  tipo,
  productos,
  harinaPorProducto,
}: {
  titulo: string;
  tipo: keyof typeof ACENTOS;
  productos: DetalleOrdenProducto[];
  /** Solo aplica a 'bandejas': Lb de harina consumida por nombre de producto. */
  harinaPorProducto?: Map<string, number>;
}) {
  const acento = ACENTOS[tipo];
  const IconoTipo = acento.icono;

  if (productos.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${acento.iconoBg} ${acento.iconoText}`}
        >
          <IconoTipo className="h-3.5 w-3.5" />
        </div>
        <h3 className="text-sm font-medium text-ink">{titulo}</h3>
        <span className="text-xs text-muted">
          {productos.length} {productos.length === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      {/* Móvil: tarjetas, con una tira de color a la izquierda que marca el tipo */}
      <div className="space-y-2 md:hidden">
        {productos.map((producto) => {
          const harinaUsada = harinaPorProducto?.get(producto.nombreProducto);
          return (
            <div
              key={producto.idDetalleOrdenProduccion}
              className="card relative overflow-hidden pl-4"
            >
              <span className={`absolute inset-y-0 left-0 w-1 ${acento.tira}`} aria-hidden />
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink/70">
                  <Croissant className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {producto.nombreProducto}
                  </p>
                  <p className="truncate text-xs text-muted">{producto.nombreCategoria}</p>
                </div>
              </div>
              <div className="mt-2 border-t border-line pt-2 text-xs text-muted">
                {tipo === 'bandejas' ? (
                  <span>
                    {producto.cantidadBandejas} bandejas · {producto.cantidadUnidades} unidades
                    {harinaUsada !== undefined && <> · {harinaUsada} Lb de harina</>}
                  </span>
                ) : (
                  <span>{producto.cantidadHarina} Lb de harina</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: tabla, con columnas propias del tipo en vez de una columna "Cantidad" genérica */}
      <div className="hidden overflow-hidden rounded-2xl border border-line md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-2 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              {tipo === 'bandejas' ? (
                <>
                  <th className="px-4 py-3 font-medium">Bandejas</th>
                  <th className="px-4 py-3 font-medium">Unidades</th>
                  <th className="px-4 py-3 font-medium">Harina (Lb)</th>
                </>
              ) : (
                <th className="px-4 py-3 font-medium">Harina (Lb)</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-surface">
            {productos.map((producto) => (
              <tr key={producto.idDetalleOrdenProduccion} className="hover:bg-surface-2">
                <td className="px-4 py-3 font-medium text-ink">{producto.nombreProducto}</td>
                <td className="px-4 py-3 text-muted">{producto.nombreCategoria}</td>
                {tipo === 'bandejas' ? (
                  <>
                    <td className="px-4 py-3 text-muted">{producto.cantidadBandejas}</td>
                    <td className="px-4 py-3 text-muted">{producto.cantidadUnidades}</td>
                    <td className="px-4 py-3 text-muted">
                      {harinaPorProducto?.get(producto.nombreProducto) ?? '—'}
                    </td>
                  </>
                ) : (
                  <td className="px-4 py-3 text-muted">{producto.cantidadHarina}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DetalleOrdenProduccionPage() {
  const { idOrdenProduccion: idParam } = useParams<{ idOrdenProduccion: string }>();
  const idOrdenProduccion = Number(idParam);

  const {
    data: detalle,
    isLoading: isLoadingDetalle,
    isError: isErrorDetalle,
    error: errorDetalle,
    refetch: refetchDetalle,
  } = useDetalleOrdenProduccion(idOrdenProduccion);

  const {
    data: consumo,
    isLoading: isLoadingConsumo,
    isError: isErrorConsumo,
    error: errorConsumo,
    refetch: refetchConsumo,
  } = useConsumoIngredientes(idOrdenProduccion);

  const productosConsumo = useMemo(() => {
    if (!consumo) return [];
    // La harina se muestra aparte, resumida en ResumenHarina — no repetida
    // dentro del desglose de ingredientes de cada producto.
    const sinHarina = consumo.filter((linea) => !esIngredienteHarina(linea.Ingrediente));
    return agruparConsumoPorProducto(sinHarina);
  }, [consumo]);

  const resumenHarina = useMemo(() => {
    if (!detalle) return null;
    // Bandejas: la harina consumida está en el payload de consumo de ingredientes
    // (esa consulta solo trae productos por bandeja).
    const sumaBandejas = (consumo ?? [])
      .filter((linea) => esIngredienteHarina(linea.Ingrediente))
      .reduce((acc, linea) => acc + linea.CantidadUsada, 0);
    // Harina: esos productos no aparecen en el consumo de ingredientes —
    // la cantidad solicitada ya viene directo en cantidadHarina del detalle de la orden.
    const sumaHarina = detalle.detalleOrden
      .filter((p) => p.tipoProduccion === 'harina')
      .reduce((acc, p) => acc + p.cantidadHarina, 0);
    return { sumaBandejas, sumaHarina };
  }, [consumo, detalle]);

  // Harina consumida por cada producto de bandeja individual, para mostrarla
  // en su propia fila/tarjeta (viene del mismo payload de consumo de ingredientes).
  const harinaPorProductoBandeja = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const linea of consumo ?? []) {
      if (!esIngredienteHarina(linea.Ingrediente)) continue;
      mapa.set(linea.Producto, (mapa.get(linea.Producto) ?? 0) + linea.CantidadUsada);
    }
    return mapa;
  }, [consumo]);

  const { productosBandejas, productosHarina } = useMemo(() => {
    if (!detalle) return { productosBandejas: [], productosHarina: [] };
    return {
      productosBandejas: detalle.detalleOrden.filter((p) => p.tipoProduccion === 'bandejas'),
      productosHarina: detalle.detalleOrden.filter((p) => p.tipoProduccion === 'harina'),
    };
  }, [detalle]);

  const isLoading = isLoadingDetalle || isLoadingConsumo;

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Orden #${idParam}`}
        description={
          detalle
            ? `${detalle.encabezadoOrden.nombreSucursal} · Turno ${detalle.encabezadoOrden.ordenTurno}`
            : undefined
        }
        backTo="/ordenes-produccion"
      />

      {isLoading && <Spinner label="Cargando orden…" />}

      {isErrorDetalle && (
        <ErrorState message={errorDetalle?.message} onRetry={() => refetchDetalle()} />
      )}

      {!isLoadingDetalle && !isErrorDetalle && !detalle && (
        <EmptyState
          title="Orden no encontrada"
          description="Puede que ya no exista, o el enlace esté roto."
        />
      )}

      {detalle && (
        <>
          {/* Encabezado de la orden */}
          <div className="card space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink">
                  {detalle.encabezadoOrden.nombreSucursal}
                </p>
                <p className="text-xs text-muted">
                  Panadero: {detalle.encabezadoOrden.nombrePanadero}
                </p>
              </div>
              <EstadoBadge estado={detalle.encabezadoOrden.estadoOrden} />
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-line pt-3 text-xs sm:grid-cols-4">
              <div>
                <p className="text-muted">Turno</p>
                <p className="text-ink">{detalle.encabezadoOrden.ordenTurno}</p>
              </div>
              <div>
                <p className="text-muted">Fecha a producir</p>
                <p className="text-ink">{detalle.encabezadoOrden.fechaAProducir}</p>
              </div>
              <div>
                <p className="text-muted">Creada por</p>
                <p className="text-ink">{detalle.encabezadoOrden.nombreUsuario.trim()}</p>
              </div>
              <div>
                <p className="text-muted">Fecha de cierre</p>
                <p className="text-ink">{detalle.encabezadoOrden.fechaCierre ?? 'Sin cerrar'}</p>
              </div>
            </div>
          </div>

          {/* Productos a producir, separados por tipo de producción */}
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-ink/80">Productos</h2>
            <SeccionProductosPorTipo
              titulo="Por bandejas"
              tipo="bandejas"
              productos={productosBandejas}
              harinaPorProducto={harinaPorProductoBandeja}
            />
            <SeccionProductosPorTipo titulo="Por harina" tipo="harina" productos={productosHarina} />
          </div>

          {/* Consumo de ingredientes */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-ink/80">Consumo de ingredientes</h2>

            {isErrorConsumo && (
              <ErrorState message={errorConsumo?.message} onRetry={() => refetchConsumo()} />
            )}

            {!isLoadingConsumo && !isErrorConsumo && (() => {
              const hayHarina =
                !!resumenHarina && (resumenHarina.sumaBandejas > 0 || resumenHarina.sumaHarina > 0);
              const hayOtrosIngredientes = productosConsumo.length > 0;

              if (!hayHarina && !hayOtrosIngredientes) {
                return (
                  <EmptyState
                    title="Sin consumo registrado"
                    description="Esta orden todavía no tiene ingredientes consumidos registrados."
                  />
                );
              }

              return (
                <>
                  {hayHarina && resumenHarina && (
                    <ResumenHarina
                      sumaBandejas={resumenHarina.sumaBandejas}
                      sumaHarina={resumenHarina.sumaHarina}
                    />
                  )}

                  {hayOtrosIngredientes && (
                    <div className="grid items-start gap-3 md:grid-cols-2">
                      {productosConsumo.map((producto) => (
                        <div key={producto.producto} className="card space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
                              <Package className="h-5 w-5" />
                            </div>
                            <p className="truncate text-sm font-medium text-ink">{producto.producto}</p>
                          </div>

                          <div className="divide-y divide-line border-t border-line">
                            {producto.ingredientes.map((ingrediente) => (
                              <div
                                key={`${ingrediente.Producto}-${ingrediente.Ingrediente}`}
                                className="flex items-center justify-between gap-3 py-2 first:pt-3"
                              >
                                <p className="text-sm text-ink">{ingrediente.Ingrediente}</p>
                                <p className="text-sm text-muted">
                                  {ingrediente.CantidadUsada} {ingrediente.UnidadMedida}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
}