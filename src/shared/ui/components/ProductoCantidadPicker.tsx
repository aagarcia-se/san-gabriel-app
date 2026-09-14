import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Croissant,
  Minus,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
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
  /** Cantidad inicial al agregar un producto nuevo. Por defecto 0. */
  cantidadInicial?: number;
}

export function ProductoCantidadPicker({
  value,
  onChange,
  disabled,
  cantidadInicial = 0,
}: ProductoCantidadPickerProps) {
  const { data: productos, isLoading, isError } = useProductos();

  const [modalAbierto, setModalAbierto] = useState(false);

  const idsSeleccionados = useMemo(
    () => new Set(value.map((v) => v.idProducto)),
    [value],
  );

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
    const cantidadValida =
      Number.isFinite(cantidad) && cantidad >= 0 ? cantidad : 0;

    onChange(
      value.map((v) =>
        v.idProducto === idProducto
          ? { ...v, cantidad: cantidadValida }
          : v,
      ),
    );
  }

  function quitarProducto(idProducto: number) {
    onChange(value.filter((v) => v.idProducto !== idProducto));
  }

  function seleccionarProducto(producto: ProductoConPrecio) {
    agregarProducto(producto);
  }

  return (
    <div className="space-y-4">
      {/* ------------------------------------------------------------------ */}
      {/* Botón agregar producto                                             */}
      {/* ------------------------------------------------------------------ */}

      <button
        type="button"
        disabled={disabled || isLoading || isError}
        onClick={() => setModalAbierto(true)}
        className="
          flex w-full items-center gap-4 rounded-2xl border-2 border-dashed
          border-brand-500/40 bg-brand-500/5 px-4 py-4 text-left
          transition-all
          hover:border-brand-500/70
          hover:bg-brand-500/10
          active:scale-[0.99]
          disabled:cursor-not-allowed
          disabled:opacity-50
          sm:px-5 sm:py-5
        "
      >
        <div
          className="
            flex h-12 w-12 shrink-0 items-center justify-center
            rounded-xl bg-brand-500 text-white shadow-sm
          "
        >
          <Plus className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink sm:text-base">
            Agregar producto
          </p>

          <p className="mt-0.5 text-xs text-muted sm:text-sm">
            Toca aquí para elegir un producto
          </p>
        </div>
      </button>

      {/* ------------------------------------------------------------------ */}
      {/* Error                                                              */}
      {/* ------------------------------------------------------------------ */}

      {isError && (
        <p className="rounded-xl bg-danger-500/10 px-4 py-3 text-sm text-danger-600 dark:text-danger-400">
          No se pudo cargar el catálogo de productos.
        </p>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Productos seleccionados                                            */}
      {/* ------------------------------------------------------------------ */}

      {value.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface-2/50 px-5 py-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-2">
            <Croissant className="h-5 w-5 text-muted" />
          </div>

          <p className="mt-3 text-sm font-medium text-ink">
            No hay productos todavía
          </p>

          <p className="mt-1 text-xs text-muted">
            Agrega los productos que forman parte de esta orden.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-sm font-semibold text-ink">
                Productos de la orden
              </h3>

              <p className="text-xs text-muted">
                {value.length}{' '}
                {value.length === 1
                  ? 'producto agregado'
                  : 'productos agregados'}
              </p>
            </div>

            <div className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-600 dark:text-brand-400">
              {value.reduce(
                (total, item) => total + item.cantidad,
                0,
              )}{' '}
              unidades
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {value.map((item) => (
              <ProductoSeleccionado
                key={item.idProducto}
                item={item}
                disabled={disabled}
                onCantidadChange={(cantidad) =>
                  actualizarCantidad(
                    item.idProducto,
                    cantidad,
                  )
                }
                onRemove={() =>
                  quitarProducto(item.idProducto)
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Modal selector                                                     */}
      {/* ------------------------------------------------------------------ */}

      {modalAbierto && (
        <SelectorProductosModal
          productos={productos}
          isLoading={isLoading}
          idsExcluidos={idsSeleccionados}
          disabled={disabled}
          onSelect={seleccionarProducto}
          onClose={() => setModalAbierto(false)}
        />
      )}
    </div>
  );
}

/* ==========================================================================
   PRODUCTO SELECCIONADO
   ========================================================================== */

function ProductoSeleccionado({
  item,
  disabled,
  onCantidadChange,
  onRemove,
}: {
  item: ProductoCantidadItem;
  disabled?: boolean;
  onCantidadChange: (cantidad: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {/* Icono */}
        <div
          className="
            flex h-11 w-11 shrink-0 items-center justify-center
            rounded-xl bg-brand-500/10 text-brand-600
            dark:text-brand-400
          "
        >
          <Croissant className="h-5 w-5" />
        </div>

        {/* Nombre */}
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="line-clamp-2 text-sm font-semibold text-ink">
            {item.nombreProducto}
          </p>

          <p className="mt-0.5 text-xs text-muted">
            Cantidad
          </p>
        </div>

        {/* Eliminar */}
        <button
          type="button"
          aria-label={`Eliminar ${item.nombreProducto}`}
          title="Eliminar producto"
          disabled={disabled}
          onClick={onRemove}
          className="
            flex h-9 w-9 shrink-0 items-center justify-center
            rounded-xl text-muted transition-colors
            hover:bg-danger-500/10
            hover:text-danger-600
            disabled:cursor-not-allowed
            disabled:opacity-40
            dark:hover:text-danger-400
          "
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Cantidad */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-muted">
          Unidades
        </span>

        <CantidadControl
          cantidad={item.cantidad}
          disabled={disabled}
          onChange={onCantidadChange}
        />
      </div>
    </div>
  );
}

/* ==========================================================================
   CONTROL DE CANTIDAD
   ========================================================================== */

function CantidadControl({cantidad, onChange, disabled,}: { cantidad: number;
  onChange: (cantidad: number) => void;
  disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  /*
   * Cuando el usuario entra al input y la cantidad es 0,
   * mostramos el campo vacío para que pueda escribir directamente.
   */
  const mostrarCantidad = focused && cantidad === 0
    ? ''
    : cantidad;

  function handleFocus() {
    setFocused(true);
  }

  function handleBlur() {
    setFocused(false);

    /*
     * Una cantidad 0 o vacía no es válida al terminar de editar.
     * La normalizamos a 0.
     */
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      onChange(0);
    }
  }

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const rawValue = e.target.value;

    /*
     * Permitir que el usuario deje el campo vacío
     * mientras está escribiendo.
     */
    if (rawValue === '') {
      onChange(0);
      return;
    }

    const parsed = Number(rawValue);

    if (!Number.isNaN(parsed) && parsed >= 0) {
      onChange(parsed);
    }
  }

  return (
    <div
      className="
        flex items-center rounded-xl border border-line
        bg-surface-2 p-1
      "
    >
      {/* Disminuir */}
      <button
        type="button"
        aria-label="Disminuir cantidad"
        disabled={disabled || cantidad <= 1}
        onClick={() => onChange(Math.max(1, cantidad - 1))}
        className="
          flex h-11 w-11 items-center justify-center
          rounded-lg text-ink transition-colors
          hover:bg-surface
          active:scale-95
          disabled:cursor-not-allowed
          disabled:opacity-30
        "
      >
        <Minus className="h-5 w-5" />
      </button>

      {/* Input */}
      <input
        type="number"
        min={1}
        inputMode="numeric"
        value={mostrarCantidad}
        disabled={disabled}
        aria-label="Cantidad"
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleInputChange}
        onWheel={(e) => {
          /*
           * Evita que el scroll del mouse/touchpad
           * modifique accidentalmente la cantidad.
           */
          e.currentTarget.blur();
        }}
        onKeyDown={(e) => {
          /*
           * Evita valores decimales.
           */
          if (
            e.key === '.' ||
            e.key === ',' ||
            e.key === 'e' ||
            e.key === '-'
          ) {
            e.preventDefault();
          }
        }}
        className="
          h-11 w-14 border-0 bg-transparent
          p-0 text-center text-base font-bold text-ink
          outline-none
          [appearance:textfield]
          [&::-webkit-inner-spin-button]:appearance-none
          [&::-webkit-outer-spin-button]:appearance-none
        "
      />

      {/* Aumentar */}
      <button
        type="button"
        aria-label="Aumentar cantidad"
        disabled={disabled}
        onClick={() => onChange(cantidad + 1)}
        className="
          flex h-11 w-11 items-center justify-center
          rounded-lg text-ink transition-colors
          hover:bg-surface
          active:scale-95
          disabled:cursor-not-allowed
          disabled:opacity-30
        "
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
}

/* ==========================================================================
   MODAL DE PRODUCTOS
   ========================================================================== */

function SelectorProductosModal({
  productos,
  isLoading,
  idsExcluidos,
  disabled,
  onSelect,
  onClose,
}: {
  productos: ProductoConPrecio[] | undefined;
  isLoading: boolean;
  idsExcluidos: Set<number>;
  disabled?: boolean;
  onSelect: (producto: ProductoConPrecio) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener(
        'keydown',
        handleEscape,
      );
    };
  }, [onClose]);

  const disponibles = useMemo(() => {
    if (!productos) return [];

    return productos.filter(
      (producto) =>
        !idsExcluidos.has(producto.idProducto),
    );
  }, [productos, idsExcluidos]);

  const filtrados = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return disponibles;

    return disponibles.filter((producto) =>
      producto.nombreProducto
        .toLowerCase()
        .includes(term),
    );
  }, [disponibles, search]);

  function handleSelect(producto: ProductoConPrecio) {
    onSelect(producto);
    setSearch('');
  }

  return (
    <div
      className="
        fixed inset-0 z-50 flex items-end justify-center
        bg-black/40 p-0 backdrop-blur-[2px]
        sm:items-center sm:p-4
      "
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="
          flex max-h-[90vh] w-full flex-col overflow-hidden
          rounded-t-3xl bg-surface shadow-2xl
          sm:max-w-lg sm:rounded-3xl
        "
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-line px-5 py-4">
          <div
            className="
              flex h-10 w-10 shrink-0 items-center justify-center
              rounded-xl bg-brand-500/10
              text-brand-600 dark:text-brand-400
            "
          >
            <Croissant className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-ink">
              Agregar producto
            </h2>

            <p className="text-xs text-muted">
              Selecciona un producto de la lista
            </p>
          </div>

          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="
              flex h-10 w-10 shrink-0 items-center justify-center
              rounded-xl text-muted transition-colors
              hover:bg-surface-2 hover:text-ink
            "
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Buscador */}
        <div className="border-b border-line px-5 py-4">
          <div className="relative">
            <Search
              className="
                pointer-events-none absolute left-4 top-1/2
                h-5 w-5 -translate-y-1/2 text-muted
              "
            />

            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar producto..."
              value={search}
              disabled={disabled || isLoading}
              onChange={(e) => setSearch(e.target.value)}
              className="
                input h-12 w-full rounded-xl pl-11 text-sm
              "
            />
          </div>
        </div>

        {/* Lista */}
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div
                className="
                  h-8 w-8 animate-spin rounded-full
                  border-2 border-line border-t-brand-500
                "
              />

              <p className="mt-3 text-sm text-muted">
                Cargando productos...
              </p>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div
                className="
                  mx-auto flex h-12 w-12 items-center
                  justify-center rounded-full bg-surface-2
                "
              >
                <Search className="h-5 w-5 text-muted" />
              </div>

              <p className="mt-3 text-sm font-medium text-ink">
                {disponibles.length === 0
                  ? 'Ya agregaste todos los productos'
                  : 'No encontramos productos'}
              </p>

              {disponibles.length > 0 && (
                <p className="mt-1 text-xs text-muted">
                  Prueba con otro nombre.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filtrados.map((producto) => (
                <button
                  key={producto.idProducto}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelect(producto)}
                  className="
                    flex min-h-[64px] w-full items-center gap-3
                    rounded-2xl border border-line bg-surface
                    px-4 py-3 text-left
                    transition-all
                    hover:border-brand-500/40
                    hover:bg-brand-500/5
                    active:scale-[0.99]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <div
                    className="
                      flex h-10 w-10 shrink-0 items-center
                      justify-center rounded-xl
                      bg-surface-2 text-muted
                    "
                  >
                    <Croissant className="h-4 w-4" />
                  </div>

                  <span className="min-w-0 flex-1 text-sm font-medium text-ink">
                    {producto.nombreProducto}
                  </span>

                  <div
                    className="
                      flex h-9 w-9 shrink-0 items-center
                      justify-center rounded-full
                      bg-brand-500/10 text-brand-600
                      dark:text-brand-400
                    "
                  >
                    <Plus className="h-4 w-4" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary w-full !py-3"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}