import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useSucursales } from '../api/useSucursales';
import { useEliminarSucursal } from '../api/useSucursalMutations';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import type { Sucursal } from '../types/sucursal.types';

export function SucursalesPage() {
  const { data: sucursales, isLoading, isError, error, refetch } = useSucursales();
  const [search, setSearch] = useState('');
  const [toDelete, setToDelete] = useState<Sucursal | null>(null);

  const eliminar = useEliminarSucursal();

  const filtered = useMemo(() => {
    if (!sucursales) return [];
    const term = search.trim().toLowerCase();
    if (!term) return sucursales;
    return sucursales.filter((s) =>
      [s.nombreSucursal, s.direccionSucursal, s.municipioSucursal, s.departamentoSucursal]
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  }, [sucursales, search]);

  function handleDelete() {
    if (!toDelete) return;
    eliminar.mutate(toDelete.idSucursal, { onSuccess: () => setToDelete(null) });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Sucursales</h1>
          <p className="text-sm text-muted">Ubicaciones de Panadería San Gabriel.</p>
        </div>
        <Link to="/sucursales/nueva" className="btn-primary shrink-0 !px-3 sm:!px-4">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nueva sucursal</span>
        </Link>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Buscar por nombre, dirección, municipio o departamento…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9"
        />
      </div>

      {isLoading && <Spinner label="Cargando sucursales…" />}

      {isError && <ErrorState message={error?.message} onRetry={() => refetch()} />}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          title={search ? 'Sin resultados' : 'Todavía no hay sucursales'}
          description={
            search
              ? 'Prueba con otro término de búsqueda.'
              : 'Las sucursales que se creen van a aparecer aquí.'
          }
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <>
          {/* Móvil: tarjetas */}
          <div className="space-y-2 md:hidden">
            {filtered.map((sucursal) => (
              <SucursalCard key={sucursal.idSucursal} sucursal={sucursal} onDelete={setToDelete} />
            ))}
          </div>

          {/* Desktop: tabla */}
          <div className="hidden overflow-hidden rounded-2xl border border-line md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Dirección</th>
                  <th className="px-4 py-3 font-medium">Municipio</th>
                  <th className="px-4 py-3 font-medium">Departamento</th>
                  <th className="px-4 py-3 font-medium">Teléfono</th>
                  <th className="px-4 py-3 font-medium">Correo</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-surface">
                {filtered.map((sucursal) => (
                  <tr key={sucursal.idSucursal} className="transition-colors hover:bg-surface-2">
                    <td className="px-4 py-3 font-medium text-ink">{sucursal.nombreSucursal}</td>
                    <td className="px-4 py-3 text-muted">{sucursal.direccionSucursal}</td>
                    <td className="px-4 py-3 text-muted">{sucursal.municipioSucursal}</td>
                    <td className="px-4 py-3 text-muted">{sucursal.departamentoSucursal}</td>
                    <td className="px-4 py-3 text-muted">{sucursal.telefonoSucursal}</td>
                    <td className="px-4 py-3 text-muted">{sucursal.correoSucursal}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/sucursales/${sucursal.idSucursal}/editar`}
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
                          onClick={() => setToDelete(sucursal)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-500/10 hover:text-danger-600 dark:hover:text-danger-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="¿Eliminar sucursal?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={eliminar.isPending}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

function SucursalCard({
  sucursal,
  onDelete,
}: {
  sucursal: Sucursal;
  onDelete: (sucursal: Sucursal) => void;
}) {
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{sucursal.nombreSucursal}</p>
            <p className="flex items-center gap-1 truncate text-xs text-muted">
              <MapPin className="h-3 w-3 shrink-0" />
              {sucursal.municipioSucursal}, {sucursal.departamentoSucursal}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-1 border-t border-line pt-3 text-xs text-muted">
        <p className="truncate">{sucursal.direccionSucursal}</p>
        <p className="truncate">
          {sucursal.telefonoSucursal} · {sucursal.correoSucursal}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1 border-t border-line pt-3">
        <Link
          to={`/sucursales/${sucursal.idSucursal}/editar`}
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
          onClick={() => onDelete(sucursal)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-500/10 hover:text-danger-600 dark:hover:text-danger-400"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
