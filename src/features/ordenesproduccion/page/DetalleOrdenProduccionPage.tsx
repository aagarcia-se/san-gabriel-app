import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Croissant, Package } from 'lucide-react';
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

function EstadoBadge({ estado }: { estado: EstadoOrdenProduccion }) {
  return estado === 'P' ? (
    <Badge variant="warning">Pendiente</Badge>
  ) : (
    <Badge variant="success">Completada</Badge>
  );
}

function CantidadProducto({ producto }: { producto: DetalleOrdenProducto }) {
  if (producto.tipoProduccion === 'bandejas') {
    return (
      <span>
        {producto.cantidadBandejas} bandejas · {producto.cantidadUnidades} unidades
      </span>
    );
  }
  return <span>{producto.cantidadHarina} Lb de harina</span>;
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
    return agruparConsumoPorProducto(consumo);
  }, [consumo]);

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

          {/* Productos a producir */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-ink/80">Productos</h2>

            {/* Móvil: tarjetas */}
            <div className="space-y-2 md:hidden">
              {detalle.detalleOrden.map((producto) => (
                <div key={producto.idDetalleOrdenProduccion} className="card">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
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
                    <CantidadProducto producto={producto} />
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: tabla */}
            <div className="hidden overflow-hidden rounded-2xl border border-line md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-2 text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Producto</th>
                    <th className="px-4 py-3 font-medium">Categoría</th>
                    <th className="px-4 py-3 font-medium">Tipo</th>
                    <th className="px-4 py-3 font-medium">Cantidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-surface">
                  {detalle.detalleOrden.map((producto) => (
                    <tr key={producto.idDetalleOrdenProduccion} className="hover:bg-surface-2">
                      <td className="px-4 py-3 font-medium text-ink">{producto.nombreProducto}</td>
                      <td className="px-4 py-3 text-muted">{producto.nombreCategoria}</td>
                      <td className="px-4 py-3 capitalize text-muted">{producto.tipoProduccion}</td>
                      <td className="px-4 py-3 text-muted">
                        <CantidadProducto producto={producto} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Consumo de ingredientes */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-ink/80">Consumo de ingredientes</h2>

            {isErrorConsumo && (
              <ErrorState message={errorConsumo?.message} onRetry={() => refetchConsumo()} />
            )}

            {!isLoadingConsumo && !isErrorConsumo && productosConsumo.length === 0 && (
              <EmptyState
                title="Sin consumo registrado"
                description="Esta orden todavía no tiene ingredientes consumidos registrados."
              />
            )}

            {!isLoadingConsumo && !isErrorConsumo && productosConsumo.length > 0 && (
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
          </div>
        </>
      )}
    </div>
  );
}