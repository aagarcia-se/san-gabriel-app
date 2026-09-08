import { Link, useNavigate, useParams } from 'react-router-dom';
import { BarChart3, Pencil } from 'lucide-react';
import { useEncuestaDetalle } from '../api/useEncuestaDetalle';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';

export function EncuestaDetallePage() {
  const { idCampania: idCampaniaParam } = useParams<{ idCampania: string }>();
  const idCampania = Number(idCampaniaParam);
  const navigate = useNavigate();

  const { data: campania, isLoading, isError, error, refetch } = useEncuestaDetalle(idCampania);

  return (
    <div className="space-y-4">
      <PageHeader title="Detalle de la encuesta" backTo="/encuestas" />

      {isLoading && <Spinner label="Cargando…" />}

      {isError && <ErrorState message={error?.message} onRetry={() => refetch()} />}

      {!isLoading && !isError && !campania && (
        <EmptyState
          title="Encuesta no encontrada"
          description="Puede que ya no exista, o el enlace esté roto."
        />
      )}

      {campania && (
        <>
          <div className="card space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-ink">
                  {campania.detalle.nombreCampania}
                </h2>
                <p className="mt-1 text-sm text-muted">{campania.detalle.descripcion}</p>
              </div>
              <span
                className={
                  campania.detalle.activa === 1
                    ? 'shrink-0 rounded-full bg-success-500/10 px-2 py-0.5 text-xs font-medium text-success-600 dark:text-success-400'
                    : 'shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted'
                }
              >
                {campania.detalle.activa === 1 ? 'Activa' : 'Inactiva'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-line pt-3 text-sm sm:grid-cols-4">
              <div>
                <p className="text-xs text-muted">Creada por</p>
                <p className="text-ink">{campania.detalle.usuario}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Inicio</p>
                <p className="text-ink">{campania.detalle.fechaInicio}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Fin</p>
                <p className="text-ink">{campania.detalle.fechaFin}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Preguntas</p>
                <p className="text-ink">{campania.preguntas.length}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-line pt-3">
              <Link
                to={`/encuestas/${idCampania}/resultados`}
                className="btn-secondary"
              >
                <BarChart3 className="h-4 w-4" />
                Ver resultados
              </Link>
              <button
                type="button"
                onClick={() => navigate(`/encuestas/${idCampania}/editar`)}
                className="btn-primary"
              >
                <Pencil className="h-4 w-4" />
                Editar
              </button>
            </div>
          </div>

          <div className="card space-y-3">
            <h3 className="text-sm font-medium text-ink/80">Preguntas</h3>
            <ol className="space-y-2">
              {campania.preguntas.map((pregunta, index) => (
                <li
                  key={pregunta.idPregunta}
                  className="flex items-start justify-between gap-3 rounded-lg border border-line px-3 py-2.5"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-muted">#{index + 1}</span>
                    <p className="text-sm text-ink">{pregunta.pregunta}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-xs capitalize text-muted">
                    {pregunta.tipo}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}
    </div>
  );
}