import { useState } from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useIngresarRol, useIngresarPermisosBatch } from '../api/useRolMutations';
import { PageHeader } from '@/shared/ui/PageHeader';
import { RolForm, type RolFormValues } from './RolForm';
import type { ApiError } from '@/shared/api/httpClient';

export function CrearRolPage() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();

  const ingresarRol = useIngresarRol();
  const ingresarPermisosBatch = useIngresarPermisosBatch();

  async function handleSubmit(values: RolFormValues) {
    setSubmitError(undefined);
    setIsSaving(true);
    try {
      const { idRol } = await ingresarRol.mutateAsync({
        nombreRol: values.nombreRol.trim(),
        descripcionRol: values.descripcionRol.trim(),
        // Se genera acá, en el navegador — el formulario no la pide.
        fechaCreacion: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      });

      if (values.permisoIds.length > 0) {
        await ingresarPermisosBatch.mutateAsync(
          values.permisoIds.map((idPermiso) => ({ idRol, idPermiso })),
        );
      }

      navigate('/users/roles', { replace: true });
    } catch (err) {
      setSubmitError((err as ApiError).message ?? 'No se pudo crear el rol.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Nuevo rol" backTo="/users/roles" />

      <div className="card">
        <RolForm
          submitLabel="Crear rol"
          isSubmitting={isSaving}
          errorMessage={submitError}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/users/roles')}
        />
      </div>
    </div>
  );
}
