import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Gift, Pencil, Phone, Plus, Search, Trash2 } from 'lucide-react';
import { useOrdenesEspeciales } from '../api/useOrdenesEspeciales';
import { useEliminarOrdenEspecial } from '../api/useOrdenEspecialMutations';
import { useAuthStore } from '@/features/auth/store/authStore';
import { EstadoEntregaBadge } from '../components/EstadoEntregaBadge';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import type { ApiError } from '@/shared/api/httpClient';
import type { OrdenEspecialListItem } from '../types/ordenesEspeciales.types';

export function OrdenesEspecialesPage() {
  const idRol = useAuthStore((state) => state.user?.idRol) ?? 0;
  const idSucursal = useAuthStore((state) => state.user?.idSucursal) ?? 0;

  const { data: ordenes, isLoading, isError, error, refetch } = useOrdenesEspeciales(
    idRol,
    idSucursal,
  );
  const eliminar = useEliminarOrdenEspecial();

  const [search, setSearch] = useState('');
  const [ordenAEliminar, setOrdenAEliminar] = useState<OrdenEspecialListItem | null>(null);
  const [actionError, setActionError] = useState<string | undefined>();

  const filtered = useMemo(() => {
    if (!ordenes) return [];
    const term = search.trim().toLowerCase();
    if (!term) return ordenes;
    return ordenes.filter((o) =>
      `${o.nombreCliente} ${o.sucursalEntrega} ${o.telefonoCliente}`.toLowerCase().includes(term),
    );
  }, [ordenes, search]);

  function handleConfirmEliminar() {
    if (!ordenAEliminar) return;
    setActionError(undefined);
    eliminar.mutate(ordenAEliminar.idOrdenEspecial, {
      onSuccess: () => setOrdenAEliminar(null),
      onError: (err: unknown) => {
        setActionError((err as ApiError).message ?? 'No se pudo eliminar la orden.');
      },
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Órdenes especiales</h1>
          <p className="text-sm text-muted">Pedidos personalizados de clientes.</p>
        </div>
        <Link to="/ordenes-especiales/nuevo" className="btn-primary shrink-0 !px-3 sm:!px-4">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nueva orden</span>
        </Link>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Buscar por cliente, sucursal o teléfono…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9"
        />
      </div>

      {isLoading && <Spinner label="Cargando órdenes especiales…" />}

      {isError && <ErrorState message={error?.message} onRetry={() => refetch()} />}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          title={search ? 'Sin resultados' : 'Todavía no hay órdenes especiales'}
          description={
            search
              ? 'Prueba con otro término de búsqueda.'
              : 'Las órdenes especiales que se creen van a aparecer aquí.'
          }
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <>
          {/* Móvil: tarjetas */}
          <div className="space-y-2 md:hidden">
            {filtered.map((orden) => (
              <OrdenCard
                key={orden.idOrdenEspecial}
                orden={orden}
                disabled={eliminar.isPending}
                onEliminar={() => {
                  setActionError(undefined);
                  setOrdenAEliminar(orden);
                }}
              />
            ))}
          </div>

          {/* Desktop: tabla */}
          <div className="hidden overflow-hidden rounded-2xl border border-line md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Teléfono</th>
                  <th className="px-4 py-3 font-medium">Sucursal</th>
                  <th className="px-4 py-3 font-medium">Entrega</th>
                  <th className="px-4 py-3 font-medium">A producir</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-surface">
                {filtered.map((orden) => (
                  <tr key={orden.idOrdenEspecial} className="transition-colors hover:bg-surface-2">
                    <td className="px-4 py-3 font-medium text-ink">{orden.nombreCliente}</td>
                    <td className="px-4 py-3 text-muted">{orden.telefonoCliente}</td>
                    <td className="px-4 py-3 text-muted">{orden.sucursalEntrega}</td>
                    <td className="px-4 py-3 text-muted">{orden.fechaEntrega}</td>
                    <td className="px-4 py-3 text-muted">{orden.fechaAProducir}</td>
                    <td className="px-4 py-3">
                      <EstadoEntregaBadge fechaEntrega={orden.fechaEntrega} />
                    </td>
                    <td className="px-4 py-3">
                      <RowActions
                        orden={orden}
                        disabled={eliminar.isPending}
                        onEliminar={() => {
                          setActionError(undefined);
                          setOrdenAEliminar(orden);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ConfirmDialog
        open={ordenAEliminar !== null}
        title="¿Eliminar orden especial?"
        description={
          ordenAEliminar
            ? `El pedido de "${ordenAEliminar.nombreCliente}" se eliminará. Esta acción no se puede deshacer.`
            : undefined
        }
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={eliminar.isPending}
        errorMessage={actionError}
        onConfirm={handleConfirmEliminar}
        onCancel={() => {
          setOrdenAEliminar(null);
          setActionError(undefined);
        }}
      />
    </div>
  );
}

interface RowActionsProps {
  orden: OrdenEspecialListItem;
  disabled: boolean;
  onEliminar: () => void;
}

function RowActions({ orden, disabled, onEliminar }: RowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        to={`/ordenes-especiales/${orden.idOrdenEspecial}`}
        aria-label="Ver detalle"
        title="Ver detalle"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
      >
        <Eye className="h-4 w-4" />
      </Link>
      <Link
        to={`/ordenes-especiales/${orden.idOrdenEspecial}/editar`}
        aria-label="Editar"
        title="Editar"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <button
        type="button"
        aria-label="Eliminar"
        title="Eliminar"
        disabled={disabled}
        onClick={onEliminar}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-500/10 hover:text-danger-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:text-danger-400"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function OrdenCard({
  orden,
  disabled,
  onEliminar,
}: {
  orden: OrdenEspecialListItem;
  disabled: boolean;
  onEliminar: () => void;
}) {
  return (
    <div className="card">
      <Link to={`/ordenes-especiales/${orden.idOrdenEspecial}`} className="block">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Gift className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{orden.nombreCliente}</p>
              <p className="flex items-center gap-1 truncate text-xs text-muted">
                <Phone className="h-3 w-3 shrink-0" />
                {orden.telefonoCliente}
              </p>
            </div>
          </div>
          <EstadoEntregaBadge fechaEntrega={orden.fechaEntrega} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3 text-xs text-muted">
          <div>
            <p className="text-muted">Sucursal</p>
            <p className="text-ink">{orden.sucursalEntrega}</p>
          </div>
          <div>
            <p className="text-muted">Entrega</p>
            <p className="text-ink">{orden.fechaEntrega}</p>
          </div>
        </div>
      </Link>

      <div className="mt-3 flex items-center justify-end gap-1 border-t border-line pt-3">
        <RowActions orden={orden} disabled={disabled} onEliminar={onEliminar} />
      </div>
    </div>
  );
}