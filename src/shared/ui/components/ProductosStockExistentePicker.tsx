import { useEffect, useMemo, useState } from 'react';
import {
  Croissant,
  Search,
  TriangleAlert,
} from 'lucide-react';

import { useStockGeneral } from '@/features/inventarios/api/useStockGeneral';
import { CategoriaFilter } from '@/shared/ui/CategoriaFilter';
// OJO: ajusta esta ruta si StockGeneralItem vive en otro archivo de tipos
// en tu proyecto — es el mismo tipo que ya usas en InventarioSucursalPage.
import type { StockGeneralItem } from '@/features/inventarios/types/inventarios.types';

export interface ProductoStockItem {
  idProducto: number;
  nombreProducto: string;
  cantidad: number;
  idDetalle?: number;
  /**
   * Se copian del stock general al momento de seleccionar el producto,
   * para que quien use este picker (ingreso, descuento, traslado) pueda
   * armar su payload sin tener que volver a consultar el stock.
   */
  controlarStock: 0 | 1;
  controlarStockDiario: 0 | 1;
}

interface ProductosStockExistentePickerProps {
  idSucursal: number;
  fecha: string;
  value: ProductoStockItem[];
  onChange: (value: ProductoStockItem[]) => void;
  disabled?: boolean;

  /**
   * Cantidad inicial para productos que todavía
   * no forman parte del movimiento.
   */
  cantidadInicial?: number;

  /**
   * Si es true, valida que la cantidad ingresada no supere
   * `cantidadExistente` y muestra una alerta en el producto — actívalo
   * en venta, descuento de stock y traslado. Desactívalo en ingreso de
   * stock, donde no existe un tope (ahí estás agregando existencia,
   * no restándola).
   */
  limitarAExistencia?: boolean;

  /**
   * Se dispara cada vez que cambia si hay algún producto con cantidad
   * mayor a su existencia. Útil para deshabilitar el botón de guardar
   * en el formulario que use este picker (ver nota al final).
   */
  onValidezCambio?: (esValido: boolean) => void;
}

/* ==========================================================================
   COMPONENTE PRINCIPAL
   ========================================================================== */

export function ProductosStockExistentePicker({
  idSucursal,
  fecha,
  value,
  onChange,
  disabled,
  cantidadInicial = 0,
  limitarAExistencia = true,
  onValidezCambio,
}: ProductosStockExistentePickerProps) {
  const {
    data: productos = [],
    isLoading,
    isError,
  } = useStockGeneral(idSucursal, fecha);

  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<number | null>(null);

  /* ------------------------------------------------------------------------
     PRODUCTOS INDEXADOS

     Esto nos permite saber rápidamente qué cantidad tiene
     cada producto que ya está en el movimiento.
  ------------------------------------------------------------------------ */

  const cantidadesPorProducto = useMemo(() => {
    const mapa = new Map<
      number,
      ProductoStockItem
    >();

    value.forEach((item) => {
      mapa.set(item.idProducto, item);
    });

    return mapa;
  }, [value]);

  /* ------------------------------------------------------------------------
     CATEGORÍAS

     Las obtenemos directamente de los productos con stock.
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
     VALIDACIÓN CONTRA EXISTENCIA

     Se calcula aquí porque este componente es el único que tiene, al
     mismo tiempo, la cantidad que el usuario ingresó y la existencia
     real de cada producto — es el lugar natural para saber si algo se
     está pasando de la existencia disponible.
  ------------------------------------------------------------------------ */

  const existenciaPorProducto = useMemo(() => {
    const mapa = new Map<number, number>();
    productos.forEach((producto) => {
      mapa.set(producto.idProducto, producto.cantidadExistente);
    });
    return mapa;
  }, [productos]);

  const productosConExceso = useMemo(() => {
    if (!limitarAExistencia) return new Set<number>();
    const set = new Set<number>();
    value.forEach((item) => {
      const existencia = existenciaPorProducto.get(item.idProducto) ?? 0;
      if (item.cantidad > existencia) {
        set.add(item.idProducto);
      }
    });
    return set;
  }, [value, existenciaPorProducto, limitarAExistencia]);

  useEffect(() => {
    onValidezCambio?.(productosConExceso.size === 0);
    // Solo nos importa notificar cuando cambia el resultado, no la
    // identidad de la función — evita renders extra si el padre no la
    // memoiza.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productosConExceso]);

  /* ------------------------------------------------------------------------
     CAMBIAR CANTIDAD
  ------------------------------------------------------------------------ */

  function actualizarCantidad(
    producto: StockGeneralItem,
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
     * que realmente forman parte del movimiento.
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
        controlarStock:
          producto.controlarStock,
        controlarStockDiario:
          producto.controlarStockDiario,
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
        No se pudo cargar el stock de la
        sucursal.
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

      <CategoriaFilter
        categorias={categorias}
        categoriaSeleccionada={categoriaSeleccionada}
        onChange={setCategoriaSeleccionada}
        disabled={disabled}
      />

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
          ALERTA GLOBAL DE EXISTENCIA
      ================================================================= */}

      {limitarAExistencia && productosConExceso.size > 0 && (
        <div className="flex items-start gap-2 rounded-2xl border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-sm text-danger-600 dark:text-danger-400">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Estás ingresando más unidades de las que hay en existencia en{' '}
            {productosConExceso.size === 1
              ? '1 producto'
              : `${productosConExceso.size} productos`}
            . Corrige la cantidad antes de continuar.
          </p>
        </div>
      )}

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
                  excedeExistencia={productosConExceso.has(producto.idProducto)}
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
  excedeExistencia,
  onCantidadChange,
}: {
  producto: StockGeneralItem;
  cantidad: number;
  disabled?: boolean;
  excedeExistencia: boolean;
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
          excedeExistencia
            ? 'border-danger-500/50 ring-1 ring-danger-500/10'
            : seleccionado
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
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-amber-500/10
            text-amber-600
            dark:text-amber-400
          "
        >
          <Croissant className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-xl font-semibold text-ink">
            {producto.nombreProducto}
          </p>

          {producto.nombreCategoria && (
            <p className="mt-1 text-sm text-muted">
              {producto.nombreCategoria}
            </p>
          )}
        </div>

        {/* Estado */}
        {seleccionado && (
          <div
            className={`
              shrink-0
              rounded-full
              px-2.5
              py-1
              text-[15px]
              font-bold
              ${
                excedeExistencia
                  ? 'bg-danger-500/10 text-danger-600 dark:text-danger-400'
                  : 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
              }
            `}
          >
            {cantidad}
          </div>
        )}
      </div>

      {/* --------------------------------------------------------------
          EXISTENCIA
      -------------------------------------------------------------- */}

      <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
        <span className="text-xs font-semibold text-muted">Existencia</span>
        <span className="text-sm font-bold text-ink">
          {producto.cantidadExistente}
        </span>
      </div>

      {/* --------------------------------------------------------------
          CANTIDAD
      -------------------------------------------------------------- */}

      <div className="mt-4 space-y-2">
        <p className="text-xs font-semibold text-muted">Cantidad</p>

        <CantidadControl
          cantidad={cantidad}
          disabled={disabled}
          invalido={excedeExistencia}
          onChange={onCantidadChange}
        />

        {excedeExistencia && (
          <p className="flex items-center gap-1 text-xs font-medium text-danger-600 dark:text-danger-400">
            <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
            Supera la existencia disponible ({producto.cantidadExistente}).
          </p>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   CONTROL DE CANTIDAD

   Solo el input — sin botones +/-. El usuario escribe la cantidad
   directamente (con el teclado numérico en móvil, gracias a inputMode).
   ========================================================================== */

function CantidadControl({
  cantidad,
  onChange,
  disabled,
  invalido,
}: {
  cantidad: number;
  onChange: (cantidad: number) => void;
  disabled?: boolean;
  invalido?: boolean;
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

  return (
    <input
      type="number"
      min={0}
      inputMode="numeric"
      value={mostrarCantidad}
      disabled={disabled}
      aria-label="Cantidad"
      aria-invalid={invalido}
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
      className={`
        h-14
        w-full
        rounded-xl
        border
        bg-surface-2
        p-0
        text-center
        text-2xl
        font-bold
        text-ink
        outline-none
        transition-colors
        [appearance:textfield]
        focus:bg-surface
        focus:ring-2
        [&::-webkit-inner-spin-button]:appearance-none
        [&::-webkit-outer-spin-button]:appearance-none
        ${
          invalido
            ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
            : 'border-line focus:border-brand-500 focus:ring-brand-500/20'
        }
      `}
    />
  );
}