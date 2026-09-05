import { useNavigate, useParams } from 'react-router-dom';
import { useCategorias } from '../api/useCategorias';
import { useActualizarCategoria } from '../api/useCategoriasMutations';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { CategoriaForm, type CategoriaFormValues } from './CategoriaForm';

export function EditarCategoriaPage() {
  const { idCategoria } = useParams<{ idCategoria: string }>();
  const navigate = useNavigate();

  const { data: categorias, isLoading, isError, error, refetch } = useCategorias();
  const categoria = categorias?.find((c) => c.idCategoria === Number(idCategoria));

  const { mutate, isPending, error: mutationError } = useActualizarCategoria();

  function handleSubmit(values: CategoriaFormValues) {
    if (!categoria) return;
    mutate(
      {
        idCategoria: categoria.idCategoria,
        nombreCategoria: values.nombreCategoria.trim(),
        descripcionCategoria: values.descripcionCategoria.trim(),
      },
      {
        onSuccess: () => navigate('/categorias', { replace: true }),
      },
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Editar categoría" backTo="/categorias" />

      {isLoading && <Spinner label="Cargando…" />}

      {isError && <ErrorState message={error?.message} onRetry={() => refetch()} />}

      {!isLoading && !isError && !categoria && (
        <EmptyState
          title="Categoría no encontrada"
          description="Puede que ya no exista, o el enlace esté roto."
        />
      )}

      {categoria && (
        <div className="card">
          <CategoriaForm
            initialValues={{
              nombreCategoria: categoria.nombreCategoria,
              descripcionCategoria: categoria.descripcionCategoria,
            }}
            submitLabel="Guardar cambios"
            isSubmitting={isPending}
            errorMessage={mutationError?.message}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/categorias')}
          />
        </div>
      )}
    </div>
  );
}