import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useCrearCategoria } from '../api/useCategoriasMutations';
import { PageHeader } from '@/shared/ui/PageHeader';
import { CategoriaForm, type CategoriaFormValues } from './CategoriaForm';

export function CrearCategoriaPage() {
  const navigate = useNavigate();
  const { mutate, isPending, error } = useCrearCategoria();

  function handleSubmit(values: CategoriaFormValues) {
    mutate(
      {
        nombreCategoria: values.nombreCategoria.trim(),
        descripcionCategoria: values.descripcionCategoria.trim(),
        // Se genera acá, en el navegador — el formulario no la pide.
        fechaCreacion: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        onSuccess: () => navigate('/categorias', { replace: true }),
      },
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Nueva categoría" backTo="/categorias" />

      <div className="card">
        <CategoriaForm
          submitLabel="Crear categoría"
          isSubmitting={isPending}
          errorMessage={error?.message}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/categorias')}
        />
      </div>
    </div>
  );
}