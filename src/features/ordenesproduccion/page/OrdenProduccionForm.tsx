import { useRef, useState, type DragEvent, type FormEvent, type MouseEvent } from 'react';
import dayjs from 'dayjs';
import { Building2, CalendarDays, Upload, User, X } from 'lucide-react';
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

function esArchivoCsv(file: File): boolean {
  // Algunos SO/navegadores no setean un mimeType consistente para CSV,
  // así que validamos por extensión y, si existe, por mimeType.
  const tieneExtensionCsv = file.name.toLowerCase().endsWith('.csv');
  const mimeValido =
    file.type === '' ||
    file.type === 'text/csv' ||
    file.type === 'application/vnd.ms-excel';
  return tieneExtensionCsv && mimeValido;
}

export function OrdenProduccionForm({
  submitLabel,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: OrdenProduccionFormProps) {
  const [values, setValues] = useState<OrdenProduccionFormValues>(EMPTY_VALUES);
  const [archivoError, setArchivoError] = useState<string | undefined>();
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function aplicarArchivo(file: File | null) {
    if (!file) {
      setField('archivo', null);
      return;
    }
    if (!esArchivoCsv(file)) {
      setArchivoError('Solo se permiten archivos con extensión .csv');
      return;
    }
    setArchivoError(undefined);
    setField('archivo', file);
  }

  function handleDragEnter(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (isSubmitting) return;
    dragCounter.current += 1;
    if (e.dataTransfer.types.includes('Files')) {
      setIsDraggingOver(true);
    }
  }

  function handleDragOver(e: DragEvent<HTMLLabelElement>) {
    // Necesario en dragover (no solo dragenter) para que el navegador permita el drop.
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDragLeave(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) {
      setIsDraggingOver(false);
    }
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDraggingOver(false);
    if (isSubmitting) return;

    const file = e.dataTransfer.files?.[0] ?? null;
    aplicarArchivo(file);
  }

  function handleRemoveArchivo(e: MouseEvent<HTMLButtonElement>) {
    // Evita que el click "burbujee" al <label> y vuelva a abrir el selector de archivos.
    e.preventDefault();
    e.stopPropagation();
    aplicarArchivo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={
            isDraggingOver
              ? 'flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-brand-500 bg-brand-500/10 px-4 py-6 text-center text-sm text-brand-600 transition-colors dark:text-brand-400'
              : values.archivo
                ? 'flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm text-ink transition-colors hover:bg-surface-2/70'
                : 'flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted transition-colors hover:bg-surface-2'
          }
        >
          <Upload className={isDraggingOver ? 'h-5 w-5 shrink-0' : 'h-4 w-4 shrink-0'} />
          {values.archivo ? (
            <>
              <span className="min-w-0 flex-1 truncate text-left">{values.archivo.name}</span>
              <button
                type="button"
                onClick={handleRemoveArchivo}
                disabled={isSubmitting}
                aria-label="Quitar archivo"
                className="shrink-0 rounded-full p-1 text-muted transition-colors hover:bg-danger-500/10 hover:text-danger-600 dark:hover:text-danger-400"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : isDraggingOver ? (
            <span>Suelta el archivo aquí</span>
          ) : (
            <span>
              Arrastra el archivo CSV aquí o{' '}
              <span className="font-medium text-brand-600 dark:text-brand-400">
                haz clic para seleccionarlo
              </span>
            </span>
          )}
        </label>
        <input
          ref={fileInputRef}
          id="archivo"
          type="file"
          accept=".csv"
          className="hidden"
          disabled={isSubmitting}
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            aplicarArchivo(file);
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