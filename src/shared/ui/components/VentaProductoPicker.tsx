import { useEffect, useMemo, useState } from 'react';
import { Croissant, Search, TriangleAlert } from 'lucide-react';

import { useStockGeneral } from '@/features/inventarios/api/useStockGeneral';
import { CategoriaFilter } from '@/shared/ui/CategoriaFilter';
import type { StockGeneralItem, TipoProduccionStock } from '@/features/inventarios/types/inventarios.types';

/**
 * A diferencia de ProductosStockExistentePicker, este componente siempre
 * expone la LISTA COMPLETA de productos con existencia en la sucursal
 * (uno por producto, incluso los que quedan en 0) — porque el backend de
 * ventas necesita el detalle completo, no solo los productos que el
 * usuario tocó. La cantidad representa las UNIDADES SOBRANTES (no
 * vendidas); el backend calcula lo vendido restando contra la existencia.
 */
export interface VentaProductoStockItem {
  idProducto: number;
  nombreProducto: string;
  /** Unidades sobrantes (no vendidas) de este producto. */
  cantidad: number;
  idCategoria: number;
  tipoProduccion: TipoProduccionStock;
  controlarStock: 0 | 1;
  controlarStockDiario: 0 | 1;
  cantidadExistente: number;
}

interface VentaProductoPickerProps {
  idSucursal: number;
  fecha: string;
  value: VentaProductoStockItem[];
  onChange: (value: VentaProductoStockItem[]) => void;
  disabled?: boolean;
  onValidezCambio?: (esValido: boolean) => void;
}

export function VentaProductoPicker({
  idSucursal,
  fecha,
  value,
  onChange,
  disabled,
  onValidezCambio,
}: VentaProductoPickerProps) {
  const { data: stockProductos = [], isLoading, isError } = useStockGeneral(idSucursal, fecha);

  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);

  /* ------------------------------------------------------------------
     SEMBRADO INICIAL

     Apenas llega el stock, se puebla `value` con TODOS los productos
     en cantidad 0 — así el padre siempre tiene la lista completa lista
     para enviar, sin importar si el usuario tocó algo o no. Solo se
     siembra una vez (si value ya tiene el mismo tamaño, no se repite),
     para no pisar cantidades que el usuario ya haya ingresado.
  ------------------------------------------------------------------ */

  useEffect(() => {
    if (stockProductos.length === 0) return;
    if (value.length === stockProductos.length) return;

    onChange(
      stockProductos.map((p) => ({
        idProducto: p.idProducto,
        nombreProducto: p.nombreProducto,
        cantidad: 0,
        idCategoria: p.idCategoria,
        tipoProduccion: p.tipoProduccion,
        controlarStock: p.controlarStock,
        controlarStockDiario: p.controlarStockDiario,
        cantidadExistente: p.cantidadExistente,
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockProductos]);

  const porProducto = useMemo(() => {
    const mapa = new Map<number, VentaProductoStockItem>();
    value.forEach((item) => mapa.set(item.idProducto, item));
    return mapa;
  }, [value]);

  const categorias = useMemo(() => {
    const mapa = new Map<number, string>();
    stockProductos.forEach((p) => {
      if (p.idCategoria != null && p.nombreCategoria) {
        mapa.set(p.idCategoria, p.nombreCategoria);
      }
    });
    return Array.from(mapa.entries())
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [stockProductos]);

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return stockProductos.filter((p) => {
      if (categoriaSeleccionada !== null && p.idCategoria !== categoriaSeleccionada) return false;
      if (texto && !p.nombreProducto.toLowerCase().includes(texto)) return false;
      return true;
    });
  }, [stockProductos, busqueda, categoriaSeleccionada]);

  const productosConSobrante = useMemo(() => value.filter((v) => v.cantidad > 0), [value]);

  /* ------------------------------------------------------------------
     VALIDACIÓN: el sobrante nunca puede superar la existencia.
  ------------------------------------------------------------------ */

  const productosConExceso = useMemo(() => {
    const set = new Set<number>();
    value.forEach((item) => {
      if (item.cantidad > item.cantidadExistente) set.add(item.idProducto);
    });
    return set;
  }, [value]);

  useEffect(() => {
    onValidezCambio?.(productosConExceso.size === 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productosConExceso]);

  function actualizarCantidad(idProducto: number, cantidad: number) {
    if (disabled) return;
    const cantidadValida = Number.isFinite(cantidad) && cantidad >= 0 ? Math.floor(cantidad) : 0;
    onChange(
      value.map((item) =>
        item.idProducto === idProducto ? { ...item, cantidad: cantidadValida } : item,
      ),
    );
  }

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

  if (isError) {
    return (
      <div className="rounded-2xl bg-danger-500/10 px-4 py-4 text-sm text-danger-600 dark:text-danger-400">
        No se pudo cargar el stock de la sucursal.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          disabled={disabled}
          placeholder="Buscar producto por nombre…"
          className="h-14 w-full rounded-2xl border border-line bg-surface pl-12 pr-4 text-base text-ink shadow-sm outline-none transition placeholder:text-muted focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <CategoriaFilter
        categorias={categorias}
        categoriaSeleccionada={categoriaSeleccionada}
        onChange={setCategoriaSeleccionada}
        disabled={disabled}
      />

      <div className="flex items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-ink">
            {productosFiltrados.length}{' '}
            {productosFiltrados.length === 1 ? 'producto' : 'productos'}
          </p>
          <p className="text-xs text-muted">Mostrando en el catálogo</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-brand-600 dark:text-brand-400">
            {productosConSobrante.length} con sobrante
          </p>
          <p className="text-xs text-muted">
            {value.length - productosConSobrante.length} vendidos por completo
          </p>
        </div>
      </div>

      {productosConExceso.size > 0 && (
        <div className="flex items-start gap-2 rounded-2xl border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-sm text-danger-600 dark:text-danger-400">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            El sobrante no puede ser mayor a la existencia en{' '}
            {productosConExceso.size === 1 ? '1 producto' : `${productosConExceso.size} productos`}
            . Corrige la cantidad antes de continuar.
          </p>
        </div>
      )}

      {productosFiltrados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line px-5 py-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-2">
            <Search className="h-5 w-5 text-muted" />
          </div>
          <p className="mt-3 text-sm font-semibold text-ink">No encontramos productos</p>
          <p className="mt-1 text-xs text-muted">Prueba con otra sucursal.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {productosFiltrados.map((producto) => {
            const item = porProducto.get(producto.idProducto);
            const cantidad = item?.cantidad ?? 0;
            const excede = productosConExceso.has(producto.idProducto);

            return (
              <VentaProductoCard
                key={producto.idProducto}
                producto={producto}
                cantidad={cantidad}
                disabled={disabled}
                excedeExistencia={excede}
                onCantidadChange={(nueva) => actualizarCantidad(producto.idProducto, nueva)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function VentaProductoCard({
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
  onCantidadChange: (cantidad: number) => void;
}) {
  const vendidoTotal = cantidad === 0;
  const vendidas = Math.max(0, producto.cantidadExistente - cantidad);

  return (
    <div
      className={`rounded-2xl border bg-surface p-4 shadow-sm transition-all ${
        excedeExistencia
          ? 'border-danger-500/50 ring-1 ring-danger-500/10'
          : vendidoTotal
            ? 'border-success-500/30'
            : 'border-line'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Croissant className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-base font-semibold text-ink">
            {producto.nombreProducto}
          </p>
          {producto.nombreCategoria && (
            <p className="mt-1 text-xs text-muted">{producto.nombreCategoria}</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-xs">
        <span className="text-muted">Existencia: {producto.cantidadExistente}</span>
        <span
          className={vendidoTotal ? 'font-semibold text-success-600 dark:text-success-400' : 'font-semibold text-ink'}
        >
          Vendidas: {vendidas}
        </span>
      </div>

      <div className="mt-3 space-y-2">
        <p className="text-xs font-semibold text-muted">Unidades sobrantes</p>
        <CantidadControl
          cantidad={cantidad}
          disabled={disabled}
          invalido={excedeExistencia}
          onChange={onCantidadChange}
        />
        {excedeExistencia && (
          <p className="flex items-center gap-1 text-xs font-medium text-danger-600 dark:text-danger-400">
            <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
            Supera la existencia ({producto.cantidadExistente}).
          </p>
        )}
      </div>
    </div>
  );
}

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
  const [focused, setFocused] = useState(false);
  const mostrarCantidad = focused && cantidad === 0 ? '' : cantidad;

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const rawValue = e.target.value;
    if (rawValue === '') {
      onChange(0);
      return;
    }
    const parsed = Number(rawValue);
    if (Number.isFinite(parsed) && parsed >= 0) {
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
      aria-label="Unidades sobrantes"
      aria-invalid={invalido}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={handleInputChange}
      onWheel={(e) => e.currentTarget.blur()}
      onKeyDown={(e) => {
        if (['.', ',', 'e', 'E', '-'].includes(e.key)) e.preventDefault();
      }}
      className={`h-14 w-full rounded-xl border bg-surface-2 p-0 text-center text-2xl font-bold text-ink outline-none transition-colors [appearance:textfield] focus:bg-surface focus:ring-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
        invalido
          ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
          : 'border-line focus:border-brand-500 focus:ring-brand-500/20'
      }`}
    />
  );
}