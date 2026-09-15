import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  ArrowRight,
  ArrowRightLeft,
  Building2,
  Package,
} from 'lucide-react';

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
  const {
    idSucursal: idParam,
  } = useParams<{ idSucursal: string }>();

  const idSucursalOrigen = Number(idParam);

  const fecha = dayjs().format('YYYY-MM-DD');

  const navigate = useNavigate();

  const idUsuario =
    useAuthStore(
      (state) => state.user?.idUsuario,
    ) ?? 0;

  const {
    data: sucursales,
    isLoading: isLoadingSucursales,
    isError: isSucursalesError,
  } = useSucursales();

  const nombreSucursalOrigen =
    sucursales?.find(
      (s) =>
        s.idSucursal ===
        idSucursalOrigen,
    )?.nombreSucursal;

  /*
   * No se permite trasladar hacia la misma
   * sucursal de origen.
   */
  const sucursalesDestino = useMemo(
    () =>
      (sucursales ?? []).filter(
        (s) =>
          s.idSucursal !==
          idSucursalOrigen,
      ),
    [sucursales, idSucursalOrigen],
  );

  const [
    idSucursalDestino,
    setIdSucursalDestino,
  ] = useState('');

  const [
    seleccionados,
    setSeleccionados,
  ] = useState<ProductoStockItem[]>([]);

  const [
    productosValidos,
    setProductosValidos,
  ] = useState(true);

  const [error, setError] =
    useState<string | undefined>();

  const [success, setSuccess] =
    useState(false);

  const registrarTraslado =
    useRegistrarTraslado();

  function handleGuardar() {
    setError(undefined);
    setSuccess(false);

    if (!idSucursalDestino) {
      setError(
        'Selecciona la sucursal destino.',
      );
      return;
    }

    if (seleccionados.length === 0) {
      setError(
        'Agrega al menos un producto con cantidad a trasladar.',
      );
      return;
    }

    if (!productosValidos) {
      setError(
        'Hay productos con una cantidad mayor a su existencia disponible. Corrígelos antes de guardar.',
      );
      return;
    }

    const ahora =
      dayjs().format(
        'YYYY-MM-DD HH:mm:ss',
      );

    const payload: RegistrarTrasladoRequest =
      {
        traladoHeader: {
          idSucursalOrigen,
          idSucursalDestino:
            Number(idSucursalDestino),
          idUsuario,
          fechaTraslado: ahora,
        },

        trasladoDetalle:
          seleccionados.map((item) => ({
            idProducto:
              item.idProducto,

            tipoProduccion:
              item.tipoProduccion,

            controlarStock:
              item.controlarStock,

            controlarStockDiario:
              item.controlarStockDiario,

            cantidadATrasladar:
              item.cantidad,

            fechaTraslado: ahora,
          })),
      };

    registrarTraslado.mutate(
      payload,
      {
        onSuccess: () => {
          setSuccess(true);
          setError(undefined);
          setSeleccionados([]);
        },

        onError: (err: unknown) => {
          setError(
            (err as ApiError).message ??
              'No se pudo registrar el traslado.',
          );
        },
      },
    );
  }

  const cantidadProductos =
    seleccionados.length;

  const tieneProductos =
    cantidadProductos > 0;

  const nombreSucursalDestino =
    sucursales?.find(
      (s) =>
        s.idSucursal ===
        Number(idSucursalDestino),
    )?.nombreSucursal;

  return (
    <div className="space-y-5 pb-28">

      {/* =====================================================
          ENCABEZADO
      ====================================================== */}

      <PageHeader
        title="Trasladar existencias"
        description={
          nombreSucursalOrigen
            ? `Desde: ${nombreSucursalOrigen}`
            : undefined
        }
        backTo={`/inventarios/${idSucursalOrigen}`}
      />

      {/* =====================================================
          RUTA DEL TRASLADO
      ====================================================== */}

      <div className="card overflow-hidden shadow-sm">

        <div className="mb-4 flex items-center gap-2">
          <ArrowRightLeft
            className="
              h-5
              w-5
              text-brand-500
            "
          />

          <div>
            <h2
              className="
                text-sm
                font-semibold
                text-ink
              "
            >
              Ruta del traslado
            </h2>

            <p className="text-xs text-muted">
              Selecciona la sucursal donde
              recibirán las existencias.
            </p>
          </div>
        </div>

        <div
          className="
            grid
            gap-3
            sm:grid-cols-[1fr_auto_1fr]
            sm:items-center
          "
        >

          {/* ORIGEN */}

          <div
            className="
              rounded-xl
              border
              border-brand-500/10
              bg-brand-500/5
              p-3
            "
          >
            <p
              className="
                mb-1
                text-[11px]
                font-semibold
                uppercase
                tracking-wide
                text-muted
              "
            >
              Origen
            </p>

            <div className="flex items-center gap-2">
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-brand-500/10
                  text-brand-500
                "
              >
                <Building2 className="h-4 w-4" />
              </div>

              <span
                className="
                  truncate
                  text-sm
                  font-semibold
                  text-ink
                "
              >
                {nombreSucursalOrigen ??
                  'Sucursal actual'}
              </span>
            </div>
          </div>

          {/* FLECHA */}

          <div
            className="
              hidden
              items-center
              justify-center
              sm:flex
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                border
                border-border
                bg-card
                text-muted
                shadow-sm
              "
            >
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>

          {/* DESTINO */}

          <div
            className="
              rounded-xl
              border
              border-border
              bg-muted/5
              p-3
              transition-colors
              focus-within:border-brand-500/40
              focus-within:ring-2
              focus-within:ring-brand-500/10
            "
          >
            <p
              className="
                mb-1
                text-[11px]
                font-semibold
                uppercase
                tracking-wide
                text-muted
              "
            >
              Destino
            </p>

            {isSucursalesError ? (
              <p
                className="
                  text-xs
                  text-danger-600
                  dark:text-danger-400
                "
              >
                No se pudo cargar la lista
                de sucursales.
              </p>
            ) : (
              <IconField icon={Building2}>
                <select
                  id="idSucursalDestino"
                  required
                  value={idSucursalDestino}
                  onChange={(e) =>
                    setIdSucursalDestino(
                      e.target.value,
                    )
                  }
                  disabled={
                    registrarTraslado.isPending ||
                    isLoadingSucursales
                  }
                  className="input pl-9"
                >
                  <option
                    value=""
                    disabled
                  >
                    {isLoadingSucursales
                      ? 'Cargando…'
                      : 'Selecciona una sucursal'}
                  </option>

                  {sucursalesDestino.map(
                    (sucursal) => (
                      <option
                        key={
                          sucursal.idSucursal
                        }
                        value={
                          sucursal.idSucursal
                        }
                      >
                        {
                          sucursal.nombreSucursal
                        }
                      </option>
                    ),
                  )}
                </select>
              </IconField>
            )}

            {nombreSucursalDestino && (
              <p
                className="
                  mt-2
                  truncate
                  text-xs
                  text-muted
                "
              >
                Recibirá las existencias
                seleccionadas.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          PRODUCTOS
      ====================================================== */}

      <div className="space-y-3">

        <div
          className="
            flex
            items-center
            justify-between
            gap-3
          "
        >
          <div className="flex items-center gap-2">
            <Package
              className="
                h-5
                w-5
                text-brand-500
              "
            />

            <div>
              <h2
                className="
                  text-sm
                  font-semibold
                  text-ink
                "
              >
                Productos a trasladar
              </h2>

              <p className="text-xs text-muted">
                Selecciona los productos y
                cantidades disponibles.
              </p>
            </div>
          </div>

          {tieneProductos && (
            <span
              className="
                shrink-0
                rounded-full
                bg-brand-500/10
                px-2.5
                py-1
                text-xs
                font-semibold
                text-brand-600
                dark:text-brand-400
              "
            >
              {cantidadProductos}{' '}
              {cantidadProductos === 1
                ? 'producto'
                : 'productos'}
            </span>
          )}
        </div>

        <ProductosStockExistentePicker
          idSucursal={idSucursalOrigen}
          fecha={fecha}
          value={seleccionados}
          onChange={setSeleccionados}
          disabled={
            registrarTraslado.isPending
          }
          cantidadInicial={0}
          limitarAExistencia
          onValidezCambio={
            setProductosValidos
          }
        />
      </div>

      {/* =====================================================
          ALERTA DE ERROR
      ====================================================== */}

      {error && (
        <Alert
          variant="danger"
          floating
          position="top-right"
          onDismiss={() =>
            setError(undefined)
          }
        >
          {error}
        </Alert>
      )}

      {/* =====================================================
          ALERTA DE ÉXITO
      ====================================================== */}

      {success && (
        <Alert
          variant="success"
          floating
          position="top-right"
          onDismiss={() =>
            setSuccess(false)
          }
          autoDismissMs={5000}
        >
          Traslado registrado correctamente.
        </Alert>
      )}

      {/* =====================================================
          BARRA DE ACCIONES
      ====================================================== */}

      <div
        className="
          sticky
          bottom-20
          z-10
          sm:bottom-4
        "
      >
        <div
          className="
            card
            flex
            flex-col
            gap-3
            shadow-lg
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          {/* RESUMEN */}

          <div
            className="
              flex
              min-w-0
              items-center
              gap-3
            "
          >
            <div
              className={`
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                ${
                  tieneProductos &&
                  idSucursalDestino &&
                  productosValidos
                    ? 'bg-brand-500/10 text-brand-500'
                    : 'bg-muted/20 text-muted'
                }
              `}
            >
              <ArrowRightLeft
                className="h-4 w-4"
              />
            </div>

            <div className="min-w-0">
              <p
                className="
                  truncate
                  text-sm
                  font-semibold
                  text-ink
                "
              >
                {tieneProductos
                  ? `${cantidadProductos} producto${
                      cantidadProductos === 1
                        ? ''
                        : 's'
                    } listo${
                      cantidadProductos === 1
                        ? ''
                        : 's'
                    } para trasladar`
                  : 'Ningún producto seleccionado'}
              </p>

              <p
                className="
                  truncate
                  text-xs
                  text-muted
                "
              >
                {idSucursalDestino
                  ? nombreSucursalDestino ??
                    'Sucursal destino seleccionada'
                  : 'Selecciona una sucursal destino'}
              </p>
            </div>
          </div>

          {/* BOTONES */}

          <div
            className="
              grid
              grid-cols-2
              gap-2
              sm:flex
              sm:shrink-0
            "
          >
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/inventarios/${idSucursalOrigen}`,
                )
              }
              disabled={
                registrarTraslado.isPending
              }
              className="
                btn-secondary
                min-h-11
                px-4
                font-medium
              "
            >
              Regresar
            </button>

            <button
              type="button"
              onClick={handleGuardar}
              disabled={
                registrarTraslado.isPending ||
                cantidadProductos === 0 ||
                !idSucursalDestino ||
                !productosValidos
              }
              className="
                btn-primary
                min-h-11
                px-5
                font-semibold
                shadow-md
                transition-all
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {registrarTraslado.isPending ? (
                <>
                  <ButtonSpinner />

                  <span>
                    Guardando…
                  </span>
                </>
              ) : (
                <>
                  <ArrowRightLeft
                    className="h-4 w-4"
                  />

                  <span>
                    Trasladar
                    {tieneProductos
                      ? ` (${cantidadProductos})`
                      : ''}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}