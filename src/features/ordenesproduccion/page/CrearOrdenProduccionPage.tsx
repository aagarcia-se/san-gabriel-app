import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useIngresarOrdenProduccion } from '../api/useOrdenProduccionMutations';
import { useAuthStore } from '@/features/auth/store/authStore';
import { PageHeader } from '@/shared/ui/PageHeader';
import { OrdenProduccionForm, type OrdenProduccionFormValues } from './OrdenProduccionForm';
import { getErrorMessage } from '@/shared/utils/erros.utils';

export function CrearOrdenProduccionPage() {
  const navigate = useNavigate();
  const idUsuario = useAuthStore((state) => state.user?.idUsuario) ?? 0;
  const { mutate, isPending, error } = useIngresarOrdenProduccion();

  function handleSubmit(values: OrdenProduccionFormValues) {
    if (!values.archivo) return;

    mutate(
      {
        ordenHaader: {
          idSucursal: values.idSucursal,
          ordenTurno: values.ordenTurno,
          nombrePanadero: values.nombrePanadero.trim(),
          fechaAProducir: values.fechaAProducir,
          idUsuario,
          fechaCreacion: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        },
        archivo: values.archivo,
      },
      {
        onSuccess: () => navigate('/ordenes-produccion', { replace: true }),
      },
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Nueva orden de producción" backTo="/ordenes-produccion" />
      <div className="card">
        <OrdenProduccionForm
          submitLabel="Crear orden"
          isSubmitting={isPending}
          errorMessage={getErrorMessage(error)}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/ordenes-produccion')}
        />
      </div>
    </div>
  );
}