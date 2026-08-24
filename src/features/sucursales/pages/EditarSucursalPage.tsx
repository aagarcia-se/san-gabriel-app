import { useNavigate, useParams } from 'react-router-dom';
import { useSucursales } from '../api/useSucursales';
import { useActualizarSucursal } from '../api/useSucursalMutations';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { SucursalForm, type SucursalFormValues } from './SucursalForm';

export function EditarSucursalPage() {
  const { idSucursal } = useParams<{ idSucursal: string }>();
  const navigate = useNavigate();

  const { data: sucursales, isLoading, isError, error, refetch } = useSucursales();
  const sucursal = sucursales?.find((s) => s.idSucursal === Number(idSucursal));

  const { mutate, isPending, error: mutationError } = useActualizarSucursal();

  function handleSubmit(values: SucursalFormValues) {
    if (!sucursal) return;
    mutate(
      {
        idSucursal: sucursal.idSucursal,
        nombreSucursal: values.nombreSucursal.trim(),
        direccionSucursal: values.direccionSucursal.trim(),
        municipioSucursal: values.municipioSucursal.trim(),
        departamentoSucursal: values.departamentoSucursal.trim(),
        telefonoSucursal: values.telefonoSucursal.trim(),
        correoSucursal: values.correoSucursal.trim(),
      },
      {
        onSuccess: () => navigate('/sucursales', { replace: true }),
      },
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Editar sucursal" backTo="/sucursales" />

      {isLoading && <Spinner label="Cargando…" />}

      {isError && <ErrorState message={error?.message} onRetry={() => refetch()} />}

      {!isLoading && !isError && !sucursal && (
        <EmptyState
          title="Sucursal no encontrada"
          description="Puede que ya no exista, o el enlace esté roto."
        />
      )}

      {sucursal && (
        <div className="card">
          <SucursalForm
            initialValues={{
              nombreSucursal: sucursal.nombreSucursal,
              direccionSucursal: sucursal.direccionSucursal,
              municipioSucursal: sucursal.municipioSucursal,
              departamentoSucursal: sucursal.departamentoSucursal,
              telefonoSucursal: sucursal.telefonoSucursal,
              correoSucursal: sucursal.correoSucursal,
            }}
            submitLabel="Guardar cambios"
            isSubmitting={isPending}
            errorMessage={mutationError?.message}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/sucursales')}
          />
        </div>
      )}
    </div>
  );
}
