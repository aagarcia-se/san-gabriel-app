import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { ArrowDownCircle } from 'lucide-react';

import {
  ProductoStockItem,
  ProductosStockExistentePicker,
} from '@/shared/ui/components/ProductosStockExistentePicker';

import { useSucursales } from '@/features/sucursales/api/useSucursales';
import { useDescontarStock } from '../api/useInventarioMutations';
import { useAuthStore } from '@/features/auth/store/authStore';
import type {
  DescontarStockRequest,
  TipoDescuento,
  TurnoDescuento,
} from '../types/inventarios.types';

import { PageHeader } from '@/shared/ui/PageHeader';
import { Alert } from '@/shared/ui/Alert';
import { ButtonSpinner } from '@/shared/ui/ButtonSpinner';

import type { ApiError } from '@/shared/api/httpClient';

const TURNOS: TurnoDescuento[] = ['AM', 'PM'];

const TIPOS_DESCUENTO: { value: TipoDescuento; label: string }[] = [
  { value: 'MAYOREO', label: 'Venta por mayor' },
  { value: 'MAL ESTADO', label: 'Pérdida' },
  { value: 'CORRECCION', label: 'Corrección de stock' },
];

export function DescontarExistenciasPage() {
  const { idSucursal: idParam } = useParams<{ idSucursal: string }>();
  const idSucursal = Number(idParam);
  const fecha = dayjs().format('YYYY-MM-DD');

  const navigate = useNavigate();

  const idUsuario = useAuthStore((state) => state.user?.idUsuario) ?? 0;

  const { data: sucursales } = useSucursales();
  const nombreSucursal = sucursales?.find((s) => s.idSucursal === idSucursal)?.nombreSucursal;

  const [seleccionados, setSeleccionados] = useState<ProductoStockItem[]>([]);
  const [turno, setTurno] = useState<TurnoDescuento>('AM');
  const [tipoDescuento, setTipoDescuento] = useState<TipoDescuento | null>(null);
  const [productosValidos, setProductosValidos] = useState(true);

  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState(false);

  const descontarStock = useDescontarStock();

  function handleGuardar() {
    setError(undefined);
    setSuccess(false);

    if (seleccionados.length === 0) {
      setError('Agrega al menos un producto con cantidad a descontar.');
      return;
    }

    if (!tipoDescuento) {
      setError('Selecciona el tipo de descuento.');
      return;
    }

    if (!productosValidos) {
      setError('Hay productos con una cantidad mayor a su existencia disponible. Corrígelos antes de guardar.');
      return;
    }

    const ahora = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const hoy = dayjs().format('YYYY-MM-DD');

    const payload: DescontarStockRequest = {
      descuentoInfo: {
        idSucursal,
        idUsuario,
        tipoDescuento,
        descuentoTurno: turno,
        fechaDescuento: ahora,
        fechaCreacion: hoy,
      },
      detalleDescuento: seleccionados.map((item) => ({
        idProducto: item.idProducto,
        controlarStock: item.controlarStock,
        controlarStockDiario: item.controlarStockDiario,
        stockADescontar: item.cantidad,
        fechaDescuento: ahora,
      })),
    };

    descontarStock.mutate(payload, {
      onSuccess: () => {
        setSuccess(true);
        setSeleccionados([]);
      },
      onError: (err: unknown) => {
        setError((err as ApiError).message ?? 'No se pudo descontar el stock.');
      },
    });
  }

  return (
    <div className="space-y-4 pb-4">
      <PageHeader
        title="Restar existencias"
        description={nombreSucursal ? `Sucursal: ${nombreSucursal}` : undefined}
        backTo={`/inventarios/${idSucursal}`}
      />

      {/* Turno y tipo de descuento */}
      <div className="card space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink/80">Turno</label>
          <div className="flex gap-2">
            {TURNOS.map((opcion) => (
              <button
                key={opcion}
                type="button"
                disabled={descontarStock.isPending}
                onClick={() => setTurno(opcion)}
                className={
                  turno === opcion
                    ? 'flex-1 rounded-lg border border-brand-500 bg-brand-500/10 px-3 py-2 text-sm font-medium text-brand-600 dark:text-brand-400'
                    : 'flex-1 rounded-lg border border-line px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-ink'
                }
              >
                {opcion}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink/80">Tipo de descuento</label>
          <div className="flex flex-wrap gap-2">
            {TIPOS_DESCUENTO.map((opcion) => (
              <button
                key={opcion.value}
                type="button"
                disabled={descontarStock.isPending}
                onClick={() => setTipoDescuento(opcion.value)}
                className={
                  tipoDescuento === opcion.value
                    ? 'rounded-full bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm'
                    : 'rounded-full bg-surface-2 px-4 py-2.5 text-sm font-semibold text-muted transition-all hover:bg-surface hover:text-ink'
                }
              >
                {opcion.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ProductosStockExistentePicker
        idSucursal={idSucursal}
        fecha={fecha}
        value={seleccionados}
        onChange={setSeleccionados}
        disabled={descontarStock.isPending}
        cantidadInicial={0}
        limitarAExistencia
        onValidezCambio={setProductosValidos}
      />

      {/* =====================================================
          ALERTA DE ERROR
          ===================================================== */}

      {error && (
        <Alert variant="danger" floating position="top-right" onDismiss={() => setError(undefined)}>
          {error}
        </Alert>
      )}

      {/* =====================================================
          ALERTA DE ÉXITO
          ===================================================== */}

      {success && (
        <Alert
          variant="success"
          floating
          position="top-right"
          onDismiss={() => setSuccess(false)}
          autoDismissMs={5000}
        >
          Existencias descontadas correctamente.
        </Alert>
      )}

      <div className="sticky bottom-20 z-10 sm:bottom-4">
        <div className="card flex flex-col gap-3 shadow-lg sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            {seleccionados.length === 0
              ? 'Selecciona productos para descontar existencias.'
              : `${seleccionados.length} producto(s) listo(s) para guardar.`}
          </p>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate(`/inventarios/${idSucursal}`)}
              disabled={descontarStock.isPending}
              className="btn-secondary"
            >
              Regresar
            </button>

            <button
              type="button"
              onClick={handleGuardar}
              disabled={
                descontarStock.isPending ||
                seleccionados.length === 0 ||
                !tipoDescuento ||
                !productosValidos
              }
              className="btn-primary"
            >
              {descontarStock.isPending && <ButtonSpinner />}

              <ArrowDownCircle className="h-4 w-4" />

              {descontarStock.isPending ? 'Guardando…' : 'Guardar descuento'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}