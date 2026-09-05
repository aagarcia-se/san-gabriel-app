import { useState, type FormEvent } from 'react';
import { LayoutGrid, FileText } from 'lucide-react';
import { IconField } from '@/shared/ui/IconField';

export interface CategoriaFormValues {
  nombreCategoria: string;
  descripcionCategoria: string;
}

interface CategoriaFormProps {
  initialValues?: Partial<CategoriaFormValues>;
  submitLabel: string;
  isSubmitting: boolean;
  errorMessage?: string;
  onSubmit: (values: CategoriaFormValues) => void;
  onCancel: () => void;
}

const EMPTY_VALUES: CategoriaFormValues = {
  nombreCategoria: '',
  descripcionCategoria: '',
};

export function CategoriaForm({
  initialValues,
  submitLabel,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: CategoriaFormProps) {
  const [values, setValues] = useState<CategoriaFormValues>({
    ...EMPTY_VALUES,
    ...initialValues,
  });

  function setField<K extends keyof CategoriaFormValues>(field: K, value: CategoriaFormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="nombreCategoria" className="text-sm font-medium text-ink/80">
          Nombre
        </label>
        <IconField icon={LayoutGrid}>
          <input
            id="nombreCategoria"
            type="text"
            required
            value={values.nombreCategoria}
            onChange={(e) => setField('nombreCategoria', e.target.value)}
            disabled={isSubmitting}
            className="input pl-9"
          />
        </IconField>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="descripcionCategoria" className="text-sm font-medium text-ink/80">
          Descripción
        </label>
        <IconField icon={FileText}>
          <textarea
            id="descripcionCategoria"
            required
            rows={3}
            value={values.descripcionCategoria}
            onChange={(e) => setField('descripcionCategoria', e.target.value)}
            disabled={isSubmitting}
            className="input pl-9 resize-none"
          />
        </IconField>
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