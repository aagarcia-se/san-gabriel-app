import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useIngresarSucursal } from '../api/useSucursalMutations';
import { PageHeader } from '@/shared/ui/PageHeader';
import { SucursalForm, type SucursalFormValues } from './SucursalForm';

export function CrearSucursalPage() {
  const navigate = useNavigate();
  const { mutate, isPending, error } = useIngresarSucursal();

  function handleSubmit(values: SucursalFormValues) {
    mutate(
      {
        nombreSucursal: values.nombreSucursal.trim(),
        direccionSucursal: values.direccionSucursal.trim(),
        municipioSucursal: values.municipioSucursal.trim(),
        departamentoSucursal: values.departamentoSucursal.trim(),
        telefonoSucursal: values.telefonoSucursal.trim(),
        correoSucursal: values.correoSucursal.trim(),
        // Se genera acá, en el navegador — el formulario no la pide.
        fechaCreacion: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        onSuccess: () => navigate('/sucursales', { replace: true }),
      },
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Nueva sucursal" backTo="/sucursales" />

      <div className="card">
        <SucursalForm
          submitLabel="Crear sucursal"
          isSubmitting={isPending}
          errorMessage={error?.message}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/sucursales')}
        />
      </div>
    </div>
  );
}
