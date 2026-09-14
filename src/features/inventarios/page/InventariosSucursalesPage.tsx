// InventariosSucursalesPage.tsx
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, ChevronRight, Search } from 'lucide-react';
import { useSucursales } from '@/features/sucursales/api/useSucursales';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';

export function InventariosSucursalesPage() {
  const { data: sucursales, isLoading, isError, error, refetch } = useSucursales();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!sucursales) return [];
    const term = search.trim().toLowerCase();
    if (!term) return sucursales;
    return sucursales.filter((s) => s.nombreSucursal.toLowerCase().includes(term));
  }, [sucursales, search]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Inventarios</h1>
        <p className="text-sm text-muted">Selecciona una sucursal para gestionar sus existencias.</p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Buscar sucursal…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9"
        />
      </div>

      {isLoading && <Spinner label="Cargando sucursales…" />}

      {isError && <ErrorState message={error?.message} onRetry={() => refetch()} />}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          title={search ? 'Sin resultados' : 'No hay sucursales'}
          description={
            search ? 'Prueba con otro término de búsqueda.' : 'Todavía no hay sucursales registradas.'
          }
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((sucursal) => (
            <Link
              key={sucursal.idSucursal}
              to={`/inventarios/${sucursal.idSucursal}`}
              className="card flex items-center gap-3 transition-colors hover:bg-surface-2"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <Building2 className="h-5 w-5" />
              </div>
              <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                {sucursal.nombreSucursal}
              </p>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}