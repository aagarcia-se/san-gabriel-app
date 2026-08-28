import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Croissant, Pencil, Plus, Search } from 'lucide-react';
import { useProductos, type ProductoConPrecio } from '../api/useProductos';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Badge } from '@/shared/ui/Badge';

export function ProductosPage() {
  const { data: productos, isLoading, isError, error, refetch } = useProductos();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!productos) return [];
    const term = search.trim().toLowerCase();
    if (!term) return productos;
    return productos.filter((p) =>
      [p.nombreProducto, p.precio?.nombreCategoria].join(' ').toLowerCase().includes(term),
    );
  }, [productos, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Productos</h1>
          <p className="text-sm text-muted">Catálogo de Panadería San Gabriel.</p>
        </div>
        <Link to="/productos/nuevo" className="btn-primary shrink-0 !px-3 sm:!px-4">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nuevo producto</span>
        </Link>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Buscar por nombre o categoría…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9"
        />
      </div>

      {isLoading && <Spinner label="Cargando productos…" />}

      {isError && <ErrorState message={error?.message} onRetry={() => refetch()} />}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          title={search ? 'Sin resultados' : 'Todavía no hay productos'}
          description={
            search
              ? 'Prueba con otro término de búsqueda.'
              : 'Los productos que se creen van a aparecer aquí.'
          }
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <>
          {/* Móvil: tarjetas */}
          <div className="space-y-2 md:hidden">
            {filtered.map((producto) => (
              <ProductoCard key={producto.idProducto} producto={producto} />
            ))}
          </div>

          {/* Desktop: tabla */}
          <div className="hidden overflow-hidden rounded-2xl border border-line md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Categoría</th>
                  <th className="px-4 py-3 font-medium">Precio</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-surface">
                {filtered.map((producto) => (
                  <tr key={producto.idProducto} className="transition-colors hover:bg-surface-2">
                    <td className="px-4 py-3 font-medium text-ink">{producto.nombreProducto}</td>
                    <td className="px-4 py-3 text-muted">
                      {producto.precio?.nombreCategoria ?? `#${producto.idCategoria}`}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      <PrecioTexto producto={producto} />
                    </td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={producto.estado} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Link
                          to={`/productos/${producto.idProducto}/editar`}
                          aria-label="Editar"
                          title="Editar"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function ProductoCard({ producto }: { producto: ProductoConPrecio }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Croissant className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{producto.nombreProducto}</p>
            <p className="truncate text-xs text-muted">
              {producto.precio?.nombreCategoria ?? `Categoría #${producto.idCategoria}`}
            </p>
          </div>
        </div>
        <EstadoBadge estado={producto.estado} />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-xs text-muted">
        <PrecioTexto producto={producto} />
        <Link
          to={`/productos/${producto.idProducto}/editar`}
          aria-label="Editar"
          title="Editar"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <Pencil className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function PrecioTexto({ producto }: { producto: ProductoConPrecio }) {
  if (!producto.precio) return <span>Sin precio</span>;
  const { cantidad, precio } = producto.precio;
  return (
    <span>
      {cantidad} × Q{precio}
    </span>
  );
}

function EstadoBadge({ estado }: { estado: ProductoConPrecio['estado'] }) {
  return estado === 'A' ? (
    <Badge variant="success">Activo</Badge>
  ) : (
    <Badge variant="danger">Inactivo</Badge>
  );
}
