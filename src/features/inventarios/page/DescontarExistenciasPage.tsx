import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  ArrowDownCircle,
  ClipboardMinus,
  Clock3,
  Package,
} from 'lucide-react';

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

const TIPOS_DESCUENTO: {
  value: TipoDescuento;
  label: string;
}[] = [
  {
    value: 'MAYOREO',
    label: 'Venta por mayor',
  },
  {
    value: 'MAL ESTADO',
    label: 'Pérdida',
  },
  {
    value: 'CORRECCION',
    label: 'Corrección de stock',
  },
];

export function DescontarExistenciasPage() {
  const {
    idSucursal: idParam,
  } = useParams<{ idSucursal: string }>();

  const idSucursal = Number(idParam);

  const fecha =
    dayjs().format('YYYY-MM-DD');

  const navigate = useNavigate();

  const idUsuario =
    useAuthStore(
      (state) => state.user?.idUsuario,
    ) ?? 0;

  const { data: sucursales } =
    useSucursales();

  const nombreSucursal =
    sucursales?.find(
      (s) =>
        s.idSucursal === idSucursal,
    )?.nombreSucursal;

  const [
    seleccionados,
    setSeleccionados,
  ] = useState<ProductoStockItem[]>([]);

  const [turno, setTurno] =
    useState<TurnoDescuento>('AM');

  const [
    tipoDescuento,
    setTipoDescuento,
  ] = useState<TipoDescuento | null>(
    null,
  );

  const [
    productosValidos,
    setProductosValidos,
  ] = useState(true);

  const [error, setError] =
    useState<string | undefined>();

  const [success, setSuccess] =
    useState(false);

  const descontarStock =
    useDescontarStock();

  function handleGuardar() {
    setError(undefined);
    setSuccess(false);

    if (seleccionados.length === 0) {
      setError(
        'Agrega al menos un producto con cantidad a descontar.',
      );
      return;
    }

    if (!tipoDescuento) {
      setError(
        'Selecciona el tipo de descuento.',
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

    const hoy =
      dayjs().format('YYYY-MM-DD');

    const payload: DescontarStockRequest =
      {
        descuentoInfo: {
          idSucursal,
          idUsuario,
          tipoDescuento,
          descuentoTurno: turno,
          fechaDescuento: ahora,
          fechaCreacion: hoy,
        },

        detalleDescuento:
          seleccionados.map((item) => ({
            idProducto:
              item.idProducto,

            controlarStock:
              item.controlarStock,

            controlarStockDiario:
              item.controlarStockDiario,

            stockADescontar:
              item.cantidad,

            fechaDescuento: ahora,
          })),
      };

    descontarStock.mutate(
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
              'No se pudo descontar el stock.',
          );
        },
      },
    );
  }

  const cantidadProductos =
    seleccionados.length;

  const tieneProductos =
    cantidadProductos > 0;

  const tipoDescuentoSeleccionado =
    TIPOS_DESCUENTO.find(
      (item) =>
        item.value === tipoDescuento,
    );

  return (
    <div className="space-y-5 pb-28">

      {/* =====================================================
          ENCABEZADO
      ====================================================== */}

      <PageHeader
        title="Restar existencias"
        description={
          nombreSucursal
            ? `Sucursal: ${nombreSucursal}`
            : undefined
        }
        backTo={`/inventarios/${idSucursal}`}
      />

      {/* =====================================================
          CONFIGURACIÓN DEL DESCUENTO
      ====================================================== */}

      <div className="card space-y-5 shadow-sm">

        {/* CABECERA */}

        <div className="flex items-center gap-3">
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
            <ClipboardMinus
              className="h-5 w-5"
            />
          </div>

          <div>
            <h2
              className="
                text-sm
                font-semibold
                text-ink
              "
            >
              Configuración del descuento
            </h2>

            <p className="text-xs text-muted">
              Define el turno y el motivo
              antes de seleccionar los productos.
            </p>
          </div>
        </div>

        {/* =================================================
            TURNO
        ================================================== */}

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock3
              className="
                h-4
                w-4
                text-muted
              "
            />

            <label
              className="
                text-sm
                font-medium
                text-ink/80
              "
            >
              Turno
            </label>
          </div>

          <div
            className="
              grid
              grid-cols-2
              gap-2
            "
          >
            {TURNOS.map((opcion) => {
              const seleccionado =
                turno === opcion;

              return (
                <button
                  key={opcion}
                  type="button"
                  disabled={
                    descontarStock.isPending
                  }
                  onClick={() =>
                    setTurno(opcion)
                  }
                  className={`
                    min-h-11
                    rounded-xl
                    border
                    px-4
                    py-2
                    text-sm
                    font-semibold
                    transition-all
                    active:scale-[0.98]

                    ${
                      seleccionado
                        ? `
                          border-brand-500
                          bg-brand-500/10
                          text-brand-600
                          shadow-sm
                          dark:text-brand-400
                        `
                        : `
                          border-line
                          bg-transparent
                          text-muted
                          hover:bg-surface-2
                          hover:text-ink
                        `
                    }
                  `}
                >
                  {opcion}
                </button>
              );
            })}
          </div>
        </div>

        {/* =================================================
            TIPO DE DESCUENTO
        ================================================== */}

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ClipboardMinus
              className="
                h-4
                w-4
                text-muted
              "
            />

            <label
              className="
                text-sm
                font-medium
                text-ink/80
              "
            >
              Tipo de descuento
            </label>
          </div>

          <div
            className="
              grid
              gap-2
              sm:grid-cols-3
            "
          >
            {TIPOS_DESCUENTO.map(
              (opcion) => {
                const seleccionado =
                  tipoDescuento ===
                  opcion.value;

                return (
                  <button
                    key={opcion.value}
                    type="button"
                    disabled={
                      descontarStock.isPending
                    }
                    onClick={() =>
                      setTipoDescuento(
                        opcion.value,
                      )
                    }
                    className={`
                      min-h-11
                      rounded-xl
                      border
                      px-3
                      py-2.5
                      text-sm
                      font-semibold
                      transition-all
                      active:scale-[0.98]

                      ${
                        seleccionado
                          ? `
                            border-brand-500
                            bg-brand-500
                            text-white
                            shadow-sm
                          `
                          : `
                            border-line
                            bg-surface-2
                            text-muted
                            hover:bg-surface
                            hover:text-ink
                          `
                      }
                    `}
                  >
                    {opcion.label}
                  </button>
                );
              },
            )}
          </div>
        </div>

        {/* =================================================
            RESUMEN DE CONFIGURACIÓN
        ================================================== */}

        {tipoDescuento && (
          <div
            className="
              flex
              flex-wrap
              items-center
              gap-2
              rounded-xl
              border
              border-brand-500/10
              bg-brand-500/5
              px-3
              py-2.5
            "
          >
            <span
              className="
                text-xs
                font-medium
                text-muted
              "
            >
              Descuento:
            </span>

            <span
              className="
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
              {tipoDescuentoSeleccionado?.label}
            </span>

            <span
              className="
                text-xs
                text-muted
              "
            >
              ·
            </span>

            <span
              className="
                rounded-full
                bg-surface-2
                px-2.5
                py-1
                text-xs
                font-semibold
                text-ink
              "
            >
              Turno {turno}
            </span>
          </div>
        )}
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
                Productos a descontar
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
          idSucursal={idSucursal}
          fecha={fecha}
          value={seleccionados}
          onChange={setSeleccionados}
          disabled={
            descontarStock.isPending
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
          Existencias descontadas correctamente.
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
                  tipoDescuento &&
                  productosValidos
                    ? 'bg-brand-500/10 text-brand-500'
                    : 'bg-muted/20 text-muted'
                }
              `}
            >
              <ArrowDownCircle
                className="h-5 w-5"
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
                    } para descontar`
                  : 'Ningún producto seleccionado'}
              </p>

              <p
                className="
                  truncate
                  text-xs
                  text-muted
                "
              >
                {tipoDescuento
                  ? `${tipoDescuentoSeleccionado?.label} · Turno ${turno}`
                  : 'Selecciona el tipo de descuento'}
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
                  `/inventarios/${idSucursal}`,
                )
              }
              disabled={
                descontarStock.isPending
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
                descontarStock.isPending ||
                cantidadProductos === 0 ||
                !tipoDescuento ||
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
              {descontarStock.isPending ? (
                <>
                  <ButtonSpinner />

                  <span>
                    Guardando…
                  </span>
                </>
              ) : (
                <>
                  <ArrowDownCircle
                    className="h-4 w-4"
                  />

                  <span>
                    Descontar
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