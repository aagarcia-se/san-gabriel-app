import { useParams } from 'react-router-dom';
import { Coins, Receipt, ShoppingBag } from 'lucide-react';

import { useVentaDetalle } from '../api/useVentas';

import { PageHeader } from '@/shared/ui/PageHeader';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Badge } from '@/shared/ui/Badge';

import type { EstadoVenta } from '../types/ventas.types';

function formatoMoneda(valor: number) {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(valor);
}

function EstadoVentaBadge({ estado }: { estado: EstadoVenta }) {
  return estado === 'P' ? (
    <Badge variant="warning">Pendiente</Badge>
  ) : (
    <Badge variant="success">Completada</Badge>
  );
}

export function VentaDetallePage() {
  const { idSucursal: idSucursalParam, idVenta: idVentaParam } = useParams<{
    idSucursal: string;
    idVenta: string;
  }>();
  const idSucursal = Number(idSucursalParam);
  const idVenta = Number(idVentaParam);

  const { data: venta, isLoading, isError, error, refetch } = useVentaDetalle(idVenta);

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Venta #${idVentaParam}`}
        description={
          venta
            ? `${venta.encabezadoVenta.nombreSucursal} · Turno ${venta.encabezadoVenta.ventaTurno}`
            : undefined
        }
        backTo={`/ventas/${idSucursal}`}
      />

      {isLoading && <Spinner label="Cargando venta…" />}

      {isError && <ErrorState message={error?.message} onRetry={() => refetch()} />}

      {!isLoading && !isError && !venta && (
        <EmptyState
          title="Venta no encontrada"
          description="Puede que ya no exista, o el enlace esté roto."
        />
      )}

      {venta && (
        <>
          {/* Encabezado */}
          <div className="card space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink">
                  {venta.encabezadoVenta.nombreSucursal}
                </p>
                <p className="text-xs text-muted">
                  Vendedor: {venta.encabezadoVenta.nombreUsuario}
                </p>
              </div>
              <EstadoVentaBadge estado={venta.encabezadoVenta.estadoVenta} />
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-line pt-3 text-xs sm:grid-cols-4">
              <div>
                <p className="text-muted">Turno</p>
                <p className="text-ink">{venta.encabezadoVenta.ventaTurno}</p>
              </div>
              <div>
                <p className="text-muted">Fecha</p>
                <p className="text-ink">{venta.encabezadoVenta.fechaVenta}</p>
              </div>
              <div>
                <p className="text-muted">Usuario</p>
                <p className="text-ink">{venta.encabezadoVenta.usuario}</p>
              </div>
              <div>
                <p className="text-muted">Total venta</p>
                <p className="font-semibold text-ink">
                  {formatoMoneda(venta.encabezadoVenta.totalVenta)}
                </p>
              </div>
            </div>
          </div>

          {/* Productos vendidos */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <ShoppingBag className="h-3.5 w-3.5" />
              </div>
              <h2 className="text-sm font-medium text-ink">Productos vendidos</h2>
              <span className="text-xs text-muted">
                {venta.detalleVenta.length}{' '}
                {venta.detalleVenta.length === 1 ? 'producto' : 'productos'}
              </span>
            </div>

            {venta.detalleVenta.length === 0 ? (
              <EmptyState
                title="Sin productos"
                description="Esta venta no tiene productos registrados."
              />
            ) : (
              <>
                {/* Móvil: tarjetas */}
                <div className="space-y-2 md:hidden">
                  {venta.detalleVenta.map((producto) => (
                    <div key={producto.idDetalleVenta} className="card">
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                          {producto.nombreProducto}
                        </p>
                        <p className="shrink-0 text-sm font-semibold text-ink">
                          {formatoMoneda(producto.subtotal)}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center justify-between border-t border-line pt-2 text-xs text-muted">
                        <span>
                          {producto.cantidadVendida} × {formatoMoneda(producto.precioUnitario)}
                        </span>
                        {producto.descuento > 0 && (
                          <span className="text-danger-600 dark:text-danger-400">
                            -{formatoMoneda(producto.descuento)} desc.
                          </span>
                        )}
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
                        <th className="px-4 py-3 font-medium text-right">Cantidad</th>
                        <th className="px-4 py-3 font-medium text-right">Precio unitario</th>
                        <th className="px-4 py-3 font-medium text-right">Descuento</th>
                        <th className="px-4 py-3 font-medium text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line bg-surface">
                      {venta.detalleVenta.map((producto) => (
                        <tr key={producto.idDetalleVenta} className="hover:bg-surface-2">
                          <td className="px-4 py-3 font-medium text-ink">
                            {producto.nombreProducto}
                          </td>
                          <td className="px-4 py-3 text-right text-muted">
                            {producto.cantidadVendida}
                          </td>
                          <td className="px-4 py-3 text-right text-muted">
                            {formatoMoneda(producto.precioUnitario)}
                          </td>
                          <td className="px-4 py-3 text-right text-muted">
                            {producto.descuento > 0
                              ? formatoMoneda(producto.descuento)
                              : '—'}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-ink">
                            {formatoMoneda(producto.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-line bg-surface-2">
                        <td colSpan={4} className="px-4 py-3 text-right font-semibold text-ink">
                          Total
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-ink">
                          {formatoMoneda(venta.encabezadoVenta.totalVenta)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Resumen de caja (ingresos) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <Coins className="h-3.5 w-3.5" />
              </div>
              <h2 className="text-sm font-medium text-ink">Resumen de caja</h2>
            </div>

            <div className="card space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted">Ingresado</p>
                  <p className="font-semibold text-ink">
                    {formatoMoneda(venta.detalleIngresos.montoTotalIngresado)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">Gastos del turno</p>
                  <p className="font-semibold text-ink">
                    {formatoMoneda(venta.detalleIngresos.montoTotalGastos)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">Esperado</p>
                  <p className="font-semibold text-ink">
                    {formatoMoneda(venta.detalleIngresos.montoEsperado)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-line pt-3">
                <p className="text-sm font-semibold text-ink">Diferencia</p>
                <Badge variant={venta.detalleIngresos.diferencia < 0 ? 'danger' : 'success'}>
                  {venta.detalleIngresos.diferencia < 0 ? 'Faltante ' : 'Sobrante '}
                  {formatoMoneda(Math.abs(venta.detalleIngresos.diferencia))}
                </Badge>
              </div>
            </div>
          </div>

          {/* Gastos del turno */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-danger-500/10 text-danger-600 dark:text-danger-400">
                <Receipt className="h-3.5 w-3.5" />
              </div>
              <h2 className="text-sm font-medium text-ink">Gastos del turno</h2>
              {venta.detalleGastos.length > 0 && (
                <span className="text-xs text-muted">
                  {venta.detalleGastos.length}{' '}
                  {venta.detalleGastos.length === 1 ? 'gasto' : 'gastos'}
                </span>
              )}
            </div>

            {venta.detalleGastos.length === 0 ? (
              <EmptyState
                title="Sin gastos registrados"
                description="No se registraron gastos durante este turno."
              />
            ) : (
              <div className="space-y-2">
                {venta.detalleGastos.map((gasto) => (
                  <div
                    key={gasto.idGasto}
                    className="card flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{gasto.concepto}</p>
                      <p className="text-xs text-muted">{gasto.fechaGasto}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-danger-600 dark:text-danger-400">
                      -{formatoMoneda(gasto.monto)}
                    </p>
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