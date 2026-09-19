import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  ArrowDownCircle,
  ArrowRightLeft,
  Eye,
  Search,
  Trash2,
} from 'lucide-react';

import { useSucursales } from '@/features/sucursales/api/useSucursales';
import { useCancelarDescuento, useEliminarTraslado } from '../api/useInventarioMutations';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Badge } from '@/shared/ui/Badge';
import { Alert } from '@/shared/ui/Alert';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { cn } from '@/shared/lib/cn';
import type { MovimientoUnificado, TipoMovimiento } from '../types/inventarios.types';
import { useDescuentos, useTraslados } from '../api/useStockGeneral';
import type { ApiError } from '@/shared/api/httpClient';

type FiltroTipo = 'todos' | TipoMovimiento;

const FILTROS: { key: FiltroTipo; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'descuento', label: 'Descuentos' },
  { key: 'traslado', label: 'Traslados' },
];

export function HistorialMovimientosPage() {
  const { idSucursal: idParam } = useParams<{ idSucursal: string }>();
  const idSucursal = Number(idParam);

  const { data: sucursales } = useSucursales();
  const nombreSucursal = sucursales?.find((s) => s.idSucursal === idSucursal)?.nombreSucursal;

  const {
    data: descuentos,
    isLoading: isLoadingDescuentos,
    isError: isErrorDescuentos,
    error: errorDescuentos,
    refetch: refetchDescuentos,
  } = useDescuentos(idSucursal);

  const {
    data: traslados,
    isLoading: isLoadingTraslados,
    isError: isErrorTraslados,
    error: errorTraslados,
    refetch: refetchTraslados,
  } = useTraslados();

  const cancelarDescuento = useCancelarDescuento();
  const eliminarTrasladoMutation = useEliminarTraslado();

  const [filtro, setFiltro] = useState<FiltroTipo>('todos');
  const [search, setSearch] = useState('');
  const [movimientoAEliminar, setMovimientoAEliminar] = useState<MovimientoUnificado | null>(null);
  const [actionError, setActionError] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();

  const isLoading = isLoadingDescuentos || isLoadingTraslados;
  const isError = isErrorDescuentos || isErrorTraslados;
  const isDeleting = cancelarDescuento.isPending || eliminarTrasladoMutation.isPending;

  /* ------------------------------------------------------------------
     NORMALIZACIÓN

     Ambos endpoints devuelven formas distintas — se unifican en
     MovimientoUnificado para poder mezclarlos en una sola lista.
  ------------------------------------------------------------------ */

  const movimientos = useMemo<MovimientoUnificado[]>(() => {
    const desdeDescuentos: MovimientoUnificado[] = (descuentos ?? []).map((d) => ({
      tipo: 'descuento',
      id: d.idDescuento,
      fecha: d.fechaDescuento,
      usuario: d.nombreUsuario.trim(),
      descripcion: d.tipoDescuento,
      detalle: `Turno ${d.descuentoTurno}`,
    }));

    // El endpoint de traslados no filtra por sucursal ni expone ids —
    // se filtra en el cliente comparando contra el nombre de la sucursal
    // actual (origen o destino). Si el endpoint llega a aceptar
    // idSucursal, conviene mover este filtro al backend.
    const desdeTraslados: MovimientoUnificado[] = (traslados ?? [])
      .filter(
        (t) =>
          !nombreSucursal ||
          t.sucursalOrigen === nombreSucursal ||
          t.sucursalDestino === nombreSucursal,
      )
      .map((t) => ({
        tipo: 'traslado',
        id: t.idTraslado,
        fecha: t.fechaTraslado,
        usuario: t.usuarioResponsable.trim(),
        descripcion:
          t.sucursalOrigen === nombreSucursal
            ? `Enviado a ${t.sucursalDestino}`
            : `Recibido de ${t.sucursalOrigen}`,
        detalle: `${t.sucursalOrigen} → ${t.sucursalDestino}`,
      }));

    return [...desdeDescuentos, ...desdeTraslados].sort(
      (a, b) => dayjs(b.fecha).valueOf() - dayjs(a.fecha).valueOf(),
    );
  }, [descuentos, traslados, nombreSucursal]);

  /* ------------------------------------------------------------------
     FILTRO
  ------------------------------------------------------------------ */

  const filtrados = useMemo(() => {
    const term = search.trim().toLowerCase();

    return movimientos.filter((m) => {
      if (filtro !== 'todos' && m.tipo !== filtro) return false;

      if (term) {
        return `${m.usuario} ${m.descripcion} ${m.detalle}`.toLowerCase().includes(term);
      }

      return true;
    });
  }, [movimientos, filtro, search]);

  const conteoPorTipo = useMemo(
    () => ({
      todos: movimientos.length,
      descuento: movimientos.filter((m) => m.tipo === 'descuento').length,
      traslado: movimientos.filter((m) => m.tipo === 'traslado').length,
    }),
    [movimientos],
  );

  function handleRetry() {
    refetchDescuentos();
    refetchTraslados();
  }

  /* ------------------------------------------------------------------
     ELIMINAR

     Cada tipo de movimiento tiene su propio endpoint — se decide
     cuál usar según el tipo del movimiento seleccionado.
  ------------------------------------------------------------------ */

  function handleConfirmEliminar() {
    if (!movimientoAEliminar) return;

    setActionError(undefined);
    setSuccessMessage(undefined);

    const onError = (err: unknown) => {
      setActionError(
        (err as ApiError).message ?? 'No se pudo eliminar el movimiento.',
      );
    };

    if (movimientoAEliminar.tipo === 'descuento') {
      cancelarDescuento.mutate(movimientoAEliminar.id, {
        onSuccess: () => {
          setMovimientoAEliminar(null);
          setSuccessMessage('Descuento eliminado correctamente.');
        },
        onError,
      });
      return;
    }

    eliminarTrasladoMutation.mutate(movimientoAEliminar.id, {
      onSuccess: () => {
        setMovimientoAEliminar(null);
        setSuccessMessage('Traslado eliminado correctamente.');
      },
      onError,
    });
  }

  return (
    <div className="space-y-5 pb-6">
      <PageHeader
        title="Historial de movimientos"
        description={nombreSucursal ? `Sucursal: ${nombreSucursal}` : undefined}
        backTo={`/inventarios/${idSucursal}`}
      />

      {successMessage && (
        <Alert
          variant="success"
          onDismiss={() => setSuccessMessage(undefined)}
          autoDismissMs={5000}
        >
          {successMessage}
        </Alert>
      )}

      {/* =====================================================
          FILTROS
          ===================================================== */}

      <div className="card space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTROS.map((opcion) => (
            <button
              key={opcion.key}
              type="button"
              onClick={() => setFiltro(opcion.key)}
              className={cn(
                'shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-all',
                filtro === opcion.key
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-surface-2 text-muted hover:bg-surface hover:text-ink',
              )}
            >
              {opcion.label}
              <span
                className={cn(
                  'ml-2 text-xs',
                  filtro === opcion.key ? 'text-white/80' : 'text-muted',
                )}
              >
                {conteoPorTipo[opcion.key]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Buscar por usuario, tipo o sucursal…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
      </div>

      {isLoading && <Spinner label="Cargando movimientos…" />}

      {isError && (
        <ErrorState
          message={errorDescuentos?.message ?? errorTraslados?.message}
          onRetry={handleRetry}
        />
      )}

      {!isLoading && !isError && filtrados.length === 0 && (
        <EmptyState
          title={search || filtro !== 'todos' ? 'Sin resultados' : 'Sin movimientos registrados'}
          description={
            search || filtro !== 'todos'
              ? 'Prueba con otro término de búsqueda o filtro.'
              : 'Todavía no se han registrado descuentos ni traslados en esta sucursal.'
          }
        />
      )}

      {!isLoading && !isError && filtrados.length > 0 && (
        <>
          {/* MÓVIL */}
          <div className="space-y-2 md:hidden">
            {filtrados.map((movimiento) => (
              <MovimientoCard
                key={`${movimiento.tipo}-${movimiento.id}`}
                movimiento={movimiento}
                idSucursal={idSucursal}
                disabled={isDeleting}
                onEliminar={() => {
                  setActionError(undefined);
                  setMovimientoAEliminar(movimiento);
                }}
              />
            ))}
          </div>

          {/* DESKTOP */}
          <div className="hidden overflow-hidden rounded-2xl border border-line md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Descripción</th>
                  <th className="px-4 py-3 font-medium">Responsable</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-surface">
                {filtrados.map((movimiento) => (
                  <tr
                    key={`${movimiento.tipo}-${movimiento.id}`}
                    className="transition-colors hover:bg-surface-2"
                  >
                    <td className="px-4 py-3">
                      <TipoMovimientoBadge tipo={movimiento.tipo} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{movimiento.descripcion}</p>
                      <p className="text-xs text-muted">{movimiento.detalle}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">{movimiento.usuario}</td>
                    <td className="px-4 py-3 text-muted">
                      {dayjs(movimiento.fecha).format('DD/MM/YYYY HH:mm')}
                    </td>
                    <td className="px-4 py-3">
                      <MovimientoActions
                        movimiento={movimiento}
                        idSucursal={idSucursal}
                        disabled={isDeleting}
                        onEliminar={() => {
                          setActionError(undefined);
                          setMovimientoAEliminar(movimiento);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ConfirmDialog
        open={movimientoAEliminar !== null}
        title={
          movimientoAEliminar?.tipo === 'descuento'
            ? '¿Eliminar descuento?'
            : '¿Eliminar traslado?'
        }
        description={
          movimientoAEliminar
            ? `${movimientoAEliminar.descripcion} · ${movimientoAEliminar.detalle}. Esta acción no se puede deshacer.`
            : undefined
        }
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={isDeleting}
        errorMessage={actionError}
        onConfirm={handleConfirmEliminar}
        onCancel={() => {
          setMovimientoAEliminar(null);
          setActionError(undefined);
        }}
      />
    </div>
  );
}

/* ==========================================================================
   BADGE DE TIPO
   ========================================================================== */

function TipoMovimientoBadge({ tipo }: { tipo: TipoMovimiento }) {
  return tipo === 'descuento' ? (
    <Badge variant="danger">Descuento</Badge>
  ) : (
    <Badge variant="brand">Traslado</Badge>
  );
}

/* ==========================================================================
   ACCIONES
   ========================================================================== */

function MovimientoActions({
  movimiento,
  idSucursal,
  disabled,
  onEliminar,
}: {
  movimiento: MovimientoUnificado;
  idSucursal: number;
  disabled: boolean;
  onEliminar: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        to={`/inventarios/${idSucursal}/historial/${movimiento.tipo}/${movimiento.id}`}
        aria-label="Ver detalle"
        title="Ver detalle"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
      >
        <Eye className="h-4 w-4" />
      </Link>
      <button
        type="button"
        aria-label="Eliminar"
        title="Eliminar"
        disabled={disabled}
        onClick={onEliminar}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-500/10 hover:text-danger-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:text-danger-400"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ==========================================================================
   CARD MÓVIL
   ========================================================================== */

function MovimientoCard({
  movimiento,
  idSucursal,
  disabled,
  onEliminar,
}: {
  movimiento: MovimientoUnificado;
  idSucursal: number;
  disabled: boolean;
  onEliminar: () => void;
}) {
  const esDescuento = movimiento.tipo === 'descuento';
  const Icono = esDescuento ? ArrowDownCircle : ArrowRightLeft;

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              esDescuento
                ? 'bg-danger-500/10 text-danger-600 dark:text-danger-400'
                : 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
            )}
          >
            <Icono className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{movimiento.descripcion}</p>
            <p className="truncate text-xs text-muted">{movimiento.detalle}</p>
          </div>
        </div>

        <TipoMovimientoBadge tipo={movimiento.tipo} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3 text-xs">
        <div className="min-w-0">
          <p className="text-muted">Responsable</p>
          <p className="truncate text-ink">{movimiento.usuario}</p>
        </div>
        <div>
          <p className="text-muted">Fecha</p>
          <p className="text-ink">{dayjs(movimiento.fecha).format('DD/MM/YYYY HH:mm')}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1 border-t border-line pt-3">
        <MovimientoActions
          movimiento={movimiento}
          idSucursal={idSucursal}
          disabled={disabled}
          onEliminar={onEliminar}
        />
      </div>
    </div>
  );
}