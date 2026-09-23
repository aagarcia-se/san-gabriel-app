import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  User,
} from 'lucide-react';

import { useIngresarVenta } from '../api/useVentaMutations';
import { useAuthStore } from '@/features/auth/store/authStore';

import { PageHeader } from '@/shared/ui/PageHeader';
import { Alert } from '@/shared/ui/Alert';
import { ButtonSpinner } from '@/shared/ui/ButtonSpinner';
import type { ApiError } from '@/shared/api/httpClient';
import type { DetalleGastoRequest, TurnoVenta } from '../types/ventas.types';
import { VentaProductoPicker, VentaProductoStockItem } from '@/shared/ui/components/VentaProductoPicker';

const PASOS = ['Turno', 'Productos', 'Efectivo', 'Gastos', 'Resumen'] as const;

export function IngresoVentaWizard() {
  const { idSucursal: idParam } = useParams<{ idSucursal: string }>();
  const idSucursal = Number(idParam);
  const navigate = useNavigate();

  const idUsuario = useAuthStore((state) => state.user?.idUsuario) ?? 0;
  const nombreUsuario = useAuthStore((state) =>
    `${state.user?.nombre ?? ''} ${state.user?.apellido ?? ''}`.trim(),
  );

  const fechaHoy = dayjs().format('YYYY-MM-DD');

  const [paso, setPaso] = useState(0);

  const [turno, setTurno] = useState<TurnoVenta>('AM');
  const [productos, setProductos] = useState<VentaProductoStockItem[]>([]);
  const [existenciaValida, setExistenciaValida] = useState(true);

  const [montoIngresado, setMontoIngresado] = useState('');
  const [gastos, setGastos] = useState<DetalleGastoRequest[]>([]);

  const [error, setError] = useState<string | undefined>();
  const [pasoError, setPasoError] = useState<string | undefined>();

  const ingresarVenta = useIngresarVenta();

  const productosConSobrante = useMemo(() => productos.filter((p) => p.cantidad > 0), [productos]);

  const totalGastos = gastos.reduce((acc, g) => acc + g.subTotal, 0);
  const montoNum = Number(montoIngresado) || 0;
  const efectivoNeto = montoNum - totalGastos;

  function irSiguiente() {
    if (paso === 1 && !existenciaValida) {
      setPasoError('Corrige las cantidades que superan la existencia disponible.');
      return;
    }
    if (paso === 2 && montoIngresado.trim() === '') {
      setPasoError('Ingresa el monto en efectivo con el que cierras el turno.');
      return;
    }
    setPasoError(undefined);
    setPaso((p) => Math.min(p + 1, PASOS.length - 1));
  }

  function irAtras() {
    setPasoError(undefined);
    setPaso((p) => Math.max(p - 1, 0));
  }

  function agregarGasto() {
    setGastos((prev) => [...prev, { detalleGasto: '', subTotal: 0 }]);
  }

  function actualizarGasto(index: number, changes: Partial<DetalleGastoRequest>) {
    setGastos((prev) => prev.map((g, i) => (i === index ? { ...g, ...changes } : g)));
  }

  function quitarGasto(index: number) {
    setGastos((prev) => prev.filter((_, i) => i !== index));
  }

  function handleConfirmar() {
    setError(undefined);
    const ahora = dayjs();
    const hoy = ahora.format('YYYY-MM-DD');

    // El picker ya entrega la lista COMPLETA (todos los productos con
    // existencia, incluso los que quedaron en 0) — no hace falta ningún
    // cruce adicional contra el stock aquí.
    const detalleVenta = productos.map((p) => ({
      idProducto: p.idProducto,
      tipoProduccion: p.tipoProduccion,
      controlarStock: p.controlarStock,
      controlarStockDiario: p.controlarStockDiario,
      idCategoria: p.idCategoria,
      fechaCreacion: hoy,
      unidadesNoVendidas: p.cantidad,
    }));

    const gastosValidos = gastos.filter((g) => g.detalleGasto.trim() !== '' && g.subTotal > 0);

    ingresarVenta.mutate(
      {
        encabezadoVenta: {
          idOrdenProduccion: null,
          idUsuario,
          idSucursal,
          ventaTurno: turno,
          fechaVenta: hoy,
          fechaCreacion: hoy,
          fechaYHoraVenta: ahora.format('YYYY-MM-DD HH:mm:ss'),
        },
        detalleVenta,
        detalleIngreso: {
          montoTotalIngresado: montoNum,
          fechaIngreso: hoy,
        },
        gastosDiarios:
          gastosValidos.length === 0
            ? null
            : {
                encabezadoGastosDiarios: {
                  idUsuario,
                  montoTotalGasto: gastosValidos.reduce((acc, g) => acc + g.subTotal, 0),
                  fechaIngreso: hoy,
                },
                detalleGastosDiarios: gastosValidos,
              },
      },
      {
        onSuccess: () => navigate(`/ventas/${idSucursal}`, { replace: true }),
        onError: (err : unknown) => {
          setError((err as ApiError).message ?? 'No se pudo registrar la venta.');
        },
      },
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <PageHeader
        title="Registrar venta"
        description="Ingreso manual"
        backTo={`/ventas/${idSucursal}`}
      />

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {PASOS.map((label, index) => (
          <div key={label} className="flex shrink-0 items-center gap-2">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                index < paso
                  ? 'bg-brand-500 text-white'
                  : index === paso
                    ? 'bg-brand-500/10 text-brand-600 ring-2 ring-brand-500 dark:text-brand-400'
                    : 'bg-surface-2 text-muted'
              }`}
            >
              {index < paso ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            <span className={`text-sm font-medium ${index <= paso ? 'text-ink' : 'text-muted'}`}>
              {label}
            </span>
            {index < PASOS.length - 1 && <div className="h-px w-6 bg-line" />}
          </div>
        ))}
      </div>

      {paso === 0 && (
        <div className="space-y-4">
          <div className="card space-y-3">
            <label className="text-sm font-medium text-ink/80">Turno</label>
            <div className="flex gap-2">
              {(['AM', 'PM'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTurno(t)}
                  disabled={ingresarVenta.isPending}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    turno === t
                      ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400'
                      : 'border-line text-muted hover:bg-surface-2 hover:text-ink'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="card grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink/70">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted">Fecha</p>
                <p className="truncate text-sm font-medium text-ink">
                  {dayjs(fechaHoy).format('DD/MM/YYYY')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink/70">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted">Ingresado por</p>
                <p className="truncate text-sm font-medium text-ink">{nombreUsuario || '—'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {paso === 1 && (
        <VentaProductoPicker
          idSucursal={idSucursal}
          fecha={fechaHoy}
          value={productos}
          onChange={setProductos}
          disabled={ingresarVenta.isPending}
          onValidezCambio={setExistenciaValida}
        />
      )}

      {paso === 2 && (
        <div className="card space-y-3">
          <label htmlFor="monto" className="text-sm font-medium text-ink/80">
            Efectivo en caja al cierre
          </label>
          <input
            id="monto"
            type="number"
            min={0}
            step="0.01"
            value={montoIngresado}
            onChange={(e) => setMontoIngresado(e.target.value)}
            disabled={ingresarVenta.isPending}
            placeholder="Q0.00"
            className="input"
          />
          <p className="text-xs text-muted">
            El dinero físico con el que se cierra el turno, antes de descontar gastos.
          </p>
        </div>
      )}

      {paso === 3 && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-ink/80">Gastos del turno (opcional)</label>
            <button
              type="button"
              onClick={agregarGasto}
              disabled={ingresarVenta.isPending}
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 transition-colors hover:text-brand-500 dark:text-brand-400"
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar
            </button>
          </div>

          {gastos.length === 0 && (
            <p className="text-sm text-muted">
              No hay gastos registrados en este turno — jabón, taxi, u otros gastos menores.
            </p>
          )}

          {gastos.map((gasto, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Descripción del gasto"
                value={gasto.detalleGasto}
                onChange={(e) => actualizarGasto(index, { detalleGasto: e.target.value })}
                disabled={ingresarVenta.isPending}
                className="input flex-1"
              />
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="Q0.00"
                value={gasto.subTotal || ''}
                onChange={(e) => actualizarGasto(index, { subTotal: Number(e.target.value) || 0 })}
                disabled={ingresarVenta.isPending}
                className="input w-28"
              />
              <button
                type="button"
                aria-label="Quitar gasto"
                disabled={ingresarVenta.isPending}
                onClick={() => quitarGasto(index)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-500/10 hover:text-danger-600 dark:hover:text-danger-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {paso === 4 && (
        <div className="space-y-3">
          <div className="card space-y-3">
            <h2 className="text-sm font-medium text-ink/80">Productos con sobrante</h2>
            {productosConSobrante.length === 0 ? (
              <p className="rounded-lg bg-success-500/10 px-3 py-2 text-sm text-success-600 dark:text-success-400">
                Todos los productos se vendieron por completo.
              </p>
            ) : (
              <div className="divide-y divide-line">
                {productosConSobrante.map((p) => (
                  <div key={p.idProducto} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-ink">{p.nombreProducto}</span>
                    <span className="text-muted">{p.cantidad} sin vender</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Turno</span>
              <span className="text-ink">{turno}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Efectivo ingresado</span>
              <span className="text-ink">Q{montoNum.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Gastos del turno</span>
              <span className="text-ink">Q{totalGastos.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-line pt-2 text-sm font-semibold">
              <span className="text-ink">Efectivo neto</span>
              <span className="text-brand-600 dark:text-brand-400">Q{efectivoNeto.toFixed(2)}</span>
            </div>
          </div>

          {error && (
            <Alert variant="danger" onDismiss={() => setError(undefined)}>
              {error}
            </Alert>
          )}
        </div>
      )}

      {pasoError && (
        <Alert variant="danger" onDismiss={() => setPasoError(undefined)}>
          {pasoError}
        </Alert>
      )}

      <div className="sticky bottom-20 z-10 sm:bottom-4">
        <div className="card flex items-center justify-between shadow-lg">
          <button
            type="button"
            onClick={irAtras}
            disabled={paso === 0 || ingresarVenta.isPending}
            className="btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Atrás
          </button>

          {paso < PASOS.length - 1 ? (
            <button type="button" onClick={irSiguiente} className="btn-primary">
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirmar}
              disabled={ingresarVenta.isPending}
              className="btn-primary"
            >
              {ingresarVenta.isPending && <ButtonSpinner />}
              {ingresarVenta.isPending ? 'Guardando…' : 'Confirmar venta'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}