import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Check, Hash, Ruler, Search, Wheat } from 'lucide-react';
import { useProductos } from '@/features/productos/api/useProductos';
import { IconField } from '@/shared/ui/IconField';
import { cn } from '@/shared/lib/cn';
import type { ProductoConPrecio } from '@/features/productos/types/precio.types';

export interface RecetaFormValues {
  idProducto: string;
  cantidadNecesaria: string;
  unidadMedida: string;
}

interface RecetaFormProps {
  initialValues?: Partial<RecetaFormValues>;
  submitLabel: string;
  isSubmitting: boolean;
  errorMessage?: string;
  onSubmit: (values: RecetaFormValues) => void;
  onCancel: () => void;
}

const EMPTY_VALUES: RecetaFormValues = {
  idProducto: '',
  cantidadNecesaria: '',
  unidadMedida: 'Lb',
};

export function RecetaForm({
  initialValues,
  submitLabel,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: RecetaFormProps) {
  const [values, setValues] = useState<RecetaFormValues>({
    ...EMPTY_VALUES,
    ...initialValues,
  });
  const [productoError, setProductoError] = useState<string | undefined>();

  const {
    data: productos,
    isLoading: isLoadingProductos,
    isError: isProductosError,
  } = useProductos();

  function setField<K extends keyof RecetaFormValues>(field: K, value: RecetaFormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isProductosError && !values.idProducto) {
      setProductoError('Selecciona un producto de la lista.');
      return;
    }
    setProductoError(undefined);
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="idProducto" className="text-sm font-medium text-ink/80">
          Producto
        </label>
        {isProductosError ? (
          <>
            <input
              id="idProducto"
              type="number"
              min={1}
              required
              value={values.idProducto}
              onChange={(e) => setField('idProducto', e.target.value)}
              disabled={isSubmitting}
              className="input"
            />
            <p className="text-xs text-danger-600 dark:text-danger-400">
              No se pudo cargar la lista de productos — escribe el ID a mano.
            </p>
          </>
        ) : (
          <>
            <ProductoCombobox
              productos={productos}
              isLoading={isLoadingProductos}
              value={values.idProducto}
              onChange={(idProducto) => {
                setField('idProducto', idProducto);
                setProductoError(undefined);
              }}
              disabled={isSubmitting}
            />
            {productoError && (
              <p className="text-xs text-danger-600 dark:text-danger-400">{productoError}</p>
            )}
          </>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-ink/80">Ingrediente</label>
        <IconField icon={Wheat}>
          <input type="text" value="Harina" disabled readOnly className="input pl-9" />
        </IconField>
        <p className="text-xs text-muted">
          Por ahora solo se maneja Harina — va a ser un selector en cuanto conectemos el
          catálogo de ingredientes.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="cantidadNecesaria" className="text-sm font-medium text-ink/80">
            Cantidad necesaria
          </label>
          <IconField icon={Hash}>
            <input
              id="cantidadNecesaria"
              type="number"
              min={0}
              step="0.001"
              required
              value={values.cantidadNecesaria}
              onChange={(e) => setField('cantidadNecesaria', e.target.value)}
              disabled={isSubmitting}
              className="input pl-9"
            />
          </IconField>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="unidadMedida" className="text-sm font-medium text-ink/80">
            Unidad de medida
          </label>
          <IconField icon={Ruler}>
            <input
              id="unidadMedida"
              type="text"
              required
              value={values.unidadMedida}
              onChange={(e) => setField('unidadMedida', e.target.value)}
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

interface ProductoComboboxProps {
  productos: ProductoConPrecio[] | undefined;
  isLoading: boolean;
  value: string;
  onChange: (idProducto: string) => void;
  disabled?: boolean;
}

function ProductoCombobox({ productos, isLoading, value, onChange, disabled }: ProductoComboboxProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedProducto = productos?.find((p) => String(p.idProducto) === value);

  // Mantiene el texto del input sincronizado con el producto seleccionado
  // cuando no se está buscando activamente (por ejemplo, al precargar
  // initialValues en el formulario de edición).
  useEffect(() => {
    if (!isOpen) {
      setSearch(selectedProducto?.nombreProducto ?? '');
    }
  }, [selectedProducto, isOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch(selectedProducto?.nombreProducto ?? '');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedProducto]);

  const filtered = useMemo(() => {
    if (!productos) return [];
    const term = search.trim().toLowerCase();
    if (!term) return productos;
    return productos.filter((p) => p.nombreProducto.toLowerCase().includes(term));
  }, [productos, search]);

  return (
    <div ref={containerRef} className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        placeholder={isLoading ? 'Cargando…' : 'Buscar producto…'}
        value={search}
        disabled={disabled || isLoading}
        onFocus={() => setIsOpen(true)}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
        }}
        className="input pl-9"
      />

      {isOpen && !isLoading && (
        <div className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-line bg-surface shadow-lg">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted">Sin resultados.</p>
          ) : (
            filtered.map((producto) => (
              <button
                key={producto.idProducto}
                type="button"
                onClick={() => {
                  onChange(String(producto.idProducto));
                  setSearch(producto.nombreProducto);
                  setIsOpen(false);
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-surface-2',
                  String(producto.idProducto) === value && 'text-brand-600 dark:text-brand-400',
                )}
              >
                <span className="truncate">{producto.nombreProducto}</span>
                {String(producto.idProducto) === value && <Check className="h-4 w-4 shrink-0" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}