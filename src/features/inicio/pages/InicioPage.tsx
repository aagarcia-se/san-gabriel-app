import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  AlertTriangle,
  Bell,
  Boxes,
  ChevronRight,
  ClipboardList,
  Gift,
  Settings,
  ShoppingCart,
} from 'lucide-react';

import { useAuthStore } from '@/features/auth/store/authStore';
import { useStockGeneral } from '@/features/inventarios/api/useStockGeneral';
// TODO: no tengo visibilidad de este hook/tipo todavía — ajusta el
// import y los nombres de campo (estadoOrden, fechaEntrega,
// nombreCliente, idOrdenEspecial) según tu implementación real.


import { Badge } from '@/shared/ui/Badge';
import { Spinner } from '@/shared/ui/Spinner';
import { useOrdenesEspeciales } from '@/features/ordenesespeciales/api/useOrdenesEspeciales';

const ACCESOS_RAPIDOS = [
  {
    titulo: 'Órdenes de producción',
    descripcion: 'Crear y revisar las órdenes del día',
    icono: ClipboardList,
    ruta: '/ordenes-produccion',
    color: 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
  },
  {
    titulo: 'Órdenes especiales',
    descripcion: 'Pedidos de clientes por entregar',
    icono: Gift,
    ruta: '/ordenes-especiales',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  {
    titulo: 'Inventarios',
    descripcion: 'Existencias, ingresos y traslados',
    icono: Boxes,
    ruta: '/inventarios',
    color: 'bg-success-500/10 text-success-600 dark:text-success-400',
  },
  {
    titulo: 'Ventas',
    descripcion: 'Historial e ingreso de ventas',
    icono: ShoppingCart,
    ruta: '/ventas',
    color: 'bg-danger-500/10 text-danger-600 dark:text-danger-400',
  },
  {
    titulo: 'Notificaciones',
    descripcion: 'Avisos y novedades de la app',
    icono: Bell,
    // TODO: ajusta la ruta si "Notificaciones" vive en otro lugar del
    // menú de Configuraciones.
    ruta: '/configuraciones/notificaciones',
    color: 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
  },
] as const;

export function InicioPage() {
  const user = useAuthStore((state) => state.user);
  const idRolUsuario = user?.idRol;
  const rolUsuario = user?.rol;
  const esAdmin = idRolUsuario === 1 || rolUsuario?.trim().toLowerCase() === 'admin';
  const hoy = dayjs().format('YYYY-MM-DD');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">
          Bienvenido{user ? `, ${user.nombre}` : ''}
        </h1>
        <p className="text-sm text-muted">
          {user?.rol && user?.sucursal
            ? `${user.rol} · ${user.sucursal}`
            : 'Este es tu punto de partida en San Gabriel App.'}
        </p>
      </div>

      {/* ================================================================
          RESUMEN DEL DÍA
      ================================================================= */}

      {user?.idSucursal && (
        <div className="grid gap-3 sm:grid-cols-2">
          <BajoStockCard idSucursal={user.idSucursal} fecha={hoy} />
          <OrdenesEspecialesPorEntregarCard idSucursal={user.idSucursal} idRol={idRolUsuario} />
        </div>
      )}

      {/* ================================================================
          ACCESOS RÁPIDOS
      ================================================================= */}

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Accesos rápidos
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {ACCESOS_RAPIDOS.map((acceso) => {
            const Icono = acceso.icono;
            return (
              <Link
                key={acceso.ruta}
                to={acceso.ruta}
                className="card flex items-center gap-3 transition-colors hover:bg-surface-2"
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${acceso.color}`}>
                  <Icono className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{acceso.titulo}</p>
                  <p className="truncate text-xs text-muted">{acceso.descripcion}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
              </Link>
            );
          })}

          {esAdmin && (
            <Link
              to="/configuraciones"
              className="card flex items-center gap-3 transition-colors hover:bg-surface-2"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink/70">
                <Settings className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">Configuraciones</p>
                <p className="truncate text-xs text-muted">
                  Usuarios, roles, sucursales, productos…
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   BAJO STOCK
   ========================================================================== */

function BajoStockCard({ idSucursal, fecha }: { idSucursal: number; fecha: string }) {
  const { data: stock, isLoading } = useStockGeneral(idSucursal, fecha);

  const masBajos = [...(stock ?? [])]
    .sort((a, b) => a.cantidadExistente - b.cantidadExistente)
    .slice(0, 5);

  return (
    <div className="card space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-danger-500/10 text-danger-600 dark:text-danger-400">
          <AlertTriangle className="h-3.5 w-3.5" />
        </div>
        <p className="text-sm font-medium text-ink">Bajo stock</p>
      </div>

      {isLoading && <Spinner label="Cargando…" />}

      {!isLoading && masBajos.length === 0 && (
        <p className="text-xs text-muted">No hay existencias registradas todavía.</p>
      )}

      {!isLoading && masBajos.length > 0 && (
        <div className="divide-y divide-line">
          {masBajos.map((item) => (
            <div
              key={`${item.tipoStock}-${item.idProducto}`}
              className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
            >
              <p className="min-w-0 flex-1 truncate text-sm text-ink">{item.nombreProducto}</p>
              <Badge variant={item.cantidadExistente === 0 ? 'danger' : 'warning'}>
                {item.cantidadExistente === 0 ? 'Agotado' : item.cantidadExistente}
              </Badge>
            </div>
          ))}
        </div>
      )}

      <Link
        to="/inventarios"
        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
      >
        Ver inventarios
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

/* ==========================================================================
   ÓRDENES ESPECIALES POR ENTREGAR

   TODO: ajusta el hook y los campos (estadoOrden, fechaEntrega,
   nombreCliente, idOrdenEspecial) en cuanto compartas el listado real.
   ========================================================================== */

function OrdenesEspecialesPorEntregarCard({
  idSucursal,
  idRol,
}: {
  idSucursal: number;
  idRol?: number;
}) {
  const { data: ordenes, isLoading } = useOrdenesEspeciales(idRol ?? 0, idSucursal);

  const pendientes = (ordenes ?? [])
    .filter((o) => o.estado === 'A')
    .sort((a, b) => dayjs(a.fechaEntrega).valueOf() - dayjs(b.fechaEntrega).valueOf())
    .slice(0, 5);

  return (
    <div className="card space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Gift className="h-3.5 w-3.5" />
        </div>
        <p className="text-sm font-medium text-ink">Órdenes especiales por entregar</p>
      </div>

      {isLoading && <Spinner label="Cargando…" />}

      {!isLoading && pendientes.length === 0 && (
        <p className="text-xs text-muted">No hay pedidos pendientes de entrega.</p>
      )}

      {!isLoading && pendientes.length > 0 && (
        <div className="divide-y divide-line">
          {pendientes.map((orden) => (
            <div
              key={orden.idOrdenEspecial}
              className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
            >
              <p className="min-w-0 flex-1 truncate text-sm text-ink">{orden.nombreCliente}</p>
              <span className="shrink-0 text-xs text-muted">
                {dayjs(orden.fechaEntrega).format('DD/MM')}
              </span>
            </div>
          ))}
        </div>
      )}

      <Link
        to="/ordenes-especiales"
        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
      >
        Ver órdenes especiales
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}