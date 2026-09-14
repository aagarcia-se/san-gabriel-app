import { useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, Croissant, MapPin, Pencil, Phone, User } from 'lucide-react';
import { useOrdenEspecialDetalle } from '../api/useOrdenEspecialDetalle';
import { EstadoEntregaBadge } from '../components/EstadoEntregaBadge';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';

export function DetalleOrdenEspecialPage() {
  const { idOrdenEspecial: idParam } = useParams<{
    idOrdenEspecial: string;
  }>();

  const idOrdenEspecial = Number(idParam);
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch } =
    useOrdenEspecialDetalle(idOrdenEspecial);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <PageHeader
          title="Orden especial"
          backTo="/ordenes-especiales"
        />

        {data && (
          <button
            type="button"
            onClick={() =>
              navigate(`/ordenes-especiales/${idOrdenEspecial}/editar`)
            }
            className="btn-primary shrink-0 !px-3 sm:!px-4"
          >
            <Pencil className="h-4 w-4" />
            <span className="hidden sm:inline">Editar</span>
          </button>
        )}
      </div>

      {isLoading && <Spinner label="Cargando…" />}

      {isError && (
        <ErrorState
          message={error?.message}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && !data && (
        <EmptyState
          title="Orden no encontrada"
          description="Puede que ya no exista, o el enlace esté roto."
        />
      )}

      {data && (
        <div className="mx-auto w-full max-w-5xl space-y-5">
          {/* Información principal */}
          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            {/* Cliente */}
            <div className="card">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <User className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">
                    Cliente
                  </p>
                  <h2 className="text-base font-semibold text-ink">
                    {data.ordenEncabezado.nombreCliente}
                  </h2>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2.5">
                  <Phone className="h-4 w-4 shrink-0 text-muted" />

                  <div className="min-w-0">
                    <p className="text-xs text-muted">Teléfono</p>
                    <p className="text-sm font-medium text-ink">
                      {data.ordenEncabezado.telefonoCliente}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2.5">
                  <MapPin className="h-4 w-4 shrink-0 text-muted" />

                  <div className="min-w-0">
                    <p className="text-xs text-muted">Sucursal de entrega</p>
                    <p className="text-sm font-medium text-ink">
                      {data.ordenEncabezado.sucursalEntrega}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Entrega */}
            <div className="card">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <CalendarDays className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted">
                      Entrega
                    </p>
                    <p className="text-base font-semibold text-ink">
                      {data.ordenEncabezado.fechaEntrega}
                    </p>
                  </div>
                </div>

                <EstadoEntregaBadge
                  fechaEntrega={data.ordenEncabezado.fechaEntrega}
                />
              </div>

              <div className="border-t border-line pt-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted">Fecha a producir</p>
                    <p className="mt-0.5 text-sm font-medium text-ink">
                      {data.ordenEncabezado.fechaAProducir}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted">Ingresada por</p>
                    <p className="mt-0.5 text-sm font-medium text-ink">
                      {data.ordenEncabezado.ordenIngresadaPor}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className="card overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-ink">
                  Productos del pedido
                </h2>
                <p className="mt-0.5 text-xs text-muted">
                  {data.ordenDetalle.length}{' '}
                  {data.ordenDetalle.length === 1
                    ? 'producto'
                    : 'productos'}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <Croissant className="h-4 w-4" />
              </div>
            </div>

            {/* Móvil */}
            <div className="space-y-2 p-4 md:hidden">
              {data.ordenDetalle.map((item) => (
                <div
                  key={item.idDetalleOrdenEspecial}
                  className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <Croissant className="h-4 w-4" />
                  </div>

                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                    {item.nombreProducto}
                  </p>

                  <span className="shrink-0 rounded-lg bg-surface px-2.5 py-1 text-xs font-medium text-muted">
                    {item.cantidadUnidades} uds.
                  </span>
                </div>
              ))}
            </div>

            {/* Desktop */}
            <div className="hidden md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-2 text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-5 py-3 font-medium">
                      Producto
                    </th>

                    <th className="w-36 px-5 py-3 text-right font-medium">
                      Cantidad
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-line">
                  {data.ordenDetalle.map((item) => (
                    <tr
                      key={item.idDetalleOrdenEspecial}
                      className="transition-colors hover:bg-surface-2/60"
                    >
                      <td className="px-5 py-3.5 font-medium text-ink">
                        {item.nombreProducto}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <span className="inline-flex min-w-12 justify-center rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-semibold text-ink">
                          {item.cantidadUnidades}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}