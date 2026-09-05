import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useCategorias } from '../api/useCategorias';
import { useDesactivarCategoria } from '../api/useCategoriasMutations';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { Badge } from '@/shared/ui/Badge';
import { cn } from '@/shared/lib/cn';
import { Categoria } from '../types/categorias.types';

export function CategoriasPage() {
  const { data: categorias, isLoading, isError, error, refetch } = useCategorias();
  const desactivarCategoria = useDesactivarCategoria();

  const [search, setSearch] = useState('');
  const [categoriaADesactivar, setCategoriaADesactivar] = useState<Categoria | null>(null);

  const filtered = useMemo(() => {
    if (!categorias) return [];
    const term = search.trim().toLowerCase();
    if (!term) return categorias;
    return categorias.filter((c) =>
      `${c.nombreCategoria} ${c.descripcionCategoria}`.toLowerCase().includes(term),
    );
  }, [categorias, search]);

  function handleConfirmDesactivar() {
    if (!categoriaADesactivar) return;
    desactivarCategoria.mutate(categoriaADesactivar.idCategoria, {
      onSuccess: () => setCategoriaADesactivar(null),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Categorías</h1>
          <p className="text-sm text-muted">Categorías de Panadería San Gabriel.</p>
        </div>
        <Link to="/categorias/nuevo" className="btn-primary shrink-0 !px-3 sm:!px-4">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nueva categoría</span>
        </Link>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Buscar por nombre o descripción…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9"
        />
      </div>

      {isLoading && <Spinner label="Cargando categorías…" />}

      {isError && <ErrorState message={error?.message} onRetry={() => refetch()} />}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          title={search ? 'Sin resultados' : 'Todavía no hay categorías'}
          description={
            search
              ? 'Prueba con otro término de búsqueda.'
              : 'Las categorías que se creen van a aparecer aquí.'
          }
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <>
          {/* Móvil: tarjetas */}
          <div className="space-y-2 md:hidden">
            {filtered.map((categoria) => (
              <CategoriaCard
                key={categoria.idCategoria}
                categoria={categoria}
                disabled={desactivarCategoria.isPending}
                onDesactivar={() => setCategoriaADesactivar(categoria)}
              />
            ))}
          </div>

          {/* Desktop: tabla */}
          <div className="hidden overflow-hidden rounded-2xl border border-line md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Descripción</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-surface">
                {filtered.map((categoria) => (
                  <tr key={categoria.idCategoria} className="transition-colors hover:bg-surface-2">
                    <td className="px-4 py-3 font-medium text-ink">{categoria.nombreCategoria}</td>
                    <td className="px-4 py-3 text-muted">{categoria.descripcionCategoria}</td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={categoria.estado} />
                    </td>
                    <td className="px-4 py-3">
                      <RowActions
                        categoria={categoria}
                        disabled={desactivarCategoria.isPending}
                        onDesactivar={() => setCategoriaADesactivar(categoria)}
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
        open={categoriaADesactivar !== null}
        title="¿Desactivar categoría?"
        description={
          categoriaADesactivar
            ? `"${categoriaADesactivar.nombreCategoria}" dejará de estar disponible para asignar a productos.`
            : undefined
        }
        confirmLabel="Desactivar"
        variant="danger"
        isLoading={desactivarCategoria.isPending}
        onConfirm={handleConfirmDesactivar}
        onCancel={() => setCategoriaADesactivar(null)}
      />
    </div>
  );
}

interface ActionsProps {
  categoria: Categoria;
  disabled: boolean;
  onDesactivar: () => void;
}

function RowActions({ categoria, disabled, onDesactivar }: ActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        to={`/categorias/${categoria.idCategoria}/editar`}
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

function CategoriaCard({ categoria, disabled, onDesactivar }: ActionsProps) {
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{categoria.nombreCategoria}</p>
            <p className="truncate text-xs text-muted">{categoria.descripcionCategoria}</p>
          </div>
        </div>
        <EstadoBadge estado={categoria.estado} />
      </div>

      <div className="mt-3 flex items-center justify-end gap-1 border-t border-line pt-3">
        <RowActions categoria={categoria} disabled={disabled} onDesactivar={onDesactivar} />
      </div>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: Categoria['estado'] }) {
  return estado === 'A' ? (
    <Badge variant="success">Activo</Badge>
  ) : (
    <Badge variant="danger">Inactivo</Badge>
  );
}