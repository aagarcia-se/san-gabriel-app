import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { useReceta } from '../api/useRecetas';
import { useActualizarReceta } from '../api/useRecetaMutations';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { RecetaForm, type RecetaFormValues } from './RecetaForm';

export function EditarRecetaPage() {
  const { idProducto: idProductoParam } = useParams<{ idProducto: string }>();
  const idProducto = Number(idProductoParam);
  const navigate = useNavigate();

  const { data: recetas, isLoading, isError, error, refetch } = useReceta();

  // Mismo criterio que en RecetasPage: como cada producto puede tener
  // varias líneas de ingrediente pero hoy solo manejamos Harina, se
  // edita la primera línea de ese producto. Si en el futuro una receta
  // tiene varios ingredientes, este form necesita convertirse en una
  // lista editable en vez de una sola línea.
  const lineasDelProducto = useMemo(
    () => recetas?.filter((r) => r.idProducto === idProducto) ?? [],
    [recetas, idProducto],
  );
  const primeraLinea = lineasDelProducto[0];

  const { mutate, isPending, error: mutationError } = useActualizarReceta();

  function handleSubmit(values: RecetaFormValues) {
    if (!primeraLinea) return;
    mutate(
      {
        idProducto: Number(values.idProducto),
        detallesReceta: [
          {
            idIngrediente: 1,
            cantidadNecesaria: values.cantidadNecesaria.trim(),
            fechaCreacion: dayjs().format('YYYY-MM-DD'),
          },
        ],
      },
      {
        onSuccess: () => navigate('/recetas', { replace: true }),
      },
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Editar receta" backTo="/recetas" />

      {isLoading && <Spinner label="Cargando…" />}

      {isError && <ErrorState message={error?.message} onRetry={() => refetch()} />}

      {!isLoading && !isError && !primeraLinea && (
        <EmptyState
          title="Receta no encontrada"
          description="Puede que ya no exista, o el enlace esté roto."
        />
      )}

      {primeraLinea && (
        <div className="card">
          <RecetaForm
            initialValues={{
              idProducto: String(primeraLinea.idProducto),
              cantidadNecesaria: String(primeraLinea.cantidadNecesaria),
              unidadMedida: primeraLinea.unidadMedida,
            }}
            submitLabel="Guardar cambios"
            isSubmitting={isPending}
            errorMessage={mutationError?.message}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/recetas')}
          />
        </div>
      )}
    </div>
  );
}
