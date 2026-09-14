import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { ArrowDownCircle, ArrowRightLeft, Boxes, PackagePlus, Search } from 'lucide-react';
import { useState } from 'react';
import { useSucursales } from '@/features/sucursales/api/useSucursales';
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
    descripcion: 'Registra productos que entraron a la sucursal.',
    icono: PackagePlus,
    color: 'text-success-600 dark:text-success-400 bg-success-500/10',
  },
  {
    key: 'descontar',
    titulo: 'Restar existencias',
    descripcion: 'Descuenta productos dañados, vencidos o perdidos.',
    icono: ArrowDownCircle,
    color: 'text-danger-600 dark:text-danger-400 bg-danger-500/10',
  },
  {
    key: 'trasladar',
    titulo: 'Trasladar existencias',
    descripcion: 'Mueve productos de esta sucursal hacia otra.',
    icono: ArrowRightLeft,
    color: 'text-brand-600 dark:text-brand-400 bg-brand-500/10',
  },
] as const;

export function InventarioSucursalPage() {
  const { idSucursal: idParam } = useParams<{ idSucursal: string }>();
  const idSucursal = Number(idParam);
  const fecha = dayjs().format('YYYY-MM-DD');

  const { data: sucursales } = useSucursales();
  const nombreSucursal = sucursales?.find((s) => s.idSucursal === idSucursal)?.nombreSucursal;

  const { data: stock, isLoading, isError, error, refetch } = useStockGeneral(idSucursal, fecha);

  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!stock) return [];
    const term = search.trim().toLowerCase();
    if (!term) return stock;
    return stock.filter(
      (s) =>
        s.nombreProducto.toLowerCase().includes(term) ||
        s.nombreCategoria.toLowerCase().includes(term),
    );
  }, [stock, search]);

  return (
    <div className="space-y-4">
      <PageHeader
        title={nombreSucursal ?? 'Inventario de sucursal'}
        description="Existencias actuales por producto."
        backTo="/inventarios"
      />

      {/* Opciones de gestión */}
      <div className="grid gap-3 sm:grid-cols-3">
        {OPCIONES.map((opcion) => {
          const Icono = opcion.icono;
          return (
            <Link
              key={opcion.key}
              to={`/inventarios/${idSucursal}/${opcion.key}`}
              className="card flex flex-col gap-2 transition-colors hover:bg-surface-2"
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-full ${opcion.color}`}>
                <Icono className="h-4.5 w-4.5" />
              </div>
              <p className="text-sm font-medium text-ink">{opcion.titulo}</p>
              <p className="text-xs text-muted">{opcion.descripcion}</p>
            </Link>
          );
        })}
      </div>

      {/* Existencias actuales */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-ink/80">Existencias actuales</h2>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Buscar por producto o categoría…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>

        {isLoading && <Spinner label="Cargando existencias…" />}

        {isError && <ErrorState message={error?.message} onRetry={() => refetch()} />}

        {!isLoading && !isError && filtered.length === 0 && (
          <EmptyState
            title={search ? 'Sin resultados' : 'Sin existencias registradas'}
            description={
              search
                ? 'Prueba con otro término de búsqueda.'
                : 'Todavía no hay productos con existencias en esta sucursal.'
            }
          />
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <>
            {/* Móvil: tarjetas */}
            <div className="space-y-2 md:hidden">
              {filtered.map((item) => (
                <StockCard key={`${item.tipoStock}-${item.idProducto}`} item={item} />
              ))}
            </div>

            {/* Desktop: tabla */}
            <div className="hidden overflow-hidden rounded-2xl border border-line md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-2 text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Producto</th>
                    <th className="px-4 py-3 font-medium">Categoría</th>
                    <th className="px-4 py-3 font-medium">Tipo</th>
                    <th className="px-4 py-3 font-medium text-right">Existencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-surface">
                  {filtered.map((item) => (
                    <tr
                      key={`${item.tipoStock}-${item.idProducto}`}
                      className="transition-colors hover:bg-surface-2"
                    >
                      <td className="px-4 py-3 font-medium text-ink">{item.nombreProducto}</td>
                      <td className="px-4 py-3 text-muted">{item.nombreCategoria}</td>
                      <td className="px-4 py-3">
                        <TipoStockBadge tipoStock={item.tipoStock} />
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-ink">
                        {item.cantidadExistente}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TipoStockBadge({ tipoStock }: { tipoStock: StockGeneralItem['tipoStock'] }) {
  return tipoStock === 'Stock Diario' ? (
    <Badge variant="brand">Diario</Badge>
  ) : (
    <Badge variant="neutral">General</Badge>
  );
}

function StockCard({ item }: { item: StockGeneralItem }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink/70">
            <Boxes className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{item.nombreProducto}</p>
            <p className="truncate text-xs text-muted">{item.nombreCategoria}</p>
          </div>
        </div>
        <TipoStockBadge tipoStock={item.tipoStock} />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
        <span className="text-xs text-muted">Existencia</span>
        <span className="text-lg font-semibold text-ink">{item.cantidadExistente}</span>
      </div>
    </div>
  );
}