import { useState, type FormEvent } from 'react';
import dayjs from 'dayjs';
import { Building2, CalendarDays, Upload, User } from 'lucide-react';
import { useSucursales } from '@/features/sucursales/api/useSucursales';
import { IconField } from '@/shared/ui/IconField';
import type { TurnoProduccion } from '../types/ordenesProduccion.types';

export interface OrdenProduccionFormValues {
  idSucursal: string;
  nombrePanadero: string;
  fechaAProducir: string;
  ordenTurno: TurnoProduccion;
  archivo: File | null;
}

interface OrdenProduccionFormProps {
  submitLabel: string;
  isSubmitting: boolean;
  errorMessage?: string;
  onSubmit: (values: OrdenProduccionFormValues) => void;
  onCancel: () => void;
}

// La orden siempre es para el día siguiente al de hoy, no para hoy.
const FECHA_MANANA = dayjs().add(1, 'day').format('YYYY-MM-DD');

const EMPTY_VALUES: OrdenProduccionFormValues = {
  idSucursal: '',
  nombrePanadero: '',
  fechaAProducir: FECHA_MANANA,
  ordenTurno: 'AM',
  archivo: null,
};

export function OrdenProduccionForm({
  submitLabel,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: OrdenProduccionFormProps) {
  const [values, setValues] = useState<OrdenProduccionFormValues>(EMPTY_VALUES);
  const [archivoError, setArchivoError] = useState<string | undefined>();

  const {
    data: sucursales,
    isLoading: isLoadingSucursales,
    isError: isSucursalesError,
  } = useSucursales();

  function setField<K extends keyof OrdenProduccionFormValues>(
    field: K,
    value: OrdenProduccionFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!values.archivo) {
      setArchivoError('Adjunta el archivo CSV con los productos a producir.');
      return;
    }
    setArchivoError(undefined);
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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

      <div className="space-y-1.5">
        <label htmlFor="nombrePanadero" className="text-sm font-medium text-ink/80">
          Nombre del panadero
        </label>
        <IconField icon={User}>
          <input
            id="nombrePanadero"
            type="text"
            required
            value={values.nombrePanadero}
            onChange={(e) => setField('nombrePanadero', e.target.value)}
            disabled={isSubmitting}
            className="input pl-9"
          />
        </IconField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="fechaAProducir" className="text-sm font-medium text-ink/80">
            Fecha a producir
          </label>
          <IconField icon={CalendarDays}>
            <input
              id="fechaAProducir"
              type="date"
              required
              min={FECHA_MANANA}
              value={values.fechaAProducir}
              onChange={(e) => setField('fechaAProducir', e.target.value)}
              disabled={isSubmitting}
              className="input pl-9"
            />
          </IconField>
          <p className="text-xs text-muted">Por defecto, mañana.</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink/80">Turno</label>
          <div className="flex gap-2">
            {(['AM', 'PM'] as const).map((turno) => (
              <button
                key={turno}
                type="button"
                disabled={isSubmitting}
                onClick={() => setField('ordenTurno', turno)}
                className={
                  values.ordenTurno === turno
                    ? 'flex-1 rounded-lg border border-brand-500 bg-brand-500/10 px-3 py-2 text-sm font-medium text-brand-600 dark:text-brand-400'
                    : 'flex-1 rounded-lg border border-line px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-ink'
                }
              >
                {turno}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="archivo" className="text-sm font-medium text-ink/80">
          Archivo CSV
        </label>
        <label
          htmlFor="archivo"
          className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-line px-4 py-3 text-sm text-muted transition-colors hover:bg-surface-2"
        >
          <Upload className="h-4 w-4 shrink-0" />
          {values.archivo ? values.archivo.name : 'Selecciona el archivo CSV de la orden'}
        </label>
        <input
          id="archivo"
          type="file"
          accept=".csv"
          className="hidden"
          disabled={isSubmitting}
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            setField('archivo', file);
            if (file) setArchivoError(undefined);
          }}
        />
        {archivoError && (
          <p className="text-xs text-danger-600 dark:text-danger-400">{archivoError}</p>
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