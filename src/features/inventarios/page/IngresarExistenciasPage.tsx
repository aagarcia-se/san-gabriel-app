import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Package,
  PackagePlus,
} from 'lucide-react';

import {
  ProductoStockCantidadItem,
  ProductoStockPicker,
} from '@/shared/ui/components/ProductoStockPicker';

import { useSucursales } from '@/features/sucursales/api/useSucursales';
import { useIngresarStock } from '../api/useInventarioMutations';
import { useAuthStore } from '@/features/auth/store/authStore';

import { PageHeader } from '@/shared/ui/PageHeader';
import { Alert } from '@/shared/ui/Alert';
import { ButtonSpinner } from '@/shared/ui/ButtonSpinner';

import type { ApiError } from '@/shared/api/httpClient';

export function IngresarExistenciasPage() {
  const {
    idSucursal: idParam,
  } = useParams<{ idSucursal: string }>();

  const idSucursal = Number(idParam);

  const navigate = useNavigate();

  const idUsuario =
    useAuthStore(
      (state) => state.user?.idUsuario,
    ) ?? 0;

  const { data: sucursales } =
    useSucursales();

  const nombreSucursal =
    sucursales?.find(
      (s) => s.idSucursal === idSucursal,
    )?.nombreSucursal;

  const [
    seleccionados,
    setSeleccionados,
  ] = useState<ProductoStockCantidadItem[]>(
    [],
  );

  const [error, setError] =
    useState<string | undefined>();

  const [success, setSuccess] =
    useState(false);

  const ingresarStock =
    useIngresarStock();

  function handleGuardar() {
    setError(undefined);
    setSuccess(false);

    if (seleccionados.length === 0) {
      setError(
        'Agrega al menos un producto con cantidad.',
      );
      return;
    }

    const ahora =
      dayjs().format(
        'YYYY-MM-DD HH:mm:ss',
      );

    const hoy =
      dayjs().format('YYYY-MM-DD');

    const stockProductos =
      seleccionados.map((item) => ({
        idUsuario,

        idProducto:
          item.idProducto,

        idSucursal,

        stock:
          item.cantidad,

        tipoProduccion:
          item.tipoProduccion,

        controlarStock:
          item.controlarStock,

        controlarStockDiario:
          item.controlarStockDiario,

        fechaCreacion:
          hoy,

        fechaActualizacion:
          ahora,
      }));

    ingresarStock.mutate(
      { stockProductos },
      {
        onSuccess: () => {
          setSuccess(true);
          setError(undefined);
          setSeleccionados([]);
        },

        onError: (err: unknown) => {
          setError(
            (err as ApiError).message ??
              'No se pudo ingresar el stock.',
          );
        },
      },
    );
  }

  const cantidadProductos =
    seleccionados.length;

  const tieneProductos =
    cantidadProductos > 0;

  return (
    <div className="space-y-5 pb-28">
      <PageHeader
        title="Agregar existencias"
        description={
          nombreSucursal
            ? `Sucursal: ${nombreSucursal}`
            : undefined
        }
        backTo={`/inventarios/${idSucursal}`}
      />

      {/* =====================================================
          INFORMACIÓN DEL INGRESO
          ===================================================== */}

      <div className="card space-y-5 shadow-sm">
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
            <PackagePlus className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-ink">
              Ingreso de existencias
            </h2>

            <p className="text-xs text-muted">
              Selecciona los productos y define la cantidad que deseas agregar al inventario.
            </p>
          </div>
        </div>

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
          <span className="text-xs font-medium text-muted">
            Sucursal:
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
            {nombreSucursal ?? 'Sucursal actual'}
          </span>

          <span className="text-xs text-muted">
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
            {tieneProductos
              ? `${cantidadProductos} ${
                  cantidadProductos === 1
                    ? 'producto'
                    : 'productos'
                } seleccionado${
                  cantidadProductos === 1
                    ? ''
                    : 's'
                }`
              : 'Sin productos seleccionados'}
          </span>
        </div>
      </div>

      {/* =====================================================
          PRODUCTOS
          ===================================================== */}

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Package className="h-5 w-5 shrink-0 text-brand-500" />

            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-ink">
                Productos a ingresar
              </h2>

              <p className="text-xs text-muted">
                Agrega productos y especifica las cantidades.
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

        <ProductoStockPicker
          value={seleccionados}
          onChange={setSeleccionados}
          disabled={
            ingresarStock.isPending
          }
          cantidadInicial={0}
        />
      </div>

      {/* =====================================================
          ALERTA DE ERROR
          ===================================================== */}

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
          ===================================================== */}

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
          Existencias ingresadas correctamente.
        </Alert>
      )}

      {/* =====================================================
          BARRA DE ACCIONES
          ===================================================== */}

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
                  tieneProductos
                    ? 'bg-brand-500/10 text-brand-500'
                    : 'bg-muted/20 text-muted'
                }
              `}
            >
              <PackagePlus className="h-5 w-5" />
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
                    } para ingresar`
                  : 'Ningún producto seleccionado'}
              </p>

              <p
                className="
                  truncate
                  text-xs
                  text-muted
                "
              >
                {tieneProductos
                  ? 'Revisa las cantidades antes de guardar.'
                  : 'Selecciona productos para comenzar.'}
              </p>
            </div>
          </div>

          {/* ACCIONES */}

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
                ingresarStock.isPending
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
                ingresarStock.isPending ||
                !tieneProductos
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
              {ingresarStock.isPending ? (
                <>
                  <ButtonSpinner />

                  <span>
                    Guardando…
                  </span>
                </>
              ) : (
                <>
                  <PackagePlus className="h-4 w-4" />

                  <span>
                    Ingresar
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