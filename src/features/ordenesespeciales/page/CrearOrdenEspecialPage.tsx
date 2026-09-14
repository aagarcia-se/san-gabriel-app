import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useIngresarOrdenEspecial } from '../api/useOrdenEspecialMutations';
import { useAuthStore } from '@/features/auth/store/authStore';
import { PageHeader } from '@/shared/ui/PageHeader';
import { OrdenEspecialForm, type OrdenEspecialFormValues } from './OrdenEspecialForm';
import { getErrorMessage } from '@/shared/utils/erros.utils';

export function CrearOrdenEspecialPage() {
  const navigate = useNavigate();
  const idUsuario = useAuthStore((state) => state.user?.idUsuario) ?? 0;
  const nombreUsuario = useAuthStore(
    (state) => `${state.user?.nombre ?? ''} ${state.user?.apellido ?? ''}`.trim(),
  );
  const { mutate, isPending, error } = useIngresarOrdenEspecial();

  function handleSubmit(values: OrdenEspecialFormValues, nombreSucursal: string) {
    const fecha = dayjs().format('YYYY-MM-DD');

    mutate(
      {
        ordenEncabezado: {
          idSucursal: Number(values.idSucursal),
          nombreSucursal,
          idUsuario,
          nombreUsuario,
          nombreCliente: values.nombreCliente.trim(),
          telefonoCliente: values.telefonoCliente.trim(),
          fechaEntrega: values.fechaEntrega,
          fechaAProducir: values.fechaAProducir,
          fechaCreacion: fecha,
        },
        ordenDetalle: values.productos.map((p) => ({
          idProducto: p.idProducto,
          cantidadUnidades: p.cantidad,
          nombreProducto: p.nombreProducto,
          fechaCreacion: fecha,
        })),
      },
      {
        onSuccess: () => navigate('/ordenes-especiales', { replace: true }),
      },
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Nueva orden especial" backTo="/ordenes-especiales" />
      <div className="card">
        <OrdenEspecialForm
          submitLabel="Crear orden"
          isSubmitting={isPending}
          errorMessage={getErrorMessage(error)}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/ordenes-especiales')}
        />
      </div>
    </div>
  );
}