import { useNavigate, useParams } from 'react-router-dom';
import { Croissant, Pencil, Phone } from 'lucide-react';
import { useOrdenEspecialDetalle } from '../api/useOrdenEspecialDetalle';
import { EstadoEntregaBadge } from '../components/EstadoEntregaBadge';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';

export function DetalleOrdenEspecialPage() {
  const { idOrdenEspecial: idParam } = useParams<{ idOrdenEspecial: string }>();
  const idOrdenEspecial = Number(idParam);
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch } = useOrdenEspecialDetalle(idOrdenEspecial);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <PageHeader title="Orden especial" backTo="/ordenes-especiales" />
        {data && (
          <button
            type="button"
            onClick={() => navigate(`/ordenes-especiales/${idOrdenEspecial}/editar`)}
            className="btn-primary shrink-0 !px-3 sm:!px-4"
          >
            <Pencil className="h-4 w-4" />
            <span className="hidden sm:inline">Editar</span>
          </button>
        )}
      </div>

      {isLoading && <Spinner label="Cargando…" />}

      {isError && <ErrorState message={error?.message} onRetry={() => refetch()} />}

      {!isLoading && !isError && !data && (
        <EmptyState
          title="Orden no encontrada"
          description="Puede que ya no exista, o el enlace esté roto."
        />
      )}

      {data && (
        <>
          {/* Encabezado */}
          <div className="card space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink">{data.ordenEncabezado.nombreCliente}</p>
                <p className="flex items-center gap-1 text-xs text-muted">
                  <Phone className="h-3 w-3 shrink-0" />
                  {data.ordenEncabezado.telefonoCliente}
                </p>
              </div>
              <EstadoEntregaBadge fechaEntrega={data.ordenEncabezado.fechaEntrega} />
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-line pt-3 text-xs sm:grid-cols-4">
              <div>
                <p className="text-muted">Sucursal</p>
                <p className="text-ink">{data.ordenEncabezado.sucursalEntrega}</p>
              </div>
              <div>
                <p className="text-muted">Fecha de entrega</p>
                <p className="text-ink">{data.ordenEncabezado.fechaEntrega}</p>
              </div>
              <div>
                <p className="text-muted">Fecha a producir</p>
                <p className="text-ink">{data.ordenEncabezado.fechaAProducir}</p>
              </div>
              <div>
                <p className="text-muted">Ingresada por</p>
                <p className="text-ink">{data.ordenEncabezado.ordenIngresadaPor}</p>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-ink/80">Productos del pedido</h2>

            {/* Móvil: tarjetas */}
            <div className="space-y-2 md:hidden">
              {data.ordenDetalle.map((item) => (
                <div key={item.idDetalleOrdenEspecial} className="card flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <Croissant className="h-4 w-4" />
                  </div>
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                    {item.nombreProducto}
                  </p>
                  <span className="shrink-0 text-sm text-muted">
                    {item.cantidadUnidades} unidades
                  </span>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-surface">
                  {data.ordenDetalle.map((item) => (
                    <tr key={item.idDetalleOrdenEspecial}>
                      <td className="px-4 py-3 font-medium text-ink">{item.nombreProducto}</td>
                      <td className="px-4 py-3 text-right text-muted">{item.cantidadUnidades}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}