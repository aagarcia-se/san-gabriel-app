import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { useEncuestaDetalle } from '../api/useEncuestaDetalle';
import { useModificarEncuesta } from '../api/useEncuestaMutations';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { EncuestaForm, type EncuestaFormValues } from './EncuestaForm';
import type { TipoEncuesta } from '../types/encuestas.types';
import { getErrorMessage } from '@/shared/utils/erros.utils';

export function EditarEncuestaPage() {
  const { idCampania: idCampaniaParam } = useParams<{ idCampania: string }>();
  const idCampania = Number(idCampaniaParam);
  const navigate = useNavigate();

  const { data: campania, isLoading, isError, error, refetch } = useEncuestaDetalle(idCampania);
  const { mutate, isPending, error: mutationError } = useModificarEncuesta();

  // Tras guardar sí queremos un destino fijo y predecible (el detalle
  // actualizado), a diferencia de "cancelar"/"regresar" que usa el
  // historial del navegador para volver a donde el usuario ya estaba
  // (listado o detalle, según por dónde entró a editar).
  const detalleUrl = Number.isFinite(idCampania) ? `/encuestas/${idCampania}` : '/encuestas';

  // Vuelve a la pantalla anterior real (listado o detalle, según por
  // dónde entró el usuario) en vez de un destino fijo.
  function handleVolver() {
    navigate(-1);
  }

  function handleSubmit(values: EncuestaFormValues) {
    if (!campania) return;
    const ahora = dayjs().format('YYYY-MM-DD HH:mm:ss');
    mutate(
      {
        idCampania,
        nombreCampania: values.nombreCampania.trim(),
        descripcion: values.descripcion.trim(),
        fechaCreacion: campania.detalle.fechaInicio, // se preserva; el backend no expone la original por separado
        fechaActualizacion: ahora,
        fechaInicio: values.fechaInicio,
        fechaFin: values.fechaFin,
        idUsuarioCreo: 0, // el backend ya conoce al creador original vía idCampania; ver nota abajo
        tipoEncuesta: values.tipoEncuesta,
        urlEncuesta: values.urlEncuesta.trim(),
        preguntas: values.preguntas.map((p, index) => ({
          tipo: p.tipo,
          pregunta: p.pregunta.trim(),
          orden: index + 1,
          obligatoria: p.obligatoria ? 1 : 0,
          fechaCreacion: ahora,
        })),
      },
      {
        onSuccess: () => navigate(detalleUrl, { replace: true }),
      },
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Editar encuesta" onBack={handleVolver} />

      {isLoading && <Spinner label="Cargando…" />}

      {isError && <ErrorState message={error?.message} onRetry={() => refetch()} />}

      {!isLoading && !isError && !campania && (
        <EmptyState
          title="Encuesta no encontrada"
          description="Puede que ya no exista, o el enlace esté roto."
        />
      )}

      {campania && (
        <div className="card">
          <EncuestaForm
            initialValues={{
              nombreCampania: campania.detalle.nombreCampania,
              descripcion: campania.detalle.descripcion,
              fechaInicio: campania.detalle.fechaInicio,
              fechaFin: campania.detalle.fechaFin,
              tipoEncuesta: 'online' as TipoEncuesta, // el detalle no trae tipoEncuesta — ver nota abajo
              urlEncuesta: 'https://panaderiasangabriel.vercel.app/', // el detalle no trae urlEncuesta — ver nota abajo
              preguntas: campania.preguntas.map((p) => ({
                localId: String(p.idPregunta),
                tipo: p.tipo,
                pregunta: p.pregunta,
                obligatoria: true, // el detalle no trae obligatoria — ver nota abajo
              })),
            }}
            submitLabel="Guardar cambios"
            isSubmitting={isPending}
            errorMessage={getErrorMessage(error)}
            onSubmit={handleSubmit}
            onCancel={handleVolver}
          />
        </div>
      )}
    </div>
  );
}