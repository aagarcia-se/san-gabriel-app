import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { ArrowDownCircle, ArrowRightLeft, Boxes } from 'lucide-react';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Badge } from '@/shared/ui/Badge';
import { cn } from '@/shared/lib/cn';
import { useDetalleDescuento, useDetalleTraslado } from '../api/useStockGeneral';

/** Línea de producto normalizada — ambos tipos de movimiento comparten
 *  la misma forma de presentación, solo cambia el nombre del campo de
 *  cantidad en la respuesta del backend. */
interface LineaProducto {
  id: number;
  nombreProducto: string;
  cantidad: number;
}

export function DetalleMovimientoPage() {
  const { idSucursal, tipo, idMovimiento } = useParams<{
    idSucursal: string;
    tipo: string;
    idMovimiento: string;
  }>();

  const id = Number(idMovimiento);
  const esDescuento = tipo === 'descuento';

  // Ambos hooks se montan siempre (los hooks no pueden llamarse
  // condicionalmente), pero solo el que corresponde al tipo dispara
  // su consulta gracias al flag `enabled`.
  const traslado = useDetalleTraslado(id, !esDescuento);
  const descuento = useDetalleDescuento(id, esDescuento);

  const activo = esDescuento ? descuento : traslado;

  const lineas: LineaProducto[] = esDescuento
    ? (descuento.data?.detalleDescuento ?? []).map((d) => ({
        id: d.idDetalleDescuento,
        nombreProducto: d.nombreProducto,
        cantidad: d.unidadesDescontadas,
      }))
    : (traslado.data?.detalle ?? []).map((d) => ({
        id: d.idTrasladoDetalle,
        nombreProducto: d.nombreProducto,
        cantidad: d.cantidadATrasladar,
      }));

  const totalUnidades = lineas.reduce((acc, l) => acc + l.cantidad, 0);

  return (
    <div className="space-y-5 pb-6">
      <PageHeader
        title={esDescuento ? 'Detalle del descuento' : 'Detalle del traslado'}
        description={`Movimiento #${idMovimiento}`}
        backTo={`/inventarios/${idSucursal}/historial`}
      />

      {activo.isLoading && <Spinner label="Cargando movimiento…" />}

      {activo.isError && (
        <ErrorState message={activo.error?.message} onRetry={() => activo.refetch()} />
      )}

      {!activo.isLoading && !activo.isError && !activo.data && (
        <EmptyState
          title="Movimiento no encontrado"
          description="Puede que ya no exista, o el enlace esté roto."
        />
      )}

      {/* =====================================================
          ENCABEZADO
          ===================================================== */}

      {esDescuento && descuento.data && (
        <div className="card space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-danger-500/10 text-danger-600 dark:text-danger-400">
                <ArrowDownCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {descuento.data.encabezadoDescuento.tipoDescuento}
                </p>
                <p className="truncate text-xs text-muted">
                  {descuento.data.encabezadoDescuento.nombreSucursal}
                </p>
              </div>
            </div>
            <Badge variant="danger">Descuento</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-line pt-3 text-xs sm:grid-cols-4">
            <div>
              <p className="text-muted">Turno</p>
              <p className="text-ink">{descuento.data.encabezadoDescuento.descuentoTurno}</p>
            </div>
            <div className="min-w-0">
              <p className="text-muted">Responsable</p>
              <p className="truncate text-ink">
                {descuento.data.encabezadoDescuento.nombreUsuario.trim()}
              </p>
            </div>
            <div>
              <p className="text-muted">Fecha</p>
              <p className="text-ink">
                {dayjs(descuento.data.encabezadoDescuento.fechaDescuento).format(
                  'DD/MM/YYYY HH:mm',
                )}
              </p>
            </div>
            <div>
              <p className="text-muted">Productos</p>
              <p className="text-ink">{lineas.length}</p>
            </div>
          </div>
        </div>
      )}

      {!esDescuento && traslado.data && (
        <div className="card space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <ArrowRightLeft className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {traslado.data.encabezadoTraslado.sucursalOrigen} →{' '}
                  {traslado.data.encabezadoTraslado.sucursalDestino}
                </p>
                <p className="truncate text-xs text-muted">Traslado entre sucursales</p>
              </div>
            </div>
            <Badge variant="brand">Traslado</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-line pt-3 text-xs sm:grid-cols-4">
            <div className="min-w-0">
              <p className="text-muted">Origen</p>
              <p className="truncate text-ink">
                {traslado.data.encabezadoTraslado.sucursalOrigen}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-muted">Destino</p>
              <p className="truncate text-ink">
                {traslado.data.encabezadoTraslado.sucursalDestino}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-muted">Responsable</p>
              <p className="truncate text-ink">
                {traslado.data.encabezadoTraslado.usuarioResponsable.trim()}
              </p>
            </div>
            <div>
              <p className="text-muted">Fecha</p>
              <p className="text-ink">
                {dayjs(traslado.data.encabezadoTraslado.fechaTraslado).format(
                  'DD/MM/YYYY HH:mm',
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          PRODUCTOS
          ===================================================== */}

      {activo.data && (
        <div className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-ink">Productos</h2>
              <p className="mt-0.5 text-xs text-muted">
                {esDescuento
                  ? 'Unidades descontadas por producto.'
                  : 'Unidades trasladadas por producto.'}
              </p>
            </div>

            {lineas.length > 0 && (
              <Badge variant="neutral">
                {totalUnidades} {totalUnidades === 1 ? 'unidad' : 'unidades'}
              </Badge>
            )}
          </div>

          {lineas.length === 0 ? (
            <EmptyState
              title="Sin productos"
              description="Este movimiento no tiene productos asociados."
            />
          ) : (
            <>
              {/* MÓVIL */}
              <div className="space-y-2 md:hidden">
                {lineas.map((linea) => (
                  <div key={linea.id} className="card flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink/70">
                      <Boxes className="h-4 w-4" />
                    </div>
                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                      {linea.nombreProducto}
                    </p>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2.5 py-1 text-sm font-bold',
                        esDescuento
                          ? 'bg-danger-500/10 text-danger-600 dark:text-danger-400'
                          : 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
                      )}
                    >
                      {linea.cantidad}
                    </span>
                  </div>
                ))}
              </div>

              {/* DESKTOP */}
              <div className="hidden overflow-hidden rounded-2xl border border-line md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-2 text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-4 py-3 font-medium">Producto</th>
                      <th className="px-4 py-3 text-right font-medium">
                        {esDescuento ? 'Unidades descontadas' : 'Unidades trasladadas'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line bg-surface">
                    {lineas.map((linea) => (
                      <tr key={linea.id} className="transition-colors hover:bg-surface-2">
                        <td className="px-4 py-3 font-medium text-ink">
                          {linea.nombreProducto}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-ink">
                          {linea.cantidad}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}