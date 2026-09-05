import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, ChevronDown, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useReceta } from '../api/useRecetas';
import { useEliminarReceta } from '../api/useRecetaMutations';
import type { Receta } from '../types/recetas.types';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { cn } from '@/shared/lib/cn';

interface RecetaProducto {
  idProducto: number;
  nombreProducto: string;
  ingredientes: Receta[];
}

function agruparPorProducto(recetas: Receta[]): RecetaProducto[] {
  const mapa = new Map<number, RecetaProducto>();

  for (const linea of recetas) {
    const existente = mapa.get(linea.idProducto);
    if (existente) {
      existente.ingredientes.push(linea);
    } else {
      mapa.set(linea.idProducto, {
        idProducto: linea.idProducto,
        nombreProducto: linea.nombreProducto,
        ingredientes: [linea],
      });
    }
  }

  return Array.from(mapa.values()).sort((a, b) =>
    a.nombreProducto.localeCompare(b.nombreProducto),
  );
}

export function RecetasPage() {
  const { data: recetas, isLoading, isError, error, refetch } = useReceta();
  const eliminarReceta = useEliminarReceta();

  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [ingredienteAEliminar, setIngredienteAEliminar] = useState<Receta | null>(null);

  const productos = useMemo(() => {
    if (!recetas) return [];
    return agruparPorProducto(recetas);
  }, [recetas]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return productos;
    return productos.filter(
      (p) =>
        p.nombreProducto.toLowerCase().includes(term) ||
        p.ingredientes.some((i) => i.nombreIngrediente.toLowerCase().includes(term)),
    );
  }, [productos, search]);

  function handleConfirmEliminar() {
    if (!ingredienteAEliminar) return;
    eliminarReceta.mutate(ingredienteAEliminar.idProducto, {
      onSuccess: () => setIngredienteAEliminar(null),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Recetas</h1>
          <p className="text-sm text-muted">Ingredientes por producto — Panadería San Gabriel.</p>
        </div>
        <Link to="/recetas/nuevo" className="btn-primary shrink-0 !px-3 sm:!px-4">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nueva receta</span>
        </Link>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Buscar por producto o ingrediente…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9"
        />
      </div>

      {isLoading && <Spinner label="Cargando recetas…" />}

      {isError && <ErrorState message={error?.message} onRetry={() => refetch()} />}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          title={search ? 'Sin resultados' : 'Todavía no hay recetas'}
          description={
            search
              ? 'Prueba con otro término de búsqueda.'
              : 'Las recetas que se creen van a aparecer aquí.'
          }
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid items-start gap-3 md:grid-cols-2">
          {filtered.map((producto) => (
            <RecetaCard
              key={producto.idProducto}
              producto={producto}
              expanded={expandedId === producto.idProducto}
              onToggle={() =>
                setExpandedId((prev) => (prev === producto.idProducto ? null : producto.idProducto))
              }
              disabled={eliminarReceta.isPending}
              onEliminarIngrediente={setIngredienteAEliminar}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={ingredienteAEliminar !== null}
        title="¿Eliminar Receta?"
        description={
          ingredienteAEliminar
            ? `Se Eliminara la receta del producto ${ingredienteAEliminar.nombreProducto}.`
            : undefined
        }
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={eliminarReceta.isPending}
        onConfirm={handleConfirmEliminar}
        onCancel={() => setIngredienteAEliminar(null)}
      />
    </div>
  );
}

interface RecetaCardProps {
  producto: RecetaProducto;
  expanded: boolean;
  onToggle: () => void;
  disabled: boolean;
  onEliminarIngrediente: (ingrediente: Receta) => void;
}

function RecetaCard({
  producto,
  expanded,
  onToggle,
  disabled,
  onEliminarIngrediente,
}: RecetaCardProps) {
  // Botón de eliminar del header: apunta a la primera línea de la
  // receta. Con recetas de un solo ingrediente (el caso actual) borra
  // la receta completa; si en el futuro una receta tiene varias líneas,
  // esta acción rápida solo quita la primera — las demás se eliminan
  // individualmente expandiendo la tarjeta.
  const primeraLinea = producto.ingredientes[0];

  return (
    <div className="card !p-0 overflow-hidden">
      <div className="flex w-full items-center justify-between gap-3 p-4">
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <ChefHat className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{producto.nombreProducto}</p>
            <p className="text-xs text-muted">
              {producto.ingredientes.length}{' '}
              {producto.ingredientes.length === 1 ? 'ingrediente' : 'ingredientes'}
            </p>
          </div>
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <Link
            to={`/recetas/${producto.idProducto}/editar`}
            aria-label="Editar"
            title="Editar"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            title="Eliminar"
            aria-label="Eliminar"
            disabled={disabled}
            onClick={() => onEliminarIngrediente(primeraLinea)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-500/10 hover:text-danger-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:text-danger-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onToggle}
            aria-label={expanded ? 'Contraer' : 'Expandir'}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <ChevronDown
              className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')}
            />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="divide-y divide-line border-t border-line">
          {producto.ingredientes.map((ingrediente) => (
            <div
              key={ingrediente.idIngrediente}
              className="flex items-center justify-between gap-3 px-4 py-2.5"
            >
              <p className="truncate text-sm text-ink">{ingrediente.nombreIngrediente}</p>
              <p className="shrink-0 text-xs text-muted">
                {ingrediente.cantidadNecesaria} {ingrediente.unidadMedida}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}