import { useMemo } from 'react';
import {
  BarChart3,
  Building2,
  Croissant,
  DollarSign,
  Users,
} from 'lucide-react';

import { useDashboardData } from '../api/useDashboardData';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';

function formatQ(valor: number) {
  return `Q${valor.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatNumero(valor: number) {
  return valor.toLocaleString('es-GT', { maximumFractionDigits: 0 });
}

export function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = useDashboardData();

  const ingresoMensualTotal = useMemo(
    () => (data?.ingresosMensuales ?? []).reduce((acc, s) => acc + s.ingresoMensual, 0),
    [data],
  );

  const maxResumenMensual = useMemo(
    () => Math.max(1, ...(data?.resumenMensual ?? []).map((m) => m.total_ingresos)),
    [data],
  );

  const maxProductoVendido = useMemo(
    () => Math.max(1, ...(data?.topProductosMasVendidos ?? []).map((p) => p.cantidad_total_vendida)),
    [data],
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
        <p className="text-sm text-muted">Métricas e indicadores clave del negocio.</p>
      </div>

      {isLoading && <Spinner label="Cargando métricas…" />}

      {isError && <ErrorState message={error?.message} onRetry={() => refetch()} />}

      {data && (
        <>
          {/* ================= TARJETAS RESUMEN ================= */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiCard
              icon={DollarSign}
              label="Ingreso mensual"
              value={formatQ(ingresoMensualTotal)}
              accent="text-success-600 dark:text-success-400 bg-success-500/10"
            />
            <KpiCard
              icon={Building2}
              label="Sucursales"
              value={String(data.cantidadSucursales)}
              accent="text-brand-600 dark:text-brand-400 bg-brand-500/10"
            />
            <KpiCard
              icon={Users}
              label="Empleados"
              value={String(data.cantidadEmpleados)}
              accent="text-amber-600 dark:text-amber-400 bg-amber-500/10"
            />
            <KpiCard
              icon={Croissant}
              label="Producto top"
              value={data.topProductosMasVendidos[0]?.nombreProducto ?? '—'}
              accent="text-danger-600 dark:text-danger-400 bg-danger-500/10"
              valueClassName="text-base truncate"
            />
          </div>

          {/* ================= RESUMEN MENSUAL DEL AÑO ================= */}
          <div className="card space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted" />
              <h2 className="text-sm font-medium text-ink/80">Ingresos por mes (año actual)</h2>
            </div>

            <div className="flex items-end gap-2 overflow-x-auto pb-1">
              {data.resumenMensual.map((mes) => {
                const alturaPct = Math.max(4, (mes.total_ingresos / maxResumenMensual) * 100);
                return (
                  <div key={mes.mes} className="flex w-12 shrink-0 flex-col items-center gap-1.5">
                    <div className="flex h-32 w-full items-end">
                      <div
                        className="w-full rounded-t-md bg-brand-500/80 transition-all"
                        style={{ height: `${alturaPct}%` }}
                        title={formatQ(mes.total_ingresos)}
                      />
                    </div>
                    <span className="text-[11px] font-medium uppercase text-muted">{mes.mes}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= INGRESOS POR SUCURSAL ================= */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="card space-y-3">
              <h2 className="text-sm font-medium text-ink/80">Ingreso mensual por sucursal</h2>
              <div className="space-y-2">
                {data.ingresosMensuales.map((s) => (
                  <div key={s.idSucursal} className="flex items-center justify-between text-sm">
                    <span className="text-ink">{s.nombreSucursal}</span>
                    <span className="font-semibold text-ink">{formatQ(s.ingresoMensual)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card space-y-3">
              <h2 className="text-sm font-medium text-ink/80">Ingreso anual por sucursal</h2>
              <div className="space-y-2">
                {data.ingresosAnuales.map((s) => (
                  <div key={s.idSucursal} className="flex items-center justify-between text-sm">
                    <span className="text-ink">{s.nombreSucursal}</span>
                    <span className="font-semibold text-ink">{formatQ(s.ingresoAnual)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ================= TOP PRODUCTOS ================= */}
          <div className="card space-y-3">
            <h2 className="text-sm font-medium text-ink/80">Productos más vendidos</h2>
            <div className="space-y-3">
              {data.topProductosMasVendidos.map((producto, index) => (
                <div key={producto.idProducto} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-ink">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-2 text-[11px] font-semibold text-muted">
                        {index + 1}
                      </span>
                      {producto.nombreProducto}
                    </span>
                    <span className="text-muted">
                      {formatNumero(producto.cantidad_total_vendida)} unidades
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{
                        width: `${(producto.cantidad_total_vendida / maxProductoVendido) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  accent,
  valueClassName,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  accent: string;
  valueClassName?: string;
}) {
  return (
    <div className="card space-y-2">
      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${accent}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className={`font-semibold text-ink ${valueClassName ?? 'text-lg'}`}>{value}</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </div>
  );
}