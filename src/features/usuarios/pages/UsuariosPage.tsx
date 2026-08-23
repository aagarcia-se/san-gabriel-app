import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Lock, Pencil, Plus, Search, Trash2, Unlock, Users as UsersIcon } from 'lucide-react';
import { useUsuarios } from '../api/useUsuarios';
import {
  useBloquearUsuario,
  useDesbloquearUsuario,
  useEliminarUsuario,
  useResetearContrasenia,
} from '../api/useUsuarioMutations';
import { useAuthStore } from '@/features/auth/store/authStore';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Badge } from '@/shared/ui/Badge';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { ResetPasswordDialog } from './ResetPasswordDialog';
import { cn } from '@/shared/lib/cn';
import type { UsuarioListItem } from '../types/usuario.types';

type ConfirmAction = {
  type: 'bloquear' | 'desbloquear' | 'eliminar' | 'resetear';
  usuario: UsuarioListItem;
};

export function UsuariosPage() {
  const { data: usuarios, isLoading, isError, error, refetch } = useUsuarios();
  const [search, setSearch] = useState('');
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  // El reseteo de contraseña es un permiso propio (/reset-pass), separado
  // de "Gestión de usuarios" — un rol puede administrar usuarios sin
  // poder resetear contraseñas, o viceversa.
  const permisos = useAuthStore((state) => state.permisos);
  const canResetPassword = permisos.some((p) => p.rutaAcceso === '/reset-pass');

  const bloquear = useBloquearUsuario();
  const desbloquear = useDesbloquearUsuario();
  const eliminar = useEliminarUsuario();
  const resetear = useResetearContrasenia();

  const isMutating = bloquear.isPending || desbloquear.isPending || eliminar.isPending;

  const filtered = useMemo(() => {
    if (!usuarios) return [];
    const term = search.trim().toLowerCase();
    if (!term) return usuarios;
    return usuarios.filter((u) =>
      [u.nombreUsuario, u.usuario, u.correoUsuario, u.nombreRol, u.nombreSucursal]
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  }, [usuarios, search]);

  function handleConfirm() {
    if (!confirmAction) return;
    const { type, usuario } = confirmAction;

    if (type === 'bloquear') {
      bloquear.mutate(usuario.idUsuario, { onSuccess: () => setConfirmAction(null) });
    } else if (type === 'desbloquear') {
      desbloquear.mutate(usuario.idUsuario, { onSuccess: () => setConfirmAction(null) });
    } else if (type === 'eliminar') {
      eliminar.mutate(usuario.idUsuario, { onSuccess: () => setConfirmAction(null) });
    } else if (type === 'resetear') {
      resetear.mutate(usuario.idUsuario, {
        onSuccess: (data) => {
          setConfirmAction(null);
          setGeneratedPassword(data.passGenerada);
        },
      });
    }
  }

  const confirmCopy: Record<ConfirmAction['type'], { title: string; description: string; confirmLabel: string; variant: 'default' | 'danger' }> = {
    bloquear: {
      title: '¿Bloquear usuario?',
      description: 'No va a poder iniciar sesión hasta que lo desbloquees.',
      confirmLabel: 'Bloquear',
      variant: 'danger',
    },
    desbloquear: {
      title: '¿Desbloquear usuario?',
      description: 'Va a poder iniciar sesión normalmente otra vez.',
      confirmLabel: 'Desbloquear',
      variant: 'default',
    },
    eliminar: {
      title: '¿Eliminar usuario?',
      description: 'Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      variant: 'danger',
    },
    resetear: {
      title: '¿Restablecer contraseña?',
      description: 'Se generará una nueva contraseña y la actual dejará de funcionar.',
      confirmLabel: 'Restablecer',
      variant: 'danger',
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Usuarios</h1>
          <p className="text-sm text-muted">Personal con acceso a San Gabriel App.</p>
        </div>
        <Link to="/users/nuevo" className="btn-primary shrink-0 !px-3 sm:!px-4">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nuevo usuario</span>
        </Link>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Buscar por nombre, usuario, correo, rol o sucursal…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9"
        />
      </div>

      {isLoading && <Spinner label="Cargando usuarios…" />}

      {isError && <ErrorState message={error?.message} onRetry={() => refetch()} />}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          title={search ? 'Sin resultados' : 'Todavía no hay usuarios'}
          description={
            search
              ? 'Prueba con otro término de búsqueda.'
              : 'Los usuarios que se creen van a aparecer aquí.'
          }
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <>
          {/* Móvil: lista de tarjetas */}
          <div className="space-y-2 md:hidden">
            {filtered.map((usuario) => (
              <UsuarioCard
                key={usuario.idUsuario}
                usuario={usuario}
                canResetPassword={canResetPassword}
                disabled={isMutating}
                onAction={(type) => setConfirmAction({ type, usuario })}
              />
            ))}
          </div>

          {/* Desktop: tabla */}
          <div className="hidden overflow-hidden rounded-2xl border border-line md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Usuario</th>
                  <th className="px-4 py-3 font-medium">Correo</th>
                  <th className="px-4 py-3 font-medium">Rol</th>
                  <th className="px-4 py-3 font-medium">Sucursal</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-surface">
                {filtered.map((usuario) => (
                  <tr key={usuario.idUsuario} className="transition-colors hover:bg-surface-2">
                    <td className="px-4 py-3 font-medium text-ink">{usuario.nombreUsuario}</td>
                    <td className="px-4 py-3 text-muted">@{usuario.usuario}</td>
                    <td className="px-4 py-3 text-muted">{usuario.correoUsuario}</td>
                    <td className="px-4 py-3 text-muted">{usuario.nombreRol}</td>
                    <td className="px-4 py-3 text-muted">{usuario.nombreSucursal}</td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={usuario.estadoUsuario} />
                    </td>
                    <td className="px-4 py-3">
                      <RowActions
                        usuario={usuario}
                        canResetPassword={canResetPassword}
                        disabled={isMutating}
                        onAction={(type) => setConfirmAction({ type, usuario })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmAction !== null}
        title={confirmAction ? confirmCopy[confirmAction.type].title : ''}
        description={confirmAction ? confirmCopy[confirmAction.type].description : undefined}
        confirmLabel={confirmAction ? confirmCopy[confirmAction.type].confirmLabel : undefined}
        variant={confirmAction ? confirmCopy[confirmAction.type].variant : 'default'}
        isLoading={isMutating || resetear.isPending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />

      <ResetPasswordDialog
        open={generatedPassword !== null}
        password={generatedPassword}
        onClose={() => setGeneratedPassword(null)}
      />
    </div>
  );
}

interface ActionsProps {
  usuario: UsuarioListItem;
  canResetPassword: boolean;
  disabled: boolean;
  onAction: (type: ConfirmAction['type']) => void;
}

function RowActions({ usuario, canResetPassword, disabled, onAction }: ActionsProps) {
  const isBlocked = usuario.estadoUsuario === 'B';

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        to={`/users/${usuario.idUsuario}/editar`}
        aria-label="Editar"
        title="Editar"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <IconActionButton
        label={isBlocked ? 'Desbloquear' : 'Bloquear'}
        icon={isBlocked ? Unlock : Lock}
        disabled={disabled}
        onClick={() => onAction(isBlocked ? 'desbloquear' : 'bloquear')}
      />
      {canResetPassword && (
        <IconActionButton
          label="Restablecer contraseña"
          icon={KeyRound}
          disabled={disabled}
          onClick={() => onAction('resetear')}
        />
      )}
      <IconActionButton
        label="Eliminar"
        icon={Trash2}
        variant="danger"
        disabled={disabled}
        onClick={() => onAction('eliminar')}
      />
    </div>
  );
}

function IconActionButton({
  label,
  icon: Icon,
  onClick,
  disabled,
  variant = 'default',
}: {
  label: string;
  icon: typeof Lock;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger';
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40',
        variant === 'danger' && 'hover:bg-danger-500/10 hover:text-danger-600 dark:hover:text-danger-400',
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function UsuarioCard({
  usuario,
  canResetPassword,
  disabled,
  onAction,
}: ActionsProps) {
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <UsersIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{usuario.nombreUsuario}</p>
            <p className="truncate text-xs text-muted">@{usuario.usuario}</p>
          </div>
        </div>
        <EstadoBadge estado={usuario.estadoUsuario} />
      </div>

      <div className="mt-3 space-y-1 border-t border-line pt-3 text-xs text-muted">
        <p className="truncate">{usuario.correoUsuario}</p>
        <p>
          {usuario.nombreRol} · {usuario.nombreSucursal}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1 border-t border-line pt-3">
        <RowActions
          usuario={usuario}
          canResetPassword={canResetPassword}
          disabled={disabled}
          onAction={onAction}
        />
      </div>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: UsuarioListItem['estadoUsuario'] }) {
  return estado === 'A' ? (
    <Badge variant="success">Activo</Badge>
  ) : (
    <Badge variant="danger">Bloqueado</Badge>
  );
}
