import { useMemo, useState } from 'react';
import {
  Croissant,
  Minus,
  Plus,
  Search,
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

  /**
   * Cantidad inicial para productos que todavía
   * no forman parte de la orden.
   */
  cantidadInicial?: number;
}

/* ==========================================================================
   COMPONENTE PRINCIPAL
   ========================================================================== */

export function ProductoCantidadPicker({
  value,
  onChange,
  disabled,
  cantidadInicial = 0,
}: ProductoCantidadPickerProps) {
  const {
    data: productos = [],
    isLoading,
    isError,
  } = useProductos();

  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<number | null>(null);

  /* ------------------------------------------------------------------------
     PRODUCTOS INDEXADOS

     Esto nos permite saber rápidamente qué cantidad tiene
     cada producto que ya está en la orden.
  ------------------------------------------------------------------------ */

  const cantidadesPorProducto = useMemo(() => {
    const mapa = new Map<
      number,
      ProductoCantidadItem
    >();

    value.forEach((item) => {
      mapa.set(item.idProducto, item);
    });

    return mapa;
  }, [value]);

  /* ------------------------------------------------------------------------
     CATEGORÍAS

     Las obtenemos directamente desde los productos.
     No necesitamos useCategorias().
  ------------------------------------------------------------------------ */

  const categorias = useMemo(() => {
    const mapa = new Map<
      number,
      string
    >();

    productos.forEach((producto) => {
      if (
        producto.idCategoria != null &&
        producto.nombreCategoria
      ) {
        mapa.set(
          producto.idCategoria,
          producto.nombreCategoria,
        );
      }
    });

    return Array.from(mapa.entries())
      .map(([id, nombre]) => ({
        id,
        nombre,
      }))
      .sort((a, b) =>
        a.nombre.localeCompare(b.nombre),
      );
  }, [productos]);

  /* ------------------------------------------------------------------------
     PRODUCTOS FILTRADOS
  ------------------------------------------------------------------------ */

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return productos.filter((producto) => {
      /* Filtro por categoría */
      if (
        categoriaSeleccionada !== null &&
        producto.idCategoria !== categoriaSeleccionada
      ) {
        return false;
      }

      /* Filtro por nombre */
      if (texto) {
        const nombre = producto.nombreProducto
          .toLowerCase();

        if (!nombre.includes(texto)) {
          return false;
        }
      }

      return true;
    });
  }, [
    productos,
    busqueda,
    categoriaSeleccionada,
  ]);

  /* ------------------------------------------------------------------------
     TOTALES
  ------------------------------------------------------------------------ */

  const productosConCantidad = useMemo(
    () =>
      value.filter(
        (item) => item.cantidad > 0,
      ),
    [value],
  );

  const totalUnidades = useMemo(
    () =>
      value.reduce(
        (total, item) =>
          total + item.cantidad,
        0,
      ),
    [value],
  );

  /* ------------------------------------------------------------------------
     CAMBIAR CANTIDAD
  ------------------------------------------------------------------------ */

  function actualizarCantidad(
    producto: ProductoConPrecio,
    cantidad: number,
  ) {
    if (disabled) return;

    const cantidadValida =
      Number.isFinite(cantidad) &&
      cantidad >= 0
        ? Math.floor(cantidad)
        : 0;

    const existente =
      cantidadesPorProducto.get(
        producto.idProducto,
      );

    /*
     * Si la cantidad vuelve a 0,
     * quitamos el producto del value.
     *
     * Así value solamente contiene productos
     * que realmente forman parte de la orden.
     */
    if (cantidadValida === 0) {
      if (!existente) {
        return;
      }

      onChange(
        value.filter(
          (item) =>
            item.idProducto !==
            producto.idProducto,
        ),
      );

      return;
    }

    /*
     * Si ya existe, solamente actualizamos
     * la cantidad.
     */
    if (existente) {
      onChange(
        value.map((item) =>
          item.idProducto ===
          producto.idProducto
            ? {
                ...item,
                cantidad: cantidadValida,
              }
            : item,
        ),
      );

      return;
    }

    /*
     * Si todavía no existe, lo agregamos.
     */
    onChange([
      ...value,
      {
        idProducto:
          producto.idProducto,
        nombreProducto:
          producto.nombreProducto,
        cantidad: cantidadValida,
      },
    ]);
  }

  /* ------------------------------------------------------------------------
     LOADING
  ------------------------------------------------------------------------ */

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-14 animate-pulse rounded-2xl bg-surface-2" />

        <div className="h-12 animate-pulse rounded-2xl bg-surface-2" />

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />
          <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />
          <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />
          <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------------
     ERROR
  ------------------------------------------------------------------------ */

  if (isError) {
    return (
      <div className="rounded-2xl bg-danger-500/10 px-4 py-4 text-sm text-danger-600 dark:text-danger-400">
        No se pudo cargar el catálogo de
        productos.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ================================================================
          BÚSQUEDA
      ================================================================= */}

      <div className="relative">
        <Search
          className="
            pointer-events-none
            absolute
            left-4
            top-1/2
            h-5
            w-5
            -translate-y-1/2
            text-muted
          "
        />

        <input
          type="search"
          value={busqueda}
          onChange={(e) =>
            setBusqueda(e.target.value)
          }
          disabled={disabled}
          placeholder="Buscar producto por nombre..."
          className="
            h-14
            w-full
            rounded-2xl
            border
            border-line
            bg-surface
            pl-12
            pr-4
            text-base
            text-ink
            shadow-sm
            outline-none
            transition
            placeholder:text-muted
            focus:border-brand-500
            focus:ring-2
            focus:ring-brand-500/20
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        />
      </div>

      {/* ================================================================
          CATEGORÍAS
      ================================================================= */}

      {categorias.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Categoría
            </p>

            {categoriaSeleccionada !== null && (
              <button
                type="button"
                onClick={() =>
                  setCategoriaSeleccionada(null)
                }
                disabled={disabled}
                className="
                  text-xs
                  font-semibold
                  text-brand-600
                  hover:text-brand-700
                  dark:text-brand-400
                "
              >
                Ver todas
              </button>
            )}
          </div>

          {/* --------------------------------------------------------------
              MÓVIL

              Scroll horizontal para no ocupar demasiado espacio.
          -------------------------------------------------------------- */}

          <div className="flex gap-2 overflow-x-auto pb-1">
            {/* TODAS */}
            <button
              type="button"
              onClick={() =>
                setCategoriaSeleccionada(null)
              }
              disabled={disabled}
              className={`
                shrink-0
                rounded-full
                px-4
                py-2.5
                text-sm
                font-semibold
                transition-all
                ${
                  categoriaSeleccionada === null
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'bg-surface-2 text-muted hover:bg-surface hover:text-ink'
                }
              `}
            >
              Todas
            </button>

            {categorias.map((categoria) => (
              <button
                key={categoria.id}
                type="button"
                onClick={() =>
                  setCategoriaSeleccionada(
                    categoria.id,
                  )
                }
                disabled={disabled}
                className={`
                  shrink-0
                  rounded-full
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  transition-all
                  ${
                    categoriaSeleccionada ===
                    categoria.id
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'bg-surface-2 text-muted hover:bg-surface hover:text-ink'
                  }
                `}
              >
                {categoria.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================
          RESUMEN
      ================================================================= */}

      <div
        className="
          flex
          items-center
          justify-between
          rounded-2xl
          border
          border-line
          bg-surface
          px-4
          py-3
        "
      >
        <div>
          <p className="text-sm font-semibold text-ink">
            {productosFiltrados.length}{' '}
            {productosFiltrados.length === 1
              ? 'producto'
              : 'productos'}
          </p>

          <p className="text-xs text-muted">
            Mostrando en el catálogo
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm font-bold text-brand-600 dark:text-brand-400">
            {productosConCantidad.length}{' '}
            {productosConCantidad.length === 1
              ? 'seleccionado'
              : 'seleccionados'}
          </p>

          <p className="text-xs text-muted">
            {totalUnidades}{' '}
            {totalUnidades === 1
              ? 'unidad'
              : 'unidades'}
          </p>
        </div>
      </div>

      {/* ================================================================
          SIN PRODUCTOS
      ================================================================= */}

      {productosFiltrados.length === 0 ? (
        <div
          className="
            rounded-2xl
            border
            border-dashed
            border-line
            px-5
            py-10
            text-center
          "
        >
          <div
            className="
              mx-auto
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-surface-2
            "
          >
            <Search className="h-5 w-5 text-muted" />
          </div>

          <p className="mt-3 text-sm font-semibold text-ink">
            No encontramos productos
          </p>

          <p className="mt-1 text-xs text-muted">
            Prueba con otro nombre o categoría.
          </p>
        </div>
      ) : (
        /* ================================================================
           PRODUCTOS
        ================================================================= */

        <div className="grid gap-3 sm:grid-cols-2">
          {productosFiltrados.map(
            (producto) => {
              const item =
                cantidadesPorProducto.get(
                  producto.idProducto,
                );

              const cantidad =
                item?.cantidad ??
                cantidadInicial;

              return (
                <ProductoCard
                  key={producto.idProducto}
                  producto={producto}
                  cantidad={cantidad}
                  disabled={disabled}
                  onCantidadChange={(
                    nuevaCantidad,
                  ) =>
                    actualizarCantidad(
                      producto,
                      nuevaCantidad,
                    )
                  }
                />
              );
            },
          )}
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   PRODUCTO CARD
   ========================================================================== */

function ProductoCard({
  producto,
  cantidad,
  disabled,
  onCantidadChange,
}: {
  producto: ProductoConPrecio;
  cantidad: number;
  disabled?: boolean;
  onCantidadChange: (
    cantidad: number,
  ) => void;
}) {
  const seleccionado = cantidad > 0;

  return (
    <div
      className={`
        rounded-2xl
        border
        bg-surface
        p-4
        shadow-sm
        transition-all
        ${
          seleccionado
            ? 'border-brand-500/40 ring-1 ring-brand-500/10'
            : 'border-line'
        }
      `}
    >
      {/* --------------------------------------------------------------
          INFORMACIÓN
      -------------------------------------------------------------- */}

      <div className="flex items-start gap-3">
        <div
          className={`
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${
              seleccionado
                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                : 'bg-surface-2 text-muted'
            }
          `}
        >
          <Croissant className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-semibold text-ink">
            {producto.nombreProducto}
          </p>

          {producto.nombreCategoria && (
            <p className="mt-1 text-xs text-muted">
              {producto.nombreCategoria}
            </p>
          )}
        </div>

        {/* Estado */}
        {seleccionado && (
          <div
            className="
              shrink-0
              rounded-full
              bg-brand-500/10
              px-2.5
              py-1
              text-[11px]
              font-bold
              text-brand-600
              dark:text-brand-400
            "
          >
            {cantidad}
          </div>
        )}
      </div>

      {/* --------------------------------------------------------------
          INFORMACIÓN DE PRODUCCIÓN
      -------------------------------------------------------------- */}

      {producto.tipoProduccion && (
        <div className="mt-3 flex items-center gap-2">
          <span className="rounded-lg bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-muted">
            {producto.tipoProduccion}
          </span>

          {producto.unidadesPorBandeja &&
            producto.tipoProduccion ===
              'bandejas' && (
              <span className="text-[11px] text-muted">
                {producto.unidadesPorBandeja}{' '}
                unidades/bandeja
              </span>
            )}
        </div>
      )}

      {/* --------------------------------------------------------------
          CANTIDAD
      -------------------------------------------------------------- */}

      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-muted">
            Cantidad
          </p>

          <p className="text-[11px] text-muted">
            {seleccionado
              ? 'Incluido en la orden'
              : 'No incluido'}
          </p>
        </div>

        <CantidadControl
          cantidad={cantidad}
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

function CantidadControl({
  cantidad,
  onChange,
  disabled,
}: {
  cantidad: number;
  onChange: (cantidad: number) => void;
  disabled?: boolean;
}) {
  const [focused, setFocused] =
    useState(false);

  /*
   * Si la cantidad es 0 y el usuario toca el input,
   * mostramos vacío para que pueda escribir directamente.
   */
  const mostrarCantidad =
    focused && cantidad === 0
      ? ''
      : cantidad;

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const rawValue = e.target.value;

    /*
     * Campo vacío mientras escribe.
     */
    if (rawValue === '') {
      onChange(0);
      return;
    }

    const parsed = Number(rawValue);

    if (
      Number.isFinite(parsed) &&
      parsed >= 0
    ) {
      onChange(Math.floor(parsed));
    }
  }

  function disminuir() {
    if (disabled) return;

    onChange(Math.max(0, cantidad - 1));
  }

  function aumentar() {
    if (disabled) return;

    onChange(cantidad + 1);
  }

  return (
    <div
      className="
        flex
        shrink-0
        items-center
        rounded-xl
        border
        border-line
        bg-surface-2
        p-1
      "
    >
      {/* ------------------------------------------------------------
          MENOS
      ------------------------------------------------------------- */}

      <button
        type="button"
        aria-label="Disminuir cantidad"
        disabled={
          disabled || cantidad <= 0
        }
        onClick={disminuir}
        className="
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-lg
          text-ink
          transition-colors
          hover:bg-surface
          active:scale-95
          disabled:cursor-not-allowed
          disabled:opacity-30
        "
      >
        <Minus className="h-5 w-5" />
      </button>

      {/* ------------------------------------------------------------
          INPUT
      ------------------------------------------------------------- */}

      <input
        type="number"
        min={0}
        inputMode="numeric"
        value={mostrarCantidad}
        disabled={disabled}
        aria-label="Cantidad"
        onFocus={() =>
          setFocused(true)
        }
        onBlur={() =>
          setFocused(false)
        }
        onChange={handleInputChange}
        onWheel={(e) => {
          /*
           * IMPORTANTE:
           * evita que el scroll modifique la cantidad.
           */
          e.currentTarget.blur();
        }}
        onKeyDown={(e) => {
          /*
           * Solo cantidades enteras.
           */
          if (
            e.key === '.' ||
            e.key === ',' ||
            e.key === 'e' ||
            e.key === 'E' ||
            e.key === '-'
          ) {
            e.preventDefault();
          }
        }}
        className="
          h-11
          w-14
          border-0
          bg-transparent
          p-0
          text-center
          text-base
          font-bold
          text-ink
          outline-none
          [appearance:textfield]
          [&::-webkit-inner-spin-button]:appearance-none
          [&::-webkit-outer-spin-button]:appearance-none
        "
      />

      {/* ------------------------------------------------------------
          MÁS
      ------------------------------------------------------------- */}

      <button
        type="button"
        aria-label="Aumentar cantidad"
        disabled={disabled}
        onClick={aumentar}
        className="
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-lg
          text-ink
          transition-colors
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