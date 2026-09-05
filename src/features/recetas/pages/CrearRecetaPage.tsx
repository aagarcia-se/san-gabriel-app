import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useCrearReceta } from '../api/useRecetaMutations';
import { PageHeader } from '@/shared/ui/PageHeader';
import { RecetaForm, type RecetaFormValues } from './RecetaForm';

export function CrearRecetaPage() {
  const navigate = useNavigate();
  const { mutate, isPending, error } = useCrearReceta();

  function handleSubmit(values: RecetaFormValues) {
    mutate(
      {
        idProducto: Number(values.idProducto),
        detallesReceta: [
          {
            idIngrediente: 1,
            cantidadNecesaria: values.cantidadNecesaria.trim(),
            // Tu ejemplo trae solo fecha, sin hora — a diferencia del
            // resto de la app que usa 'YYYY-MM-DD HH:mm:ss'.
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
      <PageHeader title="Nueva receta" backTo="/recetas" />

      <div className="card">
        <RecetaForm
          submitLabel="Crear receta"
          isSubmitting={isPending}
          errorMessage={error?.message}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/recetas')}
        />
      </div>
    </div>
  );
}