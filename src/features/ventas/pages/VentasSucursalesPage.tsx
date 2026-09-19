import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, ChevronRight, Search } from 'lucide-react';
import { useSucursales } from '@/features/sucursales/api/useSucursales';
import { useAuthStore } from '@/features/auth/store/authStore';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';

export function VentasSucursalesPage() {
  const { data: sucursales, isLoading, isError, error, refetch } = useSucursales();
  const [search, setSearch] = useState('');

  // OJO: ajusta esta comparación si el nombre del rol de administrador
  // en tu API no es literalmente "admin" (p. ej. "Administrador"), o si
  // prefieres verificarlo por idRol en vez de por el nombre. Mismo
  // criterio que InventariosSucursalesPage.
  const rolUsuario = useAuthStore((state) => state.user?.rol);
  const idRolUsuario = useAuthStore((state) => state.user?.idRol);
  const idSucursalUsuario = useAuthStore((state) => state.user?.idSucursal);
  const esAdmin = rolUsuario?.trim().toLowerCase() === 'admin' && idRolUsuario === 1;

  // Fuente de la que parte todo lo demás: si no es admin, ya viene
  // recortada a su propia sucursal — el resto de la página (búsqueda,
  // estados vacíos, etc.) no necesita saber nada sobre roles.
  const sucursalesVisibles = useMemo(() => {
    if (!sucursales) return [];
    if (esAdmin) return sucursales;
    return sucursales.filter((s) => s.idSucursal === idSucursalUsuario);
  }, [sucursales, esAdmin, idSucursalUsuario]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return sucursalesVisibles;
    return sucursalesVisibles.filter((s) => s.nombreSucursal.toLowerCase().includes(term));
  }, [sucursalesVisibles, search]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Ventas</h1>
        <p className="text-sm text-muted">
          {esAdmin
            ? 'Selecciona una sucursal para gestionar sus ventas.'
            : 'Gestiona las ventas de tu sucursal.'}
        </p>
      </div>

      {/* La búsqueda solo tiene sentido cuando hay más de una sucursal
          para elegir — para un usuario no-admin (una sola sucursal) es
          un campo vacío que no filtra nada. */}
      {esAdmin && (
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
      )}

      {isLoading && <Spinner label="Cargando sucursales…" />}

      {isError && <ErrorState message={error?.message} onRetry={() => refetch()} />}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          title={search ? 'Sin resultados' : 'No hay sucursales'}
          description={
            search
              ? 'Prueba con otro término de búsqueda.'
              : esAdmin
                ? 'Todavía no hay sucursales registradas.'
                : 'Tu usuario no tiene una sucursal asignada. Contacta a un administrador.'
          }
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((sucursal) => (
            <Link
              key={sucursal.idSucursal}
              to={`/ventas/${sucursal.idSucursal}`}
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