import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Info, PlayCircle } from 'lucide-react';
import { useFechaActiva } from '../api/useFechaActiva';
import { useActivarFecha } from '../api/useFechaActivaMutations';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { useAuthStore } from '@/features/auth/store/authStore';
import { cn } from '@/shared/lib/cn';
import type { ApiError } from '@/shared/api/httpClient';

const DURACION_MINUTOS = 60;

function formatHora(fecha: string) {
  return dayjs(fecha).format('HH:mm');
}

function formatFecha(fecha: string) {
  return dayjs(fecha).format('DD MMM YYYY');
}

function formatCuentaRegresiva(totalSegundos: number) {
  const segundos = Math.max(0, totalSegundos);
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

export function ActivarFechaPage() {
  const { data: activaciones, isLoading, isError, error, refetch } = useFechaActiva();
  const activar = useActivarFecha();

  const idUsuario = useAuthStore((state) => state.user?.idUsuario) ?? 1;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionError, setActionError] = useState<string | undefined>();

  const activacion = activaciones?.[0];

  // Cuenta regresiva local: arranca desde segundos_restantes que trae el
  // backend y decrementa cada segundo en el cliente para que se vea fluida,
  // sin depender de refetch constante. Se resincroniza con el valor real
  // del backend cada vez que useFechaActiva vuelve a consultar.
  const [segundosRestantes, setSegundosRestantes] = useState(0);

  useEffect(() => {
    setSegundosRestantes(activacion?.segundos_restantes ?? 0);
  }, [activacion?.segundos_restantes]);

  useEffect(() => {
    if (!activacion) return;
    const interval = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          refetch();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activacion, refetch]);

  const ventanaActiva = !!activacion && segundosRestantes > 0;

  function handleConfirmActivar() {
    setActionError(undefined);
    const ahora = dayjs();
    activar.mutate(
      {
        activado_por: idUsuario,
        activado_en: ahora.format('YYYY-MM-DD HH:mm:ss'),
        expira_en: ahora.add(DURACION_MINUTOS, 'minute').format('YYYY-MM-DD HH:mm:ss'),
        notas: `Ventana de ${DURACION_MINUTOS} minutos`,
      },
      {
        onSuccess: () => setConfirmOpen(false),
        onError: (err : unknown) => {
          setActionError((err as ApiError).message ?? 'No se pudo activar la ventana.');
        },
      },
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Activación de fecha de producción</h1>
        <p className="text-sm text-muted">Habilita el ingreso de órdenes para el día actual.</p>
      </div>

      {isLoading && <Spinner label="Consultando estado…" />}

      {isError && <ErrorState message={error?.message} onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <div className="card mx-auto max-w-lg space-y-5">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'h-3 w-3 shrink-0 rounded-full',
                ventanaActiva ? 'bg-brand-500' : 'bg-surface-2 ring-1 ring-line',
              )}
            />
            <div>
              <p className="text-sm font-medium text-ink">
                {ventanaActiva ? 'Ventana activa' : 'Sin ventana activa'}
              </p>
              <p className="text-xs text-muted">
                {ventanaActiva
                  ? 'Las órdenes pueden ingresarse para hoy.'
                  : 'Actívala para permitir el ingreso de órdenes de hoy.'}
              </p>
            </div>
          </div>

          {activacion && (
            <div className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Inicio</p>
                <p className="text-lg font-semibold text-ink">
                  {formatHora(activacion.activado_en)}
                </p>
                <p className="text-xs text-muted">{formatFecha(activacion.activado_en)}</p>
              </div>
              <span className="text-muted">→</span>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-muted">Fin</p>
                <p className="text-lg font-semibold text-ink">
                  {formatHora(activacion.expira_en)}
                </p>
                <p className="text-xs text-muted">{formatFecha(activacion.expira_en)}</p>
              </div>
            </div>
          )}

          {ventanaActiva ? (
            <>
              <div className="rounded-xl bg-brand-500/10 px-4 py-3 text-sm text-brand-600 dark:text-brand-400">
                Ingreso habilitado para el día de hoy.
              </div>

              <div className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
                <p className="text-sm text-ink">Tiempo restante</p>
                <p className="font-mono text-lg font-semibold text-brand-600 dark:text-brand-400">
                  {formatCuentaRegresiva(segundosRestantes)}
                </p>
              </div>

              <div className="flex items-start gap-2 text-xs text-muted">
                <Info className="h-4 w-4 shrink-0" />
                <p>La ventana se desactiva automáticamente al expirar el tiempo.</p>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="btn-primary w-full"
              >
                <PlayCircle className="h-4 w-4" />
                Activar ventana de producción
              </button>
              <p className="text-xs text-muted">
                Habilita el ingreso de órdenes por {DURACION_MINUTOS} minutos a partir de ahora.
              </p>
            </>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="¿Activar ventana de producción?"
        description={`Se habilitará el ingreso de órdenes para hoy durante ${DURACION_MINUTOS} minutos.`}
        confirmLabel="Activar"
        isLoading={activar.isPending}
        errorMessage={actionError}
        onConfirm={handleConfirmActivar}
        onCancel={() => {
          setConfirmOpen(false);
          setActionError(undefined);
        }}
      />
    </div>
  );
}