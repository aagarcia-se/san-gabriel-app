import { useNavigate, useParams } from 'react-router-dom';
import { useOrdenEspecialDetalle } from '../api/useOrdenEspecialDetalle';
import { useActualizarOrdenEspecial } from '../api/useOrdenEspecialMutations';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { OrdenEspecialForm, type OrdenEspecialFormValues } from './OrdenEspecialForm';
import { getErrorMessage } from '@/shared/utils/erros.utils';

export function EditarOrdenEspecialPage() {
  const { idOrdenEspecial: idParam } = useParams<{ idOrdenEspecial: string }>();
  const idOrdenEspecial = Number(idParam);
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch } = useOrdenEspecialDetalle(idOrdenEspecial);
  const { mutate, isPending, error: mutationError } = useActualizarOrdenEspecial();

  function handleSubmit(values: OrdenEspecialFormValues) {
    if (!data) return;

    mutate(
      {
        ordenEncabezado: {
          idOrdenEspecial,
          nombreCliente: values.nombreCliente.trim(),
          telefonoCliente: values.telefonoCliente.trim(),
          idSucursal: Number(values.idSucursal),
          fechaEntrega: values.fechaEntrega,
          fechaAProducir: values.fechaAProducir,
          idUsuario: data.ordenEncabezado.idUsuario,
        },
        // Los productos que ya existían (traen idDetalle) mandan ese id;
        // los agregados en esta edición van con idDetalleOrdenEspecial: 0
        // — confirmar con el backend si el valor esperado para "nuevo"
        // es 0, null, o si en realidad este endpoint no acepta agregar
        // productos nuevos en la edición.
        ordenDetalle: values.productos.map((p) => ({
          idDetalleOrdenEspecial: p.idDetalle ?? 0,
          idProducto: p.idProducto,
          cantidadUnidades: p.cantidad,
          nombreProducto: p.nombreProducto,
        })),
      },
      {
        onSuccess: () => navigate('/ordenes-especiales', { replace: true }),
      },
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Editar orden especial" backTo="/ordenes-especiales" />

      {isLoading && <Spinner label="Cargando…" />}

      {isError && <ErrorState message={error?.message} onRetry={() => refetch()} />}

      {!isLoading && !isError && !data && (
        <EmptyState
          title="Orden no encontrada"
          description="Puede que ya no exista, o el enlace esté roto."
        />
      )}

      {data && (
        <div className="card">
          <OrdenEspecialForm
            initialValues={{
              nombreCliente: data.ordenEncabezado.nombreCliente,
              telefonoCliente: data.ordenEncabezado.telefonoCliente,
              idSucursal: String(data.ordenEncabezado.idSucursal),
              fechaEntrega: data.ordenEncabezado.fechaEntrega,
              fechaAProducir: data.ordenEncabezado.fechaAProducir,
              productos: data.ordenDetalle.map((d) => ({
                idProducto: d.idProducto,
                nombreProducto: d.nombreProducto,
                cantidad: d.cantidadUnidades,
                idDetalle: d.idDetalleOrdenEspecial,
              })),
            }}
            submitLabel="Guardar cambios"
            isSubmitting={isPending}
            errorMessage={getErrorMessage(mutationError)}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/ordenes-especiales')}
          />
        </div>
      )}
    </div>
  );
}