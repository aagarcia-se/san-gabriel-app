import { useState, type FormEvent } from 'react';
import { Building2, MapPin, Phone, Mail, Map } from 'lucide-react';
import { IconField } from '@/shared/ui/IconField';

export interface SucursalFormValues {
  nombreSucursal: string;
  direccionSucursal: string;
  municipioSucursal: string;
  departamentoSucursal: string;
  telefonoSucursal: string;
  correoSucursal: string;
}

interface SucursalFormProps {
  initialValues?: Partial<SucursalFormValues>;
  submitLabel: string;
  isSubmitting: boolean;
  errorMessage?: string;
  onSubmit: (values: SucursalFormValues) => void;
  onCancel: () => void;
}

const EMPTY_VALUES: SucursalFormValues = {
  nombreSucursal: '',
  direccionSucursal: '',
  municipioSucursal: '',
  departamentoSucursal: '',
  telefonoSucursal: '',
  correoSucursal: '',
};

export function SucursalForm({
  initialValues,
  submitLabel,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: SucursalFormProps) {
  const [values, setValues] = useState<SucursalFormValues>({
    ...EMPTY_VALUES,
    ...initialValues,
  });

  function setField<K extends keyof SucursalFormValues>(field: K, value: SucursalFormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="nombreSucursal" className="text-sm font-medium text-ink/80">
          Nombre
        </label>
        <IconField icon={Building2}>
          <input
            id="nombreSucursal"
            type="text"
            required
            value={values.nombreSucursal}
            onChange={(e) => setField('nombreSucursal', e.target.value)}
            disabled={isSubmitting}
            className="input pl-9"
          />
        </IconField>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="direccionSucursal" className="text-sm font-medium text-ink/80">
          Dirección
        </label>
        <IconField icon={MapPin}>
          <input
            id="direccionSucursal"
            type="text"
            required
            value={values.direccionSucursal}
            onChange={(e) => setField('direccionSucursal', e.target.value)}
            disabled={isSubmitting}
            className="input pl-9"
          />
        </IconField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="municipioSucursal" className="text-sm font-medium text-ink/80">
            Municipio
          </label>
          <IconField icon={Map}>
            <input
              id="municipioSucursal"
              type="text"
              required
              value={values.municipioSucursal}
              onChange={(e) => setField('municipioSucursal', e.target.value)}
              disabled={isSubmitting}
              className="input pl-9"
            />
          </IconField>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="departamentoSucursal" className="text-sm font-medium text-ink/80">
            Departamento
          </label>
          <IconField icon={Map}>
            <input
              id="departamentoSucursal"
              type="text"
              required
              value={values.departamentoSucursal}
              onChange={(e) => setField('departamentoSucursal', e.target.value)}
              disabled={isSubmitting}
              className="input pl-9"
            />
          </IconField>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="telefonoSucursal" className="text-sm font-medium text-ink/80">
            Teléfono
          </label>
          <IconField icon={Phone}>
            <input
              id="telefonoSucursal"
              type="tel"
              required
              value={values.telefonoSucursal}
              onChange={(e) => setField('telefonoSucursal', e.target.value)}
              disabled={isSubmitting}
              className="input pl-9"
            />
          </IconField>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="correoSucursal" className="text-sm font-medium text-ink/80">
            Correo
          </label>
          <IconField icon={Mail}>
            <input
              id="correoSucursal"
              type="email"
              required
              value={values.correoSucursal}
              onChange={(e) => setField('correoSucursal', e.target.value)}
              disabled={isSubmitting}
              className="input pl-9"
            />
          </IconField>
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
