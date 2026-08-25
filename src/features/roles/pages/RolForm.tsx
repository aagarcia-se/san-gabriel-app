import { useState, type FormEvent } from 'react';
import { Shield } from 'lucide-react';
import { usePermisos } from '@/features/permisos/api/usePermisos';
import { IconField } from '@/shared/ui/IconField';
import { Spinner } from '@/shared/ui/Spinner';

export interface RolFormValues {
  nombreRol: string;
  descripcionRol: string;
  permisoIds: number[];
}

interface RolFormProps {
  initialValues?: Partial<RolFormValues>;
  submitLabel: string;
  isSubmitting: boolean;
  errorMessage?: string;
  onSubmit: (values: RolFormValues) => void;
  onCancel: () => void;
}

const EMPTY_VALUES: RolFormValues = {
  nombreRol: '',
  descripcionRol: '',
  permisoIds: [],
};

export function RolForm({
  initialValues,
  submitLabel,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: RolFormProps) {
  const [values, setValues] = useState<RolFormValues>({
    ...EMPTY_VALUES,
    ...initialValues,
    permisoIds: initialValues?.permisoIds ?? [],
  });

  const { data: permisos, isLoading: isLoadingPermisos, isError: isPermisosError } = usePermisos();

  function setField<K extends keyof RolFormValues>(field: K, value: RolFormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function togglePermiso(idPermiso: number) {
    setValues((prev) => ({
      ...prev,
      permisoIds: prev.permisoIds.includes(idPermiso)
        ? prev.permisoIds.filter((id) => id !== idPermiso)
        : [...prev.permisoIds, idPermiso],
    }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="nombreRol" className="text-sm font-medium text-ink/80">
          Nombre
        </label>
        <IconField icon={Shield}>
          <input
            id="nombreRol"
            type="text"
            required
            value={values.nombreRol}
            onChange={(e) => setField('nombreRol', e.target.value)}
            disabled={isSubmitting}
            className="input pl-9"
          />
        </IconField>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="descripcionRol" className="text-sm font-medium text-ink/80">
          Descripción
        </label>
        <textarea
          id="descripcionRol"
          required
          rows={2}
          value={values.descripcionRol}
          onChange={(e) => setField('descripcionRol', e.target.value)}
          disabled={isSubmitting}
          className="input resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-ink/80">Permisos</p>

        {isLoadingPermisos && <Spinner label="Cargando permisos…" />}

        {isPermisosError && (
          <p className="text-xs text-danger-600 dark:text-danger-400">
            No se pudo cargar la lista de permisos.
          </p>
        )}

        {permisos && permisos.length > 0 && (
          <div className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-line p-2">
            {permisos.map((permiso) => (
              <label
                key={permiso.idPermiso}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-2"
              >
                <input
                  type="checkbox"
                  checked={values.permisoIds.includes(permiso.idPermiso)}
                  onChange={() => togglePermiso(permiso.idPermiso)}
                  disabled={isSubmitting}
                  className="h-4 w-4 shrink-0 rounded border-line text-brand-600 focus:ring-brand-500/30"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ink">{permiso.nombrePermiso}</span>
                  <span className="block truncate font-mono text-xs text-muted">
                    {permiso.rutaAcceso}
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {errorMessage && (
        <p
          role="alert"
          className="rounded-lg bg-danger-500/10 px-3 py-2 text-sm text-danger-600 dark:text-danger-400"
        >
          {errorMessage}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="btn-secondary">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Guardando…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
