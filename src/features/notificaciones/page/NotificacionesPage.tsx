import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Bell, Save } from 'lucide-react';
import { useUsuariosNotificaciones } from '@/features/categorias/api/useNotificaciones';
import { useActivarNotificacion, useGestionarNotificaciones } from '@/features/categorias/api/useNotificacionMutations';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { cn } from '@/shared/lib/cn';
import type { ActivarNotificaionRequest, GestionarNotificacionRequest } from '../types/notificaciones.types';

const TIPO_EVENTO_DEFAULT = 'orden_especial';

export function NotificacionesPage() {
    const { data: notificaciones, isLoading, isError, error, refetch } = useUsuariosNotificaciones();

    const activar = useActivarNotificacion();
    const gestionar = useGestionarNotificaciones();
    const isSaving = activar.isPending || gestionar.isPending;

    // Cambios pendientes: idUsuario -> nuevo valor de activo.
    const [cambios, setCambios] = useState<Record<number, boolean>>({});
    const [saveError, setSaveError] = useState<string | undefined>();

    const filas = useMemo(() => {
        if (!notificaciones) return [];
        return notificaciones.map((n) => {
            // null en activo/tipoEvento = nunca se ha dado de alta en
            // notificaciones para este usuario -> nunca hubo activación.
            const nuncaActivado = n.activo === null;
            return {
                idUsuario: n.idUsuario,
                nombreUsuario: n.nombreUsuario,
                apellidoUsuario: n.apellidoUsuario,
                tipoEvento: n.tipoEvento ?? TIPO_EVENTO_DEFAULT,
                activo: cambios[n.idUsuario] ?? n.activo === 1,
                nuncaActivado,
            };
        });
    }, [notificaciones, cambios]);

    const hayCambios = Object.keys(cambios).length > 0;

    function toggleFila(idUsuario: number, valorActual: boolean) {
        const original = notificaciones?.find((n) => n.idUsuario === idUsuario);
        const nuevoValor = !valorActual;
        setCambios((prev) => {
            // Si el nuevo valor coincide con el original, se quita del set de
            // cambios pendientes en vez de guardar un "cambio" que no cambia nada.
            if (original && (original.activo === 1) === nuevoValor) {
                const { [idUsuario]: _omit, ...rest } = prev;
                return rest;
            }
            return { ...prev, [idUsuario]: nuevoValor };
        });
    }

    function descartarCambios() {
        setCambios({});
        setSaveError(undefined);
    }

    async function handleGuardar() {
        setSaveError(undefined);
        const fecha = dayjs().format('YYYY-MM-DD HH:mm:ss');

        const paraActivar: ActivarNotificaionRequest[] = [];
        const paraGestionar: GestionarNotificacionRequest[] = [];

        for (const [idUsuarioStr, activo] of Object.entries(cambios)) {
            const idUsuario = Number(idUsuarioStr);
            const original = notificaciones?.find((n) => n.idUsuario === idUsuario);
            if (!original) continue;

            const tipoEvento = original.tipoEvento ?? TIPO_EVENTO_DEFAULT;
            const activoNum = activo ? 1 : 0;

            // null = nunca tuvo registro -> activar (INSERT, fechaCreacion).
            // 0/1 = ya existe -> gestionar (UPDATE, fechaActualizacion).
            if (original.activo === null) {
                paraActivar.push({ idUsuario, tipoEvento, activo: activoNum, fechaCreacion: fecha });
            } else {
                paraGestionar.push({ idUsuario, tipoEvento, activo: activoNum, fechaActualizacion: fecha });
            }
        }

        try {
            if (paraActivar.length > 0) {
                await activar.mutateAsync(paraActivar);
            }
            if (paraGestionar.length > 0) {
                await gestionar.mutateAsync(paraGestionar);
            }
            setCambios({});
        } catch (err) {
            setSaveError('No se pudieron guardar los cambios. Intenta de nuevo.');
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-semibold text-ink">Notificaciones</h1>
                <p className="text-sm text-muted">Quién recibe avisos de eventos, por usuario.</p>
            </div>

            {isLoading && <Spinner label="Cargando notificaciones…" />}

            {isError && <ErrorState message={error?.message} onRetry={() => refetch()} />}

            {!isLoading && !isError && filas.length === 0 && (
                <EmptyState
                    title="No hay usuarios"
                    description="Todavía no hay usuarios para configurar notificaciones."
                />
            )}

            {!isLoading && !isError && filas.length > 0 && (
                <div className="grid gap-3 md:grid-cols-2">
                    {filas.map((fila) => (
                        <div key={fila.idUsuario} className="card flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div
                                    className={cn(
                                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                                        fila.activo
                                            ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                                            : 'bg-surface-2 text-muted',
                                    )}
                                >
                                    <Bell className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-ink">
                                        {fila.nombreUsuario} {fila.apellidoUsuario}
                                    </p>
                                    <p className="truncate text-xs text-muted">
                                        {fila.tipoEvento}
                                        {fila.nuncaActivado && ' · nunca activado'}
                                    </p>
                                </div>
                            </div>

                            <NotificacionSwitch
                                checked={fila.activo}
                                disabled={isSaving}
                                onChange={() => toggleFila(fila.idUsuario, fila.activo)}
                            />
                        </div>
                    ))}
                </div>
            )}

            {hayCambios && (
                <div className="sticky bottom-20 z-10 sm:bottom-4">
                    <div className="card flex flex-col gap-3 border-brand-500/30 shadow-lg sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-ink">
                                {Object.keys(cambios).length} cambio(s) sin guardar
                            </p>
                            {saveError && (
                                <p className="text-xs text-danger-600 dark:text-danger-400">{saveError}</p>
                            )}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={descartarCambios}
                                disabled={isSaving}
                                className="btn-secondary"
                            >
                                Descartar
                            </button>
                            <button
                                type="button"
                                onClick={handleGuardar}
                                disabled={isSaving}
                                className="btn-primary"
                            >
                                <Save className="h-4 w-4" />
                                {isSaving ? 'Guardando…' : 'Guardar cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function NotificacionSwitch({
    checked,
    onChange,
    disabled,
}: {
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={onChange}
            className={cn(
                'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                checked ? 'bg-brand-500' : 'border border-line bg-surface-2',
            )}
        >
            <span
                className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                    checked ? 'translate-x-6' : 'translate-x-1',
                )}
            />
        </button>
    );
}