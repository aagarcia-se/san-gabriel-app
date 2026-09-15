import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  ArrowDownCircle,
  ArrowRight,
  ArrowRightLeft,
  Boxes,
  ClipboardList,
  PackagePlus,
  Search,
} from 'lucide-react';

import { useSucursales } from '@/features/sucursales/api/useSucursales';
import { CategoriaFilter } from '@/shared/ui/CategoriaFilter';
import { useStockGeneral } from '../api/useStockGeneral';

import { PageHeader } from '@/shared/ui/PageHeader';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Badge } from '@/shared/ui/Badge';

import type { StockGeneralItem } from '../types/inventarios.types';

const OPCIONES = [
  {
    key: 'ingresar',
    titulo: 'Agregar existencias',
    descripcion:
      'Registra productos que entraron a la sucursal.',
    icono: PackagePlus,
    color:
      'text-success-600 dark:text-success-400 bg-success-500/10',
  },
  {
    key: 'descontar',
    titulo: 'Restar existencias',
    descripcion:
      'Descuenta productos dañados, vencidos o perdidos.',
    icono: ArrowDownCircle,
    color:
      'text-danger-600 dark:text-danger-400 bg-danger-500/10',
  },
  {
    key: 'trasladar',
    titulo: 'Trasladar existencias',
    descripcion:
      'Mueve productos de esta sucursal hacia otra.',
    icono: ArrowRightLeft,
    color:
      'text-brand-600 dark:text-brand-400 bg-brand-500/10',
  },
] as const;

export function InventarioSucursalPage() {
  const {
    idSucursal: idParam,
  } = useParams<{ idSucursal: string }>();

  const idSucursal = Number(idParam);

  const fecha =
    dayjs().format('YYYY-MM-DD');

  const { data: sucursales } =
    useSucursales();

  const nombreSucursal =
    sucursales?.find(
      (s) => s.idSucursal === idSucursal,
    )?.nombreSucursal;

  const {
    data: stock,
    isLoading,
    isError,
    error,
    refetch,
  } = useStockGeneral(
    idSucursal,
    fecha,
  );

  const [search, setSearch] =
    useState('');

  const [
    categoriaSeleccionada,
    setCategoriaSeleccionada,
  ] = useState<number | null>(null);

  /*
   * ============================================================
   * CATEGORÍAS
   * ============================================================
   */

  const categorias = useMemo(() => {
    const mapa =
      new Map<number, string>();

    (stock ?? []).forEach((item) => {
      if (
        item.idCategoria != null &&
        item.nombreCategoria
      ) {
        mapa.set(
          item.idCategoria,
          item.nombreCategoria,
        );
      }
    });

    return Array.from(
      mapa.entries(),
    )
      .map(([id, nombre]) => ({
        id,
        nombre,
      }))
      .sort((a, b) =>
        a.nombre.localeCompare(
          b.nombre,
        ),
      );
  }, [stock]);

  /*
   * ============================================================
   * FILTRO
   * ============================================================
   */

  const filtered = useMemo(() => {
    if (!stock) return [];

    const term =
      search
        .trim()
        .toLowerCase();

    return stock.filter((item) => {
      if (
        categoriaSeleccionada !== null &&
        item.idCategoria !==
          categoriaSeleccionada
      ) {
        return false;
      }

      if (term) {
        return (
          item.nombreProducto
            .toLowerCase()
            .includes(term) ||
          item.nombreCategoria
            .toLowerCase()
            .includes(term)
        );
      }

      return true;
    });
  }, [
    stock,
    search,
    categoriaSeleccionada,
  ]);

  const totalProductos =
    stock?.length ?? 0;

  const totalFiltrados =
    filtered.length;

  return (
    <div className="space-y-5 pb-6">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <PageHeader
        title={
          nombreSucursal ??
          'Inventario de sucursal'
        }
        description="Control y gestión de existencias."
        backTo="/inventarios"
      />

      {/* =====================================================
          ACCIONES PRINCIPALES
          ===================================================== */}

      <div className="grid gap-3 sm:grid-cols-3">
        {OPCIONES.map((opcion) => {
          const Icono =
            opcion.icono;

          return (
            <Link
              key={opcion.key}
              to={`/inventarios/${idSucursal}/${opcion.key}`}
              className="
                card
                group
                flex
                min-h-[150px]
                flex-col
                justify-between
                gap-4
                transition-all
                hover:-translate-y-0.5
                hover:bg-surface-2
                hover:shadow-md
              "
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    ${opcion.color}
                  `}
                >
                  <Icono className="h-5 w-5" />
                </div>

                <ArrowRight
                  className="
                    h-4
                    w-4
                    text-muted
                    transition-transform
                    group-hover:translate-x-1
                  "
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-ink">
                  {opcion.titulo}
                </p>

                <p className="mt-1 text-xs leading-5 text-muted">
                  {opcion.descripcion}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* =====================================================
          HISTORIAL
          ===================================================== */}

      <Link
        to={`/inventarios/${idSucursal}/historial`}
        className="
          card
          group
          flex
          items-center
          gap-4
          transition-all
          hover:-translate-y-0.5
          hover:bg-surface-2
          hover:shadow-md
        "
      >
        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-brand-500/10
            text-brand-500
          "
        >
          <ClipboardList className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-ink">
              Historial de movimientos
            </h2>

            <Badge variant="neutral">
              Consultar
            </Badge>
          </div>

          <p className="mt-1 text-xs leading-5 text-muted">
            Consulta ingresos, descuentos y traslados realizados en esta sucursal.
          </p>
        </div>

        <ArrowRight
          className="
            h-5
            w-5
            shrink-0
            text-muted
            transition-transform
            group-hover:translate-x-1
            group-hover:text-ink
          "
        />
      </Link>

      {/* =====================================================
          RESUMEN
          ===================================================== */}

     {/* <div className="grid gap-3 sm:grid-cols-2">
        <div className="card flex items-center gap-3">
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-brand-500/10
              text-brand-500
            "
          >
            <Boxes className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs text-muted">
              Productos registrados
            </p>

            <p className="text-lg font-semibold text-ink">
              {totalProductos}
            </p>
          </div>
        </div>

        <div className="card flex items-center gap-3">
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-success-500/10
              text-success-600
              dark:text-success-400
            "
          >
            <PackagePlus className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs text-muted">
              Mostrando
            </p>

            <p className="text-lg font-semibold text-ink">
              {totalFiltrados}
            </p>
          </div>
        </div>
      </div>
      */}

      {/* =====================================================
          EXISTENCIAS
          ===================================================== */}

      <div className="space-y-3">

        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-ink">
              Existencias actuales
            </h2>

            <p className="mt-0.5 text-xs text-muted">
              Consulta las cantidades disponibles por producto.
            </p>
          </div>

          {totalFiltrados > 0 && (
            <Badge variant="neutral">
              {totalFiltrados}{' '}
              {totalFiltrados === 1
                ? 'producto'
                : 'productos'}
            </Badge>
          )}
        </div>

        <div className="card space-y-3">
          <div className="relative">
            <Search
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-muted
              "
            />

            <input
              type="text"
              placeholder="Buscar por producto o categoría…"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value,
                )
              }
              className="input pl-9"
            />
          </div>

          <CategoriaFilter
            categorias={categorias}
            categoriaSeleccionada={
              categoriaSeleccionada
            }
            onChange={
              setCategoriaSeleccionada
            }
          />
        </div>

        {isLoading && (
          <Spinner
            label="Cargando existencias…"
          />
        )}

        {isError && (
          <ErrorState
            message={
              error?.message
            }
            onRetry={() =>
              refetch()
            }
          />
        )}

        {!isLoading &&
          !isError &&
          filtered.length === 0 && (
            <EmptyState
              title={
                search ||
                categoriaSeleccionada !==
                  null
                  ? 'Sin resultados'
                  : 'Sin existencias registradas'
              }
              description={
                search ||
                categoriaSeleccionada !==
                  null
                  ? 'Prueba con otro término de búsqueda o categoría.'
                  : 'Todavía no hay productos con existencias en esta sucursal.'
              }
            />
          )}

        {!isLoading &&
          !isError &&
          filtered.length > 0 && (
            <>
              {/* MÓVIL */}

              <div className="space-y-2 md:hidden">
                {filtered.map(
                  (item) => (
                    <StockCard
                      key={`${item.tipoStock}-${item.idProducto}`}
                      item={item}
                    />
                  ),
                )}
              </div>

              {/* DESKTOP */}

              <div
                className="
                  hidden
                  overflow-hidden
                  rounded-2xl
                  border
                  border-line
                  md:block
                "
              >
                <table className="w-full text-left text-sm">
                  <thead
                    className="
                      bg-surface-2
                      text-xs
                      uppercase
                      tracking-wide
                      text-muted
                    "
                  >
                    <tr>
                      <th className="px-4 py-3 font-medium">
                        Producto
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Categoría
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Tipo
                      </th>

                      <th className="px-4 py-3 text-right font-medium">
                        Existencia
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-line bg-surface">
                    {filtered.map(
                      (item) => (
                        <tr
                          key={`${item.tipoStock}-${item.idProducto}`}
                          className="transition-colors hover:bg-surface-2"
                        >
                          <td className="px-4 py-3 font-medium text-ink">
                            {item.nombreProducto}
                          </td>

                          <td className="px-4 py-3 text-muted">
                            {item.nombreCategoria}
                          </td>

                          <td className="px-4 py-3">
                            <TipoStockBadge
                              tipoStock={
                                item.tipoStock
                              }
                            />
                          </td>

                          <td className="px-4 py-3 text-right font-semibold text-ink">
                            {item.cantidadExistente}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
      </div>
    </div>
  );
}

/*
 * ============================================================
 * TIPO DE STOCK
 * ============================================================
 */

function TipoStockBadge({
  tipoStock,
}: {
  tipoStock: StockGeneralItem['tipoStock'];
}) {
  return tipoStock ===
    'Stock Diario' ? (
    <Badge variant="brand">
      Diario
    </Badge>
  ) : (
    <Badge variant="neutral">
      General
    </Badge>
  );
}

/*
 * ============================================================
 * STOCK CARD
 * ============================================================
 */

function StockCard({
  item,
}: {
  item: StockGeneralItem;
}) {
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-surface-2
              text-ink/70
            "
          >
            <Boxes className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">
              {item.nombreProducto}
            </p>

            <p className="truncate text-xs text-muted">
              {item.nombreCategoria}
            </p>
          </div>
        </div>

        <TipoStockBadge
          tipoStock={
            item.tipoStock
          }
        />
      </div>

      <div
        className="
          mt-3
          flex
          items-center
          justify-between
          border-t
          border-line
          pt-3
        "
      >
        <span className="text-xs text-muted">
          Existencia
        </span>

        <span className="text-lg font-semibold text-ink">
          {item.cantidadExistente}
        </span>
      </div>
    </div>
  );
}