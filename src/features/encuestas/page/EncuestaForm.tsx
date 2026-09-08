import { useState, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, CalendarDays, FileText, Plus, Trash2 } from 'lucide-react';
import { IconField } from '@/shared/ui/IconField';
import { cn } from '@/shared/lib/cn';
import type { TipoEncuesta, TipoPregunta } from '../types/encuestas.types';

interface PreguntaFormValue {
  localId: string;
  tipo: TipoPregunta;
  pregunta: string;
  obligatoria: boolean;
}

export interface EncuestaFormValues {
    nombreCampania: string;
    descripcion: string;
    fechaInicio: string;
    fechaFin: string;
    tipoEncuesta: TipoEncuesta;
    urlEncuesta: string; // 👈 agregado
    preguntas: PreguntaFormValue[];
  }

interface EncuestaFormProps {
  initialValues?: Partial<EncuestaFormValues>;
  submitLabel: string;
  isSubmitting: boolean;
  errorMessage?: string;
  onSubmit: (values: EncuestaFormValues) => void;
  onCancel: () => void;
}

function nuevaPregunta(): PreguntaFormValue {
  return {
    localId: crypto.randomUUID(),
    tipo: 'pregunta',
    pregunta: '',
    obligatoria: true,
  };
}

const EMPTY_VALUES: EncuestaFormValues = {
    nombreCampania: '',
    descripcion: '',
    fechaInicio: new Date().toISOString().slice(0, 10),
    fechaFin: '',
    tipoEncuesta: 'online',
    urlEncuesta: '', // 👈 agregado
    preguntas: [nuevaPregunta()],
  };

export function EncuestaForm({
  initialValues,
  submitLabel,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: EncuestaFormProps) {
  const [values, setValues] = useState<EncuestaFormValues>({
    ...EMPTY_VALUES,
    ...initialValues,
    preguntas: initialValues?.preguntas?.length ? initialValues.preguntas : [nuevaPregunta()],
  });
  const [preguntasError, setPreguntasError] = useState<string | undefined>();

  function setField<K extends keyof EncuestaFormValues>(field: K, value: EncuestaFormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function updatePregunta(localId: string, changes: Partial<PreguntaFormValue>) {
    setValues((prev) => ({
      ...prev,
      preguntas: prev.preguntas.map((p) => (p.localId === localId ? { ...p, ...changes } : p)),
    }));
  }

  function addPregunta() {
    setValues((prev) => ({ ...prev, preguntas: [...prev.preguntas, nuevaPregunta()] }));
  }

  function removePregunta(localId: string) {
    setValues((prev) => ({
      ...prev,
      preguntas: prev.preguntas.filter((p) => p.localId !== localId),
    }));
  }

  function movePregunta(index: number, direction: -1 | 1) {
    setValues((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.preguntas.length) return prev;
      const preguntas = [...prev.preguntas];
      [preguntas[index], preguntas[target]] = [preguntas[target], preguntas[index]];
      return { ...prev, preguntas };
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const preguntasValidas = values.preguntas.every((p) => p.pregunta.trim().length > 0);
    if (values.preguntas.length === 0 || !preguntasValidas) {
      setPreguntasError('Agrega al menos una pregunta y completa el texto de cada una.');
      return;
    }
    setPreguntasError(undefined);
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="nombreCampania" className="text-sm font-medium text-ink/80">
          Nombre de la encuesta
        </label>
        <IconField icon={FileText}>
          <input
            id="nombreCampania"
            type="text"
            required
            value={values.nombreCampania}
            onChange={(e) => setField('nombreCampania', e.target.value)}
            disabled={isSubmitting}
            className="input pl-9"
          />
        </IconField>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="descripcion" className="text-sm font-medium text-ink/80">
          Descripción
        </label>
        <textarea
          id="descripcion"
          required
          rows={3}
          value={values.descripcion}
          onChange={(e) => setField('descripcion', e.target.value)}
          disabled={isSubmitting}
          className="input resize-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="fechaInicio" className="text-sm font-medium text-ink/80">
            Fecha de inicio
          </label>
          <IconField icon={CalendarDays}>
            <input
              id="fechaInicio"
              type="date"
              required
              value={values.fechaInicio}
              onChange={(e) => setField('fechaInicio', e.target.value)}
              disabled={isSubmitting}
              className="input pl-9"
            />
          </IconField>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="fechaFin" className="text-sm font-medium text-ink/80">
            Fecha de finalización
          </label>
          <IconField icon={CalendarDays}>
            <input
              id="fechaFin"
              type="date"
              required
              value={values.fechaFin}
              onChange={(e) => setField('fechaFin', e.target.value)}
              disabled={isSubmitting}
              className="input pl-9"
            />
          </IconField>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-ink/80">Tipo de encuesta</label>
        <div className="flex gap-2">
          {(['online', 'presencial'] as const).map((tipo) => (
            <button
              key={tipo}
              type="button"
              disabled={isSubmitting}
              onClick={() => setField('tipoEncuesta', tipo)}
              className={cn(
                'flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors',
                values.tipoEncuesta === tipo
                  ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400'
                  : 'border-line text-muted hover:bg-surface-2 hover:text-ink',
              )}
            >
              {tipo}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-line p-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-ink/80">Preguntas</p>
          <button
            type="button"
            onClick={addPregunta}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 transition-colors hover:text-brand-500 dark:text-brand-400"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar
          </button>
        </div>

        <div className="space-y-3">
          {values.preguntas.map((pregunta, index) => (
            <div key={pregunta.localId} className="space-y-2 rounded-lg border border-line p-3">
              <div className="flex items-start gap-2">
                <span className="mt-2.5 shrink-0 text-xs text-muted">#{index + 1}</span>
                <div className="flex-1 space-y-2">
                  <textarea
                    rows={2}
                    placeholder="Texto de la pregunta"
                    value={pregunta.pregunta}
                    onChange={(e) => updatePregunta(pregunta.localId, { pregunta: e.target.value })}
                    disabled={isSubmitting}
                    className="input resize-none"
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={pregunta.tipo}
                      onChange={(e) =>
                        updatePregunta(pregunta.localId, {
                          tipo: e.target.value as TipoPregunta,
                        })
                      }
                      disabled={isSubmitting}
                      className="input w-auto"
                    >
                      <option value="pregunta">Opción múltiple</option>
                      <option value="texto">Texto libre</option>
                    </select>

                    <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                      <input
                        type="checkbox"
                        checked={pregunta.obligatoria}
                        onChange={(e) =>
                          updatePregunta(pregunta.localId, { obligatoria: e.target.checked })
                        }
                        disabled={isSubmitting}
                        className="h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-500/30"
                      />
                      Obligatoria
                    </label>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    aria-label="Subir"
                    disabled={isSubmitting || index === 0}
                    onClick={() => movePregunta(index, -1)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Bajar"
                    disabled={isSubmitting || index === values.preguntas.length - 1}
                    onClick={() => movePregunta(index, 1)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Eliminar pregunta"
                    disabled={isSubmitting}
                    onClick={() => removePregunta(pregunta.localId)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-500/10 hover:text-danger-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:text-danger-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {preguntasError && (
          <p className="text-xs text-danger-600 dark:text-danger-400">{preguntasError}</p>
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