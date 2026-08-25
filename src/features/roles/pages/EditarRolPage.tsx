import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRoles, useRolPermisos } from '../api/useRoles';
import {
  useActualizarRol,
  useEliminarRolPermisosBatch,
  useIngresarPermisosBatch,
} from '../api/useRolMutations';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryClient';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { RolForm, type RolFormValues } from './RolForm';
import type { ApiError } from '@/shared/api/httpClient';

export function EditarRolPage() {
  const { idRol: idRolParam } = useParams<{ idRol: string }>();
  const idRol = Number(idRolParam);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: roles, isLoading, isError, error, refetch } = useRoles();
  const rol = roles?.find((r) => r.idRol === idRol);

  const {
    data: rolPermisos,
    isLoading: isLoadingPermisos,
    isError: isPermisosError,
  } = useRolPermisos(idRol);

  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();

  const actualizarRol = useActualizarRol();
  const ingresarPermisosBatch = useIngresarPermisosBatch();
  const eliminarRolPermisosBatch = useEliminarRolPermisosBatch();

  async function handleSubmit(values: RolFormValues) {
    setSubmitError(undefined);
    setIsSaving(true);
    try {
      await actualizarRol.mutateAsync({
        idRol,
        nombreRol: values.nombreRol.trim(),
        descripcionRol: values.descripcionRol.trim(),
      });

      const original = rolPermisos?.permisos ?? [];
      const aAgregar = values.permisoIds.filter((id) => !original.includes(id));
      const aQuitar = original.filter((id) => !values.permisoIds.includes(id));

      if (aAgregar.length > 0) {
        await ingresarPermisosBatch.mutateAsync(aAgregar.map((idPermiso) => ({ idRol, idPermiso })));
      }
      if (aQuitar.length > 0) {
        await eliminarRolPermisosBatch.mutateAsync(
          aQuitar.map((idPermiso) => ({ idRol, idPermiso })),
        );
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.roles.permisos(idRol) });
      navigate('/users/roles', { replace: true });
    } catch (err) {
      setSubmitError((err as ApiError).message ?? 'No se pudo guardar el rol.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Editar rol" backTo="/users/roles" />

      {(isLoading || isLoadingPermisos) && <Spinner label="Cargando…" />}

      {isError && <ErrorState message={error?.message} onRetry={() => refetch()} />}

      {!isLoading && !isError && !rol && (
        <EmptyState
          title="Rol no encontrado"
          description="Puede que ya no exista, o el enlace esté roto."
        />
      )}

      {isPermisosError && (
        <p className="text-sm text-danger-600 dark:text-danger-400">
          No se pudieron cargar los permisos actuales de este rol.
        </p>
      )}

      {rol && !isLoadingPermisos && (
        <div className="card">
          <RolForm
            initialValues={{
              nombreRol: rol.nombreRol,
              descripcionRol: rol.descripcionRol,
              permisoIds: rolPermisos?.permisos ?? [],
            }}
            submitLabel="Guardar cambios"
            isSubmitting={isSaving}
            errorMessage={submitError}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/users/roles')}
          />
        </div>
      )}
    </div>
  );
}
