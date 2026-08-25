import { useState, type FormEvent } from 'react';
import { User, Mail, Building2, Shield } from 'lucide-react';
import { useSucursales } from '@/features/sucursales/api/useSucursales';
import { useRoles } from '@/features/roles/api/useRoles';
import { IconField } from '@/shared/ui/IconField';

export interface UsuarioFormValues {
  nombreUsuario: string;
  apellidoUsuario: string;
  correoUsuario: string;
  idRol: string;
  idSucursal: string;
}

interface UsuarioFormProps {
  initialValues?: Partial<UsuarioFormValues>;
  submitLabel: string;
  isSubmitting: boolean;
  errorMessage?: string;
  onSubmit: (values: UsuarioFormValues) => void;
  onCancel: () => void;
}

const EMPTY_VALUES: UsuarioFormValues = {
  nombreUsuario: '',
  apellidoUsuario: '',
  correoUsuario: '',
  idRol: '',
  idSucursal: '',
};

export function UsuarioForm({
  initialValues,
  submitLabel,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: UsuarioFormProps) {
  const [values, setValues] = useState<UsuarioFormValues>({
    ...EMPTY_VALUES,
    ...initialValues,
  });

  const {
    data: sucursales,
    isLoading: isLoadingSucursales,
    isError: isSucursalesError,
  } = useSucursales();

  const { data: roles, isLoading: isLoadingRoles, isError: isRolesError } = useRoles();

  function setField<K extends keyof UsuarioFormValues>(field: K, value: UsuarioFormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="nombreUsuario" className="text-sm font-medium text-ink/80">
            Nombre
          </label>
          <IconField icon={User}>
            <input
              id="nombreUsuario"
              type="text"
              required
              value={values.nombreUsuario}
              onChange={(e) => setField('nombreUsuario', e.target.value)}
              disabled={isSubmitting}
              className="input pl-9"
            />
          </IconField>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="apellidoUsuario" className="text-sm font-medium text-ink/80">
            Apellido
          </label>
          <IconField icon={User}>
            <input
              id="apellidoUsuario"
              type="text"
              required
              value={values.apellidoUsuario}
              onChange={(e) => setField('apellidoUsuario', e.target.value)}
              disabled={isSubmitting}
              className="input pl-9"
            />
          </IconField>
        </div>
      </div>

      {initialValues?.nombreUsuario !== undefined && (
        <p className="-mt-2 text-xs text-muted">
          Separamos el nombre completo automáticamente — verifica que nombre y apellido queden
          correctos antes de guardar.
        </p>
      )}

      <div className="space-y-1.5">
        <label htmlFor="correoUsuario" className="text-sm font-medium text-ink/80">
          Correo
        </label>
        <IconField icon={Mail}>
          <input
            id="correoUsuario"
            type="email"
            required
            value={values.correoUsuario}
            onChange={(e) => setField('correoUsuario', e.target.value)}
            disabled={isSubmitting}
            className="input pl-9"
          />
        </IconField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="idRol" className="text-sm font-medium text-ink/80">
            Rol
          </label>
          {isRolesError ? (
            <>
              <input
                id="idRol"
                type="number"
                min={1}
                required
                value={values.idRol}
                onChange={(e) => setField('idRol', e.target.value)}
                disabled={isSubmitting}
                className="input"
              />
              <p className="text-xs text-danger-600 dark:text-danger-400">
                No se pudo cargar la lista de roles — escribe el ID a mano.
              </p>
            </>
          ) : (
            <IconField icon={Shield}>
              <select
                id="idRol"
                required
                value={values.idRol}
                onChange={(e) => setField('idRol', e.target.value)}
                disabled={isSubmitting || isLoadingRoles}
                className="input pl-9"
              >
                <option value="" disabled>
                  {isLoadingRoles ? 'Cargando…' : 'Selecciona un rol'}
                </option>
                {roles?.map((rol) => (
                  <option key={rol.idRol} value={rol.idRol}>
                    {rol.nombreRol}
                  </option>
                ))}
              </select>
            </IconField>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="idSucursal" className="text-sm font-medium text-ink/80">
            Sucursal
          </label>
          {isSucursalesError ? (
            <>
              <input
                id="idSucursal"
                type="number"
                min={1}
                required
                value={values.idSucursal}
                onChange={(e) => setField('idSucursal', e.target.value)}
                disabled={isSubmitting}
                className="input"
              />
              <p className="text-xs text-danger-600 dark:text-danger-400">
                No se pudo cargar la lista de sucursales — escribe el ID a mano.
              </p>
            </>
          ) : (
            <IconField icon={Building2}>
              <select
                id="idSucursal"
                required
                value={values.idSucursal}
                onChange={(e) => setField('idSucursal', e.target.value)}
                disabled={isSubmitting || isLoadingSucursales}
                className="input pl-9"
              >
                <option value="" disabled>
                  {isLoadingSucursales ? 'Cargando…' : 'Selecciona una sucursal'}
                </option>
                {sucursales?.map((sucursal) => (
                  <option key={sucursal.idSucursal} value={sucursal.idSucursal}>
                    {sucursal.nombreSucursal}
                  </option>
                ))}
              </select>
            </IconField>
          )}
        </div>
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
