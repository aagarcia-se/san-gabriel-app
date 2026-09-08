import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useCrearEncuesta } from '../api/useEncuestaMutations';
import { useAuthStore } from '@/features/auth/store/authStore';
import { PageHeader } from '@/shared/ui/PageHeader';
import { EncuestaForm, type EncuestaFormValues } from './EncuestaForm';
import type { ApiError } from '@/shared/api/httpClient';
import { getErrorMessage } from '@/shared/utils/erros.utils';

export function CrearEncuestaPage() {
  const navigate = useNavigate();
  const { mutate, isPending, error } = useCrearEncuesta();
  const idUsuario = useAuthStore((state) => state.user?.idUsuario) ?? 1;

  function handleSubmit(values: EncuestaFormValues) {
    const ahora = dayjs().format('YYYY-MM-DD HH:mm:ss');
    mutate(
      {
        nombreCampania: values.nombreCampania.trim(),
        descripcion: values.descripcion.trim(),
        fechaCreacion: ahora,
        fechaActualizacion: ahora,
        fechaInicio: values.fechaInicio,
        fechaFin: values.fechaFin,
        idUsuarioCreo: idUsuario,
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
        onSuccess: () => navigate('/encuestas', { replace: true }),
      },
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Nueva encuesta" backTo="/encuestas" />
      <div className="card">
        <EncuestaForm
          submitLabel="Crear encuesta"
          isSubmitting={isPending}
          errorMessage={getErrorMessage(error)}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/encuestas')}
        />
      </div>
    </div>
  );
}