import { useEffect, useMemo, useRef, useState } from 'react';
import { Croissant, Minus, Plus, Search, Trash2 } from 'lucide-react';
import { useProductos } from '@/features/productos/api/useProductos';
import type { ProductoConPrecio } from '@/features/productos/types/precio.types';

export interface ProductoCantidadItem {
  idProducto: number;
  nombreProducto: string;
  cantidad: number;
  idDetalle?: number;
}

interface ProductoCantidadPickerProps {
  value: ProductoCantidadItem[];
  onChange: (value: ProductoCantidadItem[]) => void;
  disabled?: boolean;
  /** Cantidad inicial al agregar un producto nuevo. Por defecto 1. */
  cantidadInicial?: number;
}

export function ProductoCantidadPicker({
  value,
  onChange,
  disabled,
  cantidadInicial = 1,
}: ProductoCantidadPickerProps) {
  const { data: productos, isLoading, isError } = useProductos();

  const idsSeleccionados = useMemo(() => new Set(value.map((v) => v.idProducto)), [value]);

  function agregarProducto(producto: ProductoConPrecio) {
    onChange([
      ...value,
      {
        idProducto: producto.idProducto,
        nombreProducto: producto.nombreProducto,
        cantidad: cantidadInicial,
      },
    ]);
  }

  function actualizarCantidad(idProducto: number, cantidad: number) {
    const cantidadValida = Number.isFinite(cantidad) && cantidad > 0 ? cantidad : 1;
    onChange(
      value.map((v) => (v.idProducto === idProducto ? { ...v, cantidad: cantidadValida } : v)),
    );
  }

  function quitarProducto(idProducto: number) {
    onChange(value.filter((v) => v.idProducto !== idProducto));
  }

  return (
    <div className="space-y-3">
      {isError ? (
        <p className="text-xs text-danger-600 dark:text-danger-400">
          No se pudo cargar el catálogo de productos.
        </p>
      ) : (
        <ProductoBuscador
          productos={productos}
          isLoading={isLoading}
          idsExcluidos={idsSeleccionados}
          disabled={disabled}
          onSelect={agregarProducto}
        />
      )}

      {value.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
          Todavía no agregas productos.
        </p>
      ) : (
        <>
          {/* Móvil: tarjetas con stepper grande, fácil de tocar */}
          <div className="space-y-2 md:hidden">
            {value.map((item) => (
              <div key={item.idProducto} className="card flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <Croissant className="h-4 w-4" />
                </div>
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                  {item.nombreProducto}
                </p>
                <CantidadStepper
                  cantidad={item.cantidad}
                  disabled={disabled}
                  onChange={(c) => actualizarCantidad(item.idProducto, c)}
                />
                <button
                  type="button"
                  aria-label="Quitar"
                  title="Quitar"
                  disabled={disabled}
                  onClick={() => quitarProducto(item.idProducto)}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-500/10 hover:text-danger-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:text-danger-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Desktop: tabla compacta */}
          <div className="hidden overflow-hidden rounded-2xl border border-line md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Producto</th>
                  <th className="px-4 py-3 font-medium">Cantidad</th>
                  <th className="px-4 py-3 font-medium text-right">Quitar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-surface">
                {value.map((item) => (
                  <tr key={item.idProducto}>
                    <td className="px-4 py-3 font-medium text-ink">{item.nombreProducto}</td>
                    <td className="px-4 py-3">
                      <CantidadStepper
                        cantidad={item.cantidad}
                        disabled={disabled}
                        onChange={(c) => actualizarCantidad(item.idProducto, c)}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        aria-label="Quitar"
                        title="Quitar"
                        disabled={disabled}
                        onClick={() => quitarProducto(item.idProducto)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-500/10 hover:text-danger-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:text-danger-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function CantidadStepper({
  cantidad,
  onChange,
  disabled,
}: {
  cantidad: number;
  onChange: (cantidad: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        aria-label="Disminuir cantidad"
        disabled={disabled || cantidad <= 1}
        onClick={() => onChange(cantidad - 1)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <input
        type="number"
        min={1}
        value={cantidad}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="input h-9 w-14 !px-1 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label="Aumentar cantidad"
        disabled={disabled}
        onClick={() => onChange(cantidad + 1)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function ProductoBuscador({
  productos,
  isLoading,
  idsExcluidos,
  disabled,
  onSelect,
}: {
  productos: ProductoConPrecio[] | undefined;
  isLoading: boolean;
  idsExcluidos: Set<number>;
  disabled?: boolean;
  onSelect: (producto: ProductoConPrecio) => void;
}) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const disponibles = useMemo(() => {
    if (!productos) return [];
    return productos.filter((p) => !idsExcluidos.has(p.idProducto));
  }, [productos, idsExcluidos]);

  const filtrados = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return disponibles;
    return disponibles.filter((p) => p.nombreProducto.toLowerCase().includes(term));
  }, [disponibles, search]);

  return (
    <div ref={containerRef} className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        type="text"
        placeholder={isLoading ? 'Cargando productos…' : 'Buscar y agregar producto…'}
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
        <div className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-line bg-surface shadow-lg">
          {filtrados.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted">
              {disponibles.length === 0 ? 'Ya agregaste todos los productos.' : 'Sin resultados.'}
            </p>
          ) : (
            filtrados.map((producto) => (
              <button
                key={producto.idProducto}
                type="button"
                onClick={() => {
                  onSelect(producto);
                  setSearch('');
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-surface-2"
              >
                <Plus className="h-3.5 w-3.5 shrink-0 text-brand-600 dark:text-brand-400" />
                <span className="truncate">{producto.nombreProducto}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}