import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ClipboardList, Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEncuestas } from '../api/useEncuestas';
import { useEliminarEncuesta } from '../api/useEncuestaMutations';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { Alert } from '@/shared/ui/Alert';
import { cn } from '@/shared/lib/cn';
import type { ApiError } from '@/shared/api/httpClient';
import type { EncuestaListItem } from '../types/encuestas.types';

export function EncuestasPage() {
  const { data: encuestas, isLoading, isError, error, refetch } = useEncuestas();
  const eliminar = useEliminarEncuesta();

  const [search, setSearch] = useState('');
  const [encuestaAEliminar, setEncuestaAEliminar] = useState<EncuestaListItem | null>(null);
  const [actionError, setActionError] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();

  const filtered = useMemo(() => {
    if (!encuestas) return [];
    const term = search.trim().toLowerCase();
    if (!term) return encuestas;
    return encuestas.filter((e) =>
      `${e.title} ${e.descripcion}`.toLowerCase().includes(term),
    );
  }, [encuestas, search]);

  function handleConfirmEliminar() {
    if (!encuestaAEliminar) return;
    setActionError(undefined);
    eliminar.mutate(encuestaAEliminar.id, {
      onSuccess: () => {
        setEncuestaAEliminar(null);
        setSuccessMessage('Encuesta eliminada correctamente.');
      },
      onError: (err:unknown) => {
        setActionError((err as ApiError).message ?? 'No se pudo eliminar la encuesta.');
      },
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Encuestas</h1>
          <p className="text-sm text-muted">Crea y da seguimiento a las encuestas de clientes.</p>
        </div>
        <Link to="/encuestas/nuevo" className="btn-primary shrink-0 !px-3 sm:!px-4">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Crear encuesta</span>
        </Link>
      </div>

      {successMessage && (
        <Alert
          variant="success"
          onDismiss={() => setSuccessMessage(undefined)}
          autoDismissMs={5000}
        >
          {successMessage}
        </Alert>
      )}

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

      {isLoading && <Spinner label="Cargando encuestas…" />}

      {isError && <ErrorState message={error?.message} onRetry={() => refetch()} />}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          title={search ? 'Sin resultados' : 'No hay encuestas'}
          description={
            search
              ? 'Prueba con otro término de búsqueda.'
              : 'Aún no has creado ninguna encuesta. Crea tu primera encuesta para comenzar a recopilar información.'
          }
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((encuesta) => (
            <EncuestaCard
              key={encuesta.id}
              encuesta={encuesta}
              disabled={eliminar.isPending}
              onEliminar={() => {
                setActionError(undefined);
                setEncuestaAEliminar(encuesta);
              }}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={encuestaAEliminar !== null}
        title="¿Eliminar encuesta?"
        description={
          encuestaAEliminar
            ? `"${encuestaAEliminar.title}" se eliminará junto con sus preguntas. Esta acción no se puede deshacer.`
            : undefined
        }
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={eliminar.isPending}
        errorMessage={actionError}
        onConfirm={handleConfirmEliminar}
        onCancel={() => {
          setEncuestaAEliminar(null);
          setActionError(undefined);
        }}
      />
    </div>
  );
}

function EstadoBadge({ status }: { status: EncuestaListItem['calculated_status'] }) {
  const styles: Record<string, string> = {
    active: 'bg-success-500/10 text-success-600 dark:text-success-400',
    closed: 'bg-danger-500/10 text-danger-600 dark:text-danger-400',
    scheduled: 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
    draft: 'bg-surface-2 text-muted',
  };
  const labels: Record<string, string> = {
    active: 'Activa',
    closed: 'Cerrada',
    scheduled: 'Programada',
    draft: 'Borrador',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        styles[status] ?? styles.draft,
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}

function EncuestaCard({
  encuesta,
  disabled,
  onEliminar,
}: {
  encuesta: EncuestaListItem;
  disabled: boolean;
  onEliminar: () => void;
}) {
  return (
    <div className="card space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">{encuesta.title}</p>
            <p className="mt-0.5 line-clamp-2 text-xs text-muted">{encuesta.descripcion}</p>
          </div>
        </div>
        <EstadoBadge status={encuesta.calculated_status} />
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-line pt-3 text-xs text-muted sm:grid-cols-4">
        <div>
          <p className="text-muted">Tipo</p>
          <p className="capitalize text-ink">{encuesta.type}</p>
        </div>
        <div>
          <p className="text-muted">Preguntas</p>
          <p className="text-ink">{encuesta.questions}</p>
        </div>
        <div>
          <p className="text-muted">Respuestas</p>
          <p className="text-ink">{encuesta.responses}</p>
        </div>
        <div>
          <p className="text-muted">Vigencia</p>
          <p className="text-ink">
            {encuesta.start_date} — {encuesta.end_date}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1 border-t border-line pt-3">
        <Link
          to={`/encuestas/${encuesta.id}`}
          aria-label="Ver detalle"
          title="Ver detalle"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <Eye className="h-4 w-4" />
        </Link>
        <Link
          to={`/encuestas/${encuesta.id}/editar`}
          aria-label="Editar"
          title="Editar"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <Pencil className="h-4 w-4" />
        </Link>
        <Link
          to={`/encuestas/${encuesta.id}/resultados`}
          aria-label="Ver resultados"
          title="Ver resultados"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <BarChart3 className="h-4 w-4" />
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
    </div>
  );
}