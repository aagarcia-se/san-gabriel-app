import { useState, type FormEvent } from 'react';
import { Croissant, Layers, Package, CalendarDays, Coins, Hash } from 'lucide-react';
import { IconField } from '@/shared/ui/IconField';
import { cn } from '@/shared/lib/cn';
import { computePrecioPorUnidad, type ControlType } from '../lib/productoHelpers';
import type { TipoProduccion } from '../types/producto.types';
import { useCategorias } from '@/features/categorias/api/useCategorias';

export interface ProductoFormValues {
  nombreProducto: string;
  idCategoria: string;
  controlType: ControlType;
  controlarInventario: boolean;
  tipoProduccion: TipoProduccion;
  unidadesPorBandeja: string;
  cantidad: string;
  precio: string;
  fechaInicio: string;
  fechaFin: string; // '' = sin fecha de cierre (null)
}

interface ProductoFormProps {
  initialValues?: Partial<ProductoFormValues>;
  submitLabel: string;
  isSubmitting: boolean;
  errorMessage?: string;
  onSubmit: (values: ProductoFormValues) => void;
  onCancel: () => void;
}

const EMPTY_VALUES: ProductoFormValues = {
  nombreProducto: '',
  idCategoria: '',
  controlType: 'ninguno',
  controlarInventario: false,
  tipoProduccion: 'harina',
  unidadesPorBandeja: '',
  cantidad: '',
  precio: '',
  fechaInicio: new Date().toISOString().slice(0, 10),
  fechaFin: '',
};

const CONTROL_OPTIONS: { value: ControlType; label: string }[] = [
  { value: 'ninguno', label: 'Ninguno' },
  { value: 'stock', label: 'Stock' },
  { value: 'stockDiario', label: 'Stock diario' },
];

export function ProductoForm({
  initialValues,
  submitLabel,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: ProductoFormProps) {
  const [values, setValues] = useState<ProductoFormValues>({
    ...EMPTY_VALUES,
    ...initialValues,
  });

  const {
    data: categorias,
    isLoading: isLoadingCategorias,
    isError: isCategoriasError,
  } = useCategorias();

  function setField<K extends keyof ProductoFormValues>(field: K, value: ProductoFormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  const precioPorUnidad = computePrecioPorUnidad(values.cantidad, values.precio);

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="nombreProducto" className="text-sm font-medium text-ink/80">
            Nombre
          </label>
          <IconField icon={Croissant}>
            <input
              id="nombreProducto"
              type="text"
              required
              value={values.nombreProducto}
              onChange={(e) => setField('nombreProducto', e.target.value)}
              disabled={isSubmitting}
              className="input pl-9"
            />
          </IconField>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="idCategoria" className="text-sm font-medium text-ink/80">
            Categoría
          </label>
          {isCategoriasError ? (
            <>
              <input
                id="idCategoria"
                type="number"
                min={1}
                required
                value={values.idCategoria}
                onChange={(e) => setField('idCategoria', e.target.value)}
                disabled={isSubmitting}
                className="input"
              />
              <p className="text-xs text-danger-600 dark:text-danger-400">
                No se pudo cargar la lista de categorías — escribe el ID a mano.
              </p>
            </>
          ) : (
            <IconField icon={Layers}>
              <select
                id="idCategoria"
                required
                value={values.idCategoria}
                onChange={(e) => setField('idCategoria', e.target.value)}
                disabled={isSubmitting || isLoadingCategorias}
                className="input pl-9"
              >
                <option value="" disabled>
                  {isLoadingCategorias ? 'Cargando…' : 'Selecciona una categoría'}
                </option>
                {categorias?.map((categoria) => (
                  <option key={categoria.idCategoria} value={categoria.idCategoria}>
                    {categoria.nombreCategoria}
                  </option>
                ))}
              </select>
            </IconField>
          )}
        </div>
      </div>

      <div className="space-y-2 rounded-xl border border-line p-3">
        <p className="text-sm font-medium text-ink/80">Control de stock</p>
        <p className="text-xs text-muted">Solo una de las dos opciones puede estar activa.</p>
        <div className="flex gap-2">
          {CONTROL_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={isSubmitting}
              onClick={() => setField('controlType', option.value)}
              className={cn(
                'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                values.controlType === option.value
                  ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400'
                  : 'border-line text-muted hover:bg-surface-2 hover:text-ink',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 pt-2">
          <input
            type="checkbox"
            checked={values.controlarInventario}
            onChange={(e) => setField('controlarInventario', e.target.checked)}
            disabled={isSubmitting}
            className="h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-500/30"
          />
          <span className="text-sm text-ink">Controlar inventario</span>
        </label>
        <p className="pl-6 text-xs text-muted">Independiente del control de stock de arriba.</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="tipoProduccion" className="text-sm font-medium text-ink/80">
          Tipo de producción
        </label>
        <IconField icon={Package}>
          <select
            id="tipoProduccion"
            value={values.tipoProduccion}
            onChange={(e) => setField('tipoProduccion', e.target.value as TipoProduccion)}
            disabled={isSubmitting}
            className="input pl-9"
          >
            <option value="harina">Harina</option>
            <option value="bandejas">Bandejas</option>
          </select>
        </IconField>
      </div>

      {values.tipoProduccion === 'bandejas' && (
        <div className="space-y-1.5">
          <label htmlFor="unidadesPorBandeja" className="text-sm font-medium text-ink/80">
            Unidades por bandeja
          </label>
          <IconField icon={Hash}>
            <input
              id="unidadesPorBandeja"
              type="number"
              min={1}
              required
              value={values.unidadesPorBandeja}
              onChange={(e) => setField('unidadesPorBandeja', e.target.value)}
              disabled={isSubmitting}
              className="input pl-9"
            />
          </IconField>
        </div>
      )}

      <div className="space-y-3 rounded-xl border border-line p-3">
        <p className="text-sm font-medium text-ink/80">Precio</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="cantidad" className="text-sm font-medium text-ink/80">
              Cantidad
            </label>
            <IconField icon={Hash}>
              <input
                id="cantidad"
                type="number"
                min={1}
                required
                value={values.cantidad}
                onChange={(e) => setField('cantidad', e.target.value)}
                disabled={isSubmitting}
                className="input pl-9"
              />
            </IconField>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="precio" className="text-sm font-medium text-ink/80">
              Precio (Q)
            </label>
            <IconField icon={Coins}>
              <input
                id="precio"
                type="number"
                min={0}
                step="0.01"
                required
                value={values.precio}
                onChange={(e) => setField('precio', e.target.value)}
                disabled={isSubmitting}
                className="input pl-9"
              />
            </IconField>
          </div>
        </div>

        <p className="text-xs text-muted">
          Precio por unidad:{' '}
          <span className="font-medium text-ink">
            {precioPorUnidad > 0 ? `Q${precioPorUnidad}` : '—'}
          </span>{' '}
          (se calcula solo)
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="fechaInicio" className="text-sm font-medium text-ink/80">
              Vigente desde
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
              Vigente hasta (opcional)
            </label>
            <IconField icon={CalendarDays}>
              <input
                id="fechaFin"
                type="date"
                value={values.fechaFin}
                onChange={(e) => setField('fechaFin', e.target.value)}
                disabled={isSubmitting}
                className="input pl-9"
              />
            </IconField>
          </div>
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