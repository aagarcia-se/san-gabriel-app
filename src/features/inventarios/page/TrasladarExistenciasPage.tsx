import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { ArrowRightLeft, Building2 } from 'lucide-react';

import {
  ProductoStockItem,
  ProductosStockExistentePicker,
} from '@/shared/ui/components/ProductosStockExistentePicker';

import { useSucursales } from '@/features/sucursales/api/useSucursales';
import { useRegistrarTraslado } from '../api/useInventarioMutations';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { RegistrarTrasladoRequest } from '../types/inventarios.types';

import { PageHeader } from '@/shared/ui/PageHeader';
import { IconField } from '@/shared/ui/IconField';
import { Alert } from '@/shared/ui/Alert';
import { ButtonSpinner } from '@/shared/ui/ButtonSpinner';

import type { ApiError } from '@/shared/api/httpClient';

export function TrasladarExistenciasPage() {
  const { idSucursal: idParam } = useParams<{ idSucursal: string }>();
  const idSucursalOrigen = Number(idParam);
  const fecha = dayjs().format('YYYY-MM-DD');

  const navigate = useNavigate();

  const idUsuario = useAuthStore((state) => state.user?.idUsuario) ?? 0;

  const { data: sucursales, isLoading: isLoadingSucursales, isError: isSucursalesError } =
    useSucursales();

  const nombreSucursalOrigen = sucursales?.find(
    (s) => s.idSucursal === idSucursalOrigen,
  )?.nombreSucursal;

  // No puedes trasladar una sucursal hacia sí misma — se quita del
  // selector de destino.
  const sucursalesDestino = useMemo(
    () => (sucursales ?? []).filter((s) => s.idSucursal !== idSucursalOrigen),
    [sucursales, idSucursalOrigen],
  );

  const [idSucursalDestino, setIdSucursalDestino] = useState('');
  const [seleccionados, setSeleccionados] = useState<ProductoStockItem[]>([]);
  const [productosValidos, setProductosValidos] = useState(true);

  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState(false);

  const registrarTraslado = useRegistrarTraslado();

  function handleGuardar() {
    setError(undefined);
    setSuccess(false);

    if (!idSucursalDestino) {
      setError('Selecciona la sucursal destino.');
      return;
    }

    if (seleccionados.length === 0) {
      setError('Agrega al menos un producto con cantidad a trasladar.');
      return;
    }

    if (!productosValidos) {
      setError(
        'Hay productos con una cantidad mayor a su existencia disponible. Corrígelos antes de guardar.',
      );
      return;
    }

    const ahora = dayjs().format('YYYY-MM-DD HH:mm:ss');

    const payload: RegistrarTrasladoRequest = {
      traladoHeader: {
        idSucursalOrigen,
        idSucursalDestino: Number(idSucursalDestino),
        idUsuario,
        fechaTraslado: ahora,
      },
      trasladoDetalle: seleccionados.map((item) => ({
        idProducto: item.idProducto,
        tipoProduccion: item.tipoProduccion,
        controlarStock: item.controlarStock,
        controlarStockDiario: item.controlarStockDiario,
        cantidadATrasladar: item.cantidad,
        fechaTraslado: ahora,
      })),
    };

    registrarTraslado.mutate(payload, {
      onSuccess: () => {
        setSuccess(true);
        setSeleccionados([]);
      },
      onError: (err: unknown) => {
        setError((err as ApiError).message ?? 'No se pudo registrar el traslado.');
      },
    });
  }

  return (
    <div className="space-y-4 pb-4">
      <PageHeader
        title="Trasladar existencias"
        description={nombreSucursalOrigen ? `Desde: ${nombreSucursalOrigen}` : undefined}
        backTo={`/inventarios/${idSucursalOrigen}`}
      />

      {/* Sucursal destino */}
      <div className="card space-y-1.5">
        <label htmlFor="idSucursalDestino" className="text-sm font-medium text-ink/80">
          Sucursal destino
        </label>

        {isSucursalesError ? (
          <p className="text-xs text-danger-600 dark:text-danger-400">
            No se pudo cargar la lista de sucursales.
          </p>
        ) : (
          <IconField icon={Building2}>
            <select
              id="idSucursalDestino"
              required
              value={idSucursalDestino}
              onChange={(e) => setIdSucursalDestino(e.target.value)}
              disabled={registrarTraslado.isPending || isLoadingSucursales}
              className="input pl-9"
            >
              <option value="" disabled>
                {isLoadingSucursales ? 'Cargando…' : 'Selecciona una sucursal'}
              </option>
              {sucursalesDestino.map((sucursal) => (
                <option key={sucursal.idSucursal} value={sucursal.idSucursal}>
                  {sucursal.nombreSucursal}
                </option>
              ))}
            </select>
          </IconField>
        )}
      </div>

      <ProductosStockExistentePicker
        idSucursal={idSucursalOrigen}
        fecha={fecha}
        value={seleccionados}
        onChange={setSeleccionados}
        disabled={registrarTraslado.isPending}
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
          Traslado registrado correctamente.
        </Alert>
      )}

      <div className="sticky bottom-20 z-10 sm:bottom-4">
        <div className="card flex flex-col gap-3 shadow-lg sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            {seleccionados.length === 0
              ? 'Selecciona productos para trasladar.'
              : `${seleccionados.length} producto(s) listo(s) para guardar.`}
          </p>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate(`/inventarios/${idSucursalOrigen}`)}
              disabled={registrarTraslado.isPending}
              className="btn-secondary"
            >
              Regresar
            </button>

            <button
              type="button"
              onClick={handleGuardar}
              disabled={
                registrarTraslado.isPending ||
                seleccionados.length === 0 ||
                !idSucursalDestino ||
                !productosValidos
              }
              className="btn-primary"
            >
              {registrarTraslado.isPending && <ButtonSpinner />}

              <ArrowRightLeft className="h-4 w-4" />

              {registrarTraslado.isPending ? 'Guardando…' : 'Guardar traslado'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}