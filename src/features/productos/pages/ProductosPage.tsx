import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Croissant, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useProductos } from '../api/useProductos';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { cn } from '@/shared/lib/cn';
import type { ProductoConPrecio } from '../types/precio.types';
import { useDescativarProducto } from '../api/useProductoMutations';

export function ProductosPage() {
  const { data: productos, isLoading, isError, error, refetch } = useProductos();
  const desactivarProducto = useDescativarProducto();

  const [search, setSearch] = useState('');
  const [productoADesactivar, setProductoADesactivar] = useState<ProductoConPrecio | null>(null);

  const filtered = useMemo(() => {
    if (!productos) return [];
    const term = search.trim().toLowerCase();
    if (!term) return productos;
    return productos.filter((p) =>
      `${p.nombreProducto} ${p.nombreCategoria}`.toLowerCase().includes(term),
    );
  }, [productos, search]);

  function handleConfirmDesactivar() {
    if (!productoADesactivar) return;
    desactivarProducto.mutate(productoADesactivar.idProducto, {
      onSuccess: () => setProductoADesactivar(null),
    });
  }

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
              : 'Solo se listan productos activos con precio cargado.'
          }
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <>
          {/* Móvil: tarjetas */}
          <div className="space-y-2 md:hidden">
            {filtered.map((producto) => (
              <ProductoCard
                key={producto.idProducto}
                producto={producto}
                disabled={desactivarProducto.isPending}
                onDesactivar={() => setProductoADesactivar(producto)}
              />
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
                  <th className="px-4 py-3 font-medium">Producción</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-surface">
                {filtered.map((producto) => (
                  <tr key={producto.idProducto} className="transition-colors hover:bg-surface-2">
                    <td className="px-4 py-3 font-medium text-ink">{producto.nombreProducto}</td>
                    <td className="px-4 py-3 text-muted">{producto.nombreCategoria}</td>
                    <td className="px-4 py-3 text-muted">
                      {producto.cantidad} × Q{producto.precio}
                    </td>
                    <td className="px-4 py-3 capitalize text-muted">{producto.tipoProduccion}</td>
                    <td className="px-4 py-3">
                      <RowActions
                        producto={producto}
                        disabled={desactivarProducto.isPending}
                        onDesactivar={() => setProductoADesactivar(producto)}
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
        open={productoADesactivar !== null}
        title="¿Desactivar producto?"
        description={
          productoADesactivar
            ? `"${productoADesactivar.nombreProducto}" dejará de aparecer en el catálogo activo.`
            : undefined
        }
        confirmLabel="Desactivar"
        variant="danger"
        isLoading={desactivarProducto.isPending}
        onConfirm={handleConfirmDesactivar}
        onCancel={() => setProductoADesactivar(null)}
      />
    </div>
  );
}

interface ActionsProps {
  producto: ProductoConPrecio;
  disabled: boolean;
  onDesactivar: () => void;
}

function RowActions({ producto, disabled, onDesactivar }: ActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        to={`/productos/${producto.idProducto}/editar`}
        aria-label="Editar"
        title="Editar"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <IconActionButton
        label="Desactivar"
        icon={Trash2}
        variant="danger"
        disabled={disabled}
        onClick={onDesactivar}
      />
    </div>
  );
}

function IconActionButton({
  label,
  icon: Icon,
  onClick,
  disabled,
  variant = 'default',
}: {
  label: string;
  icon: typeof Trash2;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger';
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40',
        variant === 'danger' && 'hover:bg-danger-500/10 hover:text-danger-600 dark:hover:text-danger-400',
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function ProductoCard({
  producto,
  disabled,
  onDesactivar,
}: ActionsProps) {
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Croissant className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{producto.nombreProducto}</p>
            <p className="truncate text-xs text-muted">{producto.nombreCategoria}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-xs text-muted">
        <span>
          {producto.cantidad} × Q{producto.precio}
        </span>
        <span className="capitalize">{producto.tipoProduccion}</span>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1 border-t border-line pt-3">
        <RowActions producto={producto} disabled={disabled} onDesactivar={onDesactivar} />
      </div>
    </div>
  );
}