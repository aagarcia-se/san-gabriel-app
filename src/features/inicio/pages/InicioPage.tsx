import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  AlertTriangle,
  ArrowRight,
  ArrowRightLeft,
  Boxes,
  ChevronRight,
  ClipboardList,
  Gift,
  PackagePlus,
  Plus,
  Settings,
  ShoppingCart,
} from 'lucide-react';

import { useAuthStore } from '@/features/auth/store/authStore';
import { useStockGeneral } from '@/features/inventarios/api/useStockGeneral';
import { useOrdenesEspeciales } from '@/features/ordenesespeciales/api/useOrdenesEspeciales';

import { Badge } from '@/shared/ui/Badge';
import { Spinner } from '@/shared/ui/Spinner';

const ACCIONES_FRECUENTES = [
  {
    titulo: 'Nueva orden',
    descripcion: 'Crear orden de producción',
    icono: ClipboardList,
    ruta: '/ordenes-produccion',
    color: 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
  },
  {
    titulo: 'Nueva venta',
    descripcion: 'Registrar una venta',
    icono: ShoppingCart,
    ruta: '/ventas',
    color: 'bg-danger-500/10 text-danger-600 dark:text-danger-400',
  },
  {
    titulo: 'Ingreso',
    descripcion: 'Ingresar existencias',
    icono: PackagePlus,
    ruta: '/inventarios',
    color: 'bg-success-500/10 text-success-600 dark:text-success-400',
  },
  {
    titulo: 'Traslado',
    descripcion: 'Mover existencias',
    icono: ArrowRightLeft,
    ruta: '/inventarios',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
] as const;

export function InicioPage() {
  const user = useAuthStore((state) => state.user);

  const idRolUsuario = user?.idRol;
  const rolUsuario = user?.rol;

  const esAdmin =
    idRolUsuario === 1 ||
    rolUsuario?.trim().toLowerCase() === 'admin';

  const hoy = dayjs().format('YYYY-MM-DD');

  return (
    <div className="space-y-6 pb-6">

      {/* ============================================================
          ENCABEZADO
      ============================================================ */}

      <section className="relative overflow-hidden rounded-2xl border border-line bg-surface px-5 py-5 shadow-sm sm:px-6">

        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-500/5 blur-2xl" />

        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

          <div className="min-w-0">

            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Inicio
            </p>

            <h1 className="truncate text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Bienvenido
              {user ? `, ${user.nombre}` : ''}
            </h1>

            <p className="mt-1 text-sm text-muted">
              {user?.rol && user?.sucursal
                ? `${user.rol} · ${user.sucursal}`
                : 'Este es tu punto de partida en San Gabriel App.'}
            </p>

          </div>

          <div className="shrink-0 rounded-xl bg-surface-2 px-3 py-2 text-left sm:text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Hoy
            </p>

            <p className="text-sm font-semibold text-ink">
              {dayjs().format('DD [de] MMMM')}
            </p>
          </div>

        </div>
      </section>

      {/* ============================================================
          RESUMEN
      ============================================================ */}

      {user?.idSucursal && (
        <ResumenDashboard
          idSucursal={user.idSucursal}
          fecha={hoy}
          idRol={idRolUsuario}
        />
      )}

      {/* ============================================================
          INFORMACIÓN DEL DÍA
      ============================================================ */}

      {user?.idSucursal && (
        <div className="grid gap-4 lg:grid-cols-2">

          <BajoStockCard
            idSucursal={user.idSucursal}
            fecha={hoy}
          />

          <OrdenesEspecialesPorEntregarCard
            idSucursal={user.idSucursal}
            idRol={idRolUsuario}
          />

        </div>
      )}

      {/* ============================================================
          ACCIONES FRECUENTES
      ============================================================ */}

      <section className="space-y-3">

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Acciones frecuentes
          </p>

          <p className="mt-1 text-sm text-muted">
            Accede rápidamente a las tareas más utilizadas.
          </p>
        </div>

        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">

          {ACCIONES_FRECUENTES.map((accion) => {
            const Icono = accion.icono;

            return (
              <Link
                key={accion.ruta + accion.titulo}
                to={accion.ruta}
                className="
                  group
                  card
                  flex
                  min-h-[118px]
                  flex-col
                  justify-between
                  gap-4
                  transition-all
                  hover:-translate-y-0.5
                  hover:bg-surface-2
                  hover:shadow-sm
                "
              >

                <div className="flex items-start justify-between gap-2">

                  <div
                    className={`
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      ${accion.color}
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
                      group-hover:translate-x-0.5
                    "
                  />

                </div>

                <div className="min-w-0">

                  <p className="truncate text-sm font-semibold text-ink">
                    {accion.titulo}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-muted">
                    {accion.descripcion}
                  </p>

                </div>

              </Link>
            );
          })}

        </div>
      </section>

      {/* ============================================================
          CONFIGURACIONES
      ============================================================ */}

      {esAdmin && (
        <Link
          to="/configuraciones"
          className="
            group
            flex
            items-center
            gap-3
            rounded-xl
            border
            border-line
            bg-surface
            px-4
            py-3
            transition-colors
            hover:bg-surface-2
          "
        >

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-ink/70">
            <Settings className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">

            <p className="text-sm font-semibold text-ink">
              Configuraciones
            </p>

            <p className="truncate text-xs text-muted">
              Usuarios, roles, sucursales, productos y más.
            </p>

          </div>

          <ChevronRight
            className="
              h-4
              w-4
              shrink-0
              text-muted
              transition-transform
              group-hover:translate-x-0.5
            "
          />

        </Link>
      )}

    </div>
  );
}

/* ==========================================================================
   RESUMEN DEL DASHBOARD
   ========================================================================== */

function ResumenDashboard({
  idSucursal,
  fecha,
  idRol,
}: {
  idSucursal: number;
  fecha: string;
  idRol?: number;
}) {
  const { data: stock, isLoading: isLoadingStock } =
    useStockGeneral(idSucursal, fecha);

  const {
    data: ordenes,
    isLoading: isLoadingOrdenes,
  } = useOrdenesEspeciales(idRol ?? 0, idSucursal);

  const agotados =
    (stock ?? []).filter(
      (item) => item.cantidadExistente === 0,
    ).length;

  const bajoStock =
    (stock ?? []).filter(
      (item) =>
        item.cantidadExistente > 0 &&
        item.cantidadExistente <= 3,
    ).length;

  const pendientes =
    (ordenes ?? []).filter(
      (orden) => orden.estado === 'A',
    ).length;

  return (
    <section className="grid grid-cols-3 gap-2 sm:gap-3">

      <ResumenCard
        icon={Boxes}
        label="Bajo stock"
        value={
          isLoadingStock
            ? '—'
            : bajoStock
        }
        color="bg-amber-500/10 text-amber-600 dark:text-amber-400"
      />

      <ResumenCard
        icon={AlertTriangle}
        label="Agotados"
        value={
          isLoadingStock
            ? '—'
            : agotados
        }
        color="bg-danger-500/10 text-danger-600 dark:text-danger-400"
      />

      <ResumenCard
        icon={Gift}
        label="Por entregar"
        value={
          isLoadingOrdenes
            ? '—'
            : pendientes
        }
        color="bg-brand-500/10 text-brand-600 dark:text-brand-400"
      />

    </section>
  );
}

function ResumenCard({
  icon: Icono,
  label,
  value,
  color,
}: {
  icon: typeof Boxes;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="card flex min-w-0 items-center gap-2.5 p-3 sm:gap-3 sm:p-4">

      <div
        className={`
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-xl
          ${color}
          sm:h-10
          sm:w-10
        `}
      >
        <Icono className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>

      <div className="min-w-0">

        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted sm:text-xs">
          {label}
        </p>

        <p className="mt-0.5 text-xl font-bold leading-none text-ink sm:text-2xl">
          {value}
        </p>

      </div>

    </div>
  );
}

/* ==========================================================================
   BAJO STOCK
   ========================================================================== */

function BajoStockCard({
  idSucursal,
  fecha,
}: {
  idSucursal: number;
  fecha: string;
}) {
  const { data: stock, isLoading } =
    useStockGeneral(idSucursal, fecha);

  const masBajos = [...(stock ?? [])]
    .sort(
      (a, b) =>
        a.cantidadExistente -
        b.cantidadExistente,
    )
    .slice(0, 5);

  return (
    <div className="card overflow-hidden">

      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">

        <div className="flex items-center gap-2.5">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger-500/10 text-danger-600 dark:text-danger-400">
            <AlertTriangle className="h-4 w-4" />
          </div>

          <div>
            <p className="text-sm font-semibold text-ink">
              Bajo stock
            </p>

            <p className="text-xs text-muted">
              Productos que requieren atención
            </p>
          </div>

        </div>

        <Link
          to="/inventarios"
          className="hidden items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 sm:inline-flex"
        >
          Ver todo
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>

      </div>

      <div className="pt-3">

        {isLoading && (
          <Spinner label="Cargando…" />
        )}

        {!isLoading &&
          masBajos.length === 0 && (
            <p className="py-2 text-xs text-muted">
              No hay existencias registradas todavía.
            </p>
          )}

        {!isLoading &&
          masBajos.length > 0 && (
            <div className="divide-y divide-line">

              {masBajos.map((item) => (
                <div
                  key={`${item.tipoStock}-${item.idProducto}`}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {item.nombreProducto}
                    </p>

                    <p className="text-[11px] text-muted">
                      Existencia actual
                    </p>
                  </div>

                  <Badge
                    variant={
                      item.cantidadExistente === 0
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {item.cantidadExistente === 0
                      ? 'Agotado'
                      : item.cantidadExistente}
                  </Badge>

                </div>
              ))}

            </div>
          )}

      </div>

      <Link
        to="/inventarios"
        className="mt-3 flex items-center justify-between border-t border-line pt-3 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 sm:hidden"
      >
        Ver inventarios
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>

    </div>
  );
}

/* ==========================================================================
   ÓRDENES ESPECIALES POR ENTREGAR
   ========================================================================== */

function OrdenesEspecialesPorEntregarCard({
  idSucursal,
  idRol,
}: {
  idSucursal: number;
  idRol?: number;
}) {
  const {
    data: ordenes,
    isLoading,
  } = useOrdenesEspeciales(
    idRol ?? 0,
    idSucursal,
  );

  const pendientes = (ordenes ?? [])
    .filter(
      (orden) => orden.estado === 'A',
    )
    .sort(
      (a, b) =>
        dayjs(a.fechaEntrega).valueOf() -
        dayjs(b.fechaEntrega).valueOf(),
    )
    .slice(0, 5);

  return (
    <div className="card overflow-hidden">

      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">

        <div className="flex items-center gap-2.5">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Gift className="h-4 w-4" />
          </div>

          <div>
            <p className="text-sm font-semibold text-ink">
              Entregas pendientes
            </p>

            <p className="text-xs text-muted">
              Próximas órdenes especiales
            </p>
          </div>

        </div>

        <Link
          to="/ordenes-especiales"
          className="hidden items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 sm:inline-flex"
        >
          Ver todo
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>

      </div>

      <div className="pt-3">

        {isLoading && (
          <Spinner label="Cargando…" />
        )}

        {!isLoading &&
          pendientes.length === 0 && (
            <p className="py-2 text-xs text-muted">
              No hay pedidos pendientes de entrega.
            </p>
          )}

        {!isLoading &&
          pendientes.length > 0 && (
            <div className="divide-y divide-line">

              {pendientes.map((orden) => (
                <div
                  key={orden.idOrdenEspecial}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >

                  <div className="min-w-0">

                    <p className="truncate text-sm font-medium text-ink">
                      {orden.nombreCliente}
                    </p>

                    <p className="text-[11px] text-muted">
                      Orden especial
                    </p>

                  </div>

                  <div className="shrink-0 rounded-lg bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    {dayjs(
                      orden.fechaEntrega,
                    ).format('DD/MM')}
                  </div>

                </div>
              ))}

            </div>
          )}

      </div>



    </div>
  );
}