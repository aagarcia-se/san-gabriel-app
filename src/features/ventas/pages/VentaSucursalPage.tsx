import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { Eye, FileText, Plus, Trash2 } from 'lucide-react';

import { useSucursales } from '@/features/sucursales/api/useSucursales';
import { useVentasPorSucursal } from '../api/useVentas';
import { useEliminarVenta } from '../api/useVentaMutations';
import { useAuthStore } from '@/features/auth/store/authStore';

import { PageHeader } from '@/shared/ui/PageHeader';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Badge } from '@/shared/ui/Badge';
import { Alert } from '@/shared/ui/Alert';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

import type { ApiError } from '@/shared/api/httpClient';
import type { VentaItem } from '../types/ventas.types';

function formatoMoneda(valor: number) {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(valor);
}

function EstadoVentaBadge({ estado }: { estado: VentaItem['estadoVenta'] }) {
  return estado === 'P' ? (
    <Badge variant="warning">Pendiente</Badge>
  ) : (
    <Badge variant="success">Completada</Badge>
  );
}

export function VentaSucursalPage() {
  const { idSucursal: idParam } = useParams<{ idSucursal: string }>();
  const idSucursal = Number(idParam);

  const { data: sucursales } = useSucursales();
  const nombreSucursal = sucursales?.find((s) => s.idSucursal === idSucursal)?.nombreSucursal;

  const {
    data: ventas,
    isLoading,
    isError,
    error,
    refetch,
  } = useVentasPorSucursal(idSucursal);

  // OJO: ajusta esta comparación si el rol de administrador en tu API
  // no es idRol === 1 / rol === "admin" — es el mismo criterio que ya
  // usamos en InventariosSucursalesPage.
  const idRolUsuario = useAuthStore((state) => state.user?.idRol);
  const rolUsuario = useAuthStore((state) => state.user?.rol);
  const idUsuarioActual = useAuthStore((state) => state.user?.idUsuario);
  const esAdmin = idRolUsuario === 1 || rolUsuario?.trim().toLowerCase() === 'admin';

  function puedeEliminar(venta: VentaItem) {
    return esAdmin || venta.idUsuario === idUsuarioActual;
  }

  const eliminarVenta = useEliminarVenta();
  const [ventaAEliminar, setVentaAEliminar] = useState<VentaItem | null>(null);
  const [actionError, setActionError] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();

  function handleVerPdf(venta: VentaItem) {
    // TODO: conectar con el visor de PDF que ya armamos para órdenes de
    // producción (OrdenProduccionPdfDocument) en cuanto exista el
    // documento de venta — mismo patrón: pdf(<VentaPdfDocument .../>).toBlob().
    console.log('Ver PDF de la venta', venta.idVenta);
  }

  function handleConfirmEliminar() {
    if (!ventaAEliminar) return;

    setActionError(undefined);
    setSuccessMessage(undefined);

    eliminarVenta.mutate(
      {
        idVenta: ventaAEliminar.idVenta,
        dateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        onSuccess: () => {
          setVentaAEliminar(null);
          setSuccessMessage('Venta eliminada correctamente.');
        },
        onError: (err: unknown) => {
          setActionError((err as ApiError).message ?? 'No se pudo eliminar la venta.');
        },
      },
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={nombreSucursal ?? 'Ventas de sucursal'}
        description="Historial de ventas registradas en esta sucursal."
        backTo="/ventas"
      />

      {successMessage && (
        <Alert variant="success" onDismiss={() => setSuccessMessage(undefined)} autoDismissMs={5000}>
          {successMessage}
        </Alert>
      )}

      {/* TODO: implementar la página de captura en esta ruta. */}
      <div className="flex justify-end">
        <Link to={`/ventas/${idSucursal}/nueva`} className="btn-primary">
          <Plus className="h-4 w-4" />
          Nueva venta
        </Link>
      </div>

      {isLoading && <Spinner label="Cargando ventas…" />}

      {isError && <ErrorState message={error?.message} onRetry={() => refetch()} />}

      {!isLoading && !isError && (!ventas || ventas.length === 0) && (
        <EmptyState
          title="Sin ventas registradas"
          description="Todavía no hay ventas registradas en esta sucursal."
        />
      )}

      {!isLoading && !isError && ventas && ventas.length > 0 && (
        <>
          {/* Móvil: tarjetas */}
          <div className="space-y-2 md:hidden">
            {ventas.map((venta) => (
              <VentaCard
                key={venta.idVenta}
                idSucursal={idSucursal}
                venta={venta}
                puedeEliminar={puedeEliminar(venta)}
                disabled={eliminarVenta.isPending}
                onEliminar={() => setVentaAEliminar(venta)}
                onVerPdf={() => handleVerPdf(venta)}
              />
            ))}
          </div>

          {/* Desktop: tabla */}
          <div className="hidden overflow-hidden rounded-2xl border border-line md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Turno</th>
                  <th className="px-4 py-3 font-medium">Vendedor</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-surface">
                {ventas.map((venta) => {
                  const permitido = puedeEliminar(venta);
                  return (
                    <tr key={venta.idVenta} className="transition-colors hover:bg-surface-2">
                      <td className="px-4 py-3 font-medium text-ink">#{venta.idVenta}</td>
                      <td className="px-4 py-3 text-muted">{venta.fechaVenta}</td>
                      <td className="px-4 py-3 text-muted">{venta.ventaTurno}</td>
                      <td className="px-4 py-3 text-muted">{venta.nombreUsuario}</td>
                      <td className="px-4 py-3">
                        <EstadoVentaBadge estado={venta.estadoVenta} />
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-ink">
                        {formatoMoneda(venta.totalVenta)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {/* TODO: implementar VentaDetallePage en esta ruta. */}
                          <Link
                            to={`/ventas/${idSucursal}/${venta.idVenta}`}
                            title="Ver detalle"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleVerPdf(venta)}
                            title="Ver PDF"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
                          >
                            <FileText className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setVentaAEliminar(venta)}
                            disabled={eliminarVenta.isPending || !permitido}
                            title={permitido ? 'Eliminar venta' : 'Solo puedes eliminar tus propias ventas'}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-500/10 hover:text-danger-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:text-danger-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ConfirmDialog
        open={ventaAEliminar !== null}
        title="¿Eliminar venta?"
        description={
          ventaAEliminar
            ? `Venta #${ventaAEliminar.idVenta} · ${formatoMoneda(ventaAEliminar.totalVenta)}. Esta acción no se puede deshacer.`
            : undefined
        }
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={eliminarVenta.isPending}
        errorMessage={actionError}
        onConfirm={handleConfirmEliminar}
        onCancel={() => {
          setVentaAEliminar(null);
          setActionError(undefined);
        }}
      />
    </div>
  );
}

function VentaCard({
  idSucursal,
  venta,
  puedeEliminar,
  disabled,
  onEliminar,
  onVerPdf,
}: {
  idSucursal: number;
  venta: VentaItem;
  puedeEliminar: boolean;
  disabled: boolean;
  onEliminar: () => void;
  onVerPdf: () => void;
}) {
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink">Venta #{venta.idVenta}</p>
          <p className="text-xs text-muted">
            {venta.fechaVenta} · Turno {venta.ventaTurno}
          </p>
        </div>
        <EstadoVentaBadge estado={venta.estadoVenta} />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
        <span className="text-xs text-muted">{venta.nombreUsuario}</span>
        <span className="text-lg font-semibold text-ink">{formatoMoneda(venta.totalVenta)}</span>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1 border-t border-line pt-3">
        <Link
          to={`/ventas/${idSucursal}/${venta.idVenta}`}
          title="Ver detalle"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <Eye className="h-4 w-4" />
        </Link>

        <button
          type="button"
          onClick={onVerPdf}
          title="Ver PDF"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <FileText className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onEliminar}
          disabled={disabled || !puedeEliminar}
          title={puedeEliminar ? 'Eliminar venta' : 'Solo puedes eliminar tus propias ventas'}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-500/10 hover:text-danger-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:text-danger-400"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}