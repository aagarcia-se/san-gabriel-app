import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Pencil, Plus, Search, Shield, Trash2 } from 'lucide-react';
import { useRoles, useRolPermisos } from '../api/useRoles';
import { useEliminarRol } from '../api/useRolMutations';
import { usePermisos } from '@/features/permisos/api/usePermisos';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { Badge } from '@/shared/ui/Badge';
import { cn } from '@/shared/lib/cn';
import type { Permiso } from '@/features/permisos/types/permiso.types';
import type { Rol } from '../types/rol.types';

export function RolesPage() {
  const { data: roles, isLoading, isError, error, refetch } = useRoles();
  const { data: permisosCatalogo } = usePermisos();
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [toDelete, setToDelete] = useState<Rol | null>(null);

  const eliminar = useEliminarRol();

  const filtered = useMemo(() => {
    if (!roles) return [];
    const term = search.trim().toLowerCase();
    if (!term) return roles;
    return roles.filter((r) => `${r.nombreRol} ${r.descripcionRol}`.toLowerCase().includes(term));
  }, [roles, search]);

  function handleDelete() {
    if (!toDelete) return;
    eliminar.mutate(toDelete.idRol, { onSuccess: () => setToDelete(null) });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Roles</h1>
          <p className="text-sm text-muted">Roles y permisos de San Gabriel App.</p>
        </div>
        <Link to="/users/roles/nuevo" className="btn-primary shrink-0 !px-3 sm:!px-4">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nuevo rol</span>
        </Link>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Buscar por nombre o descripción…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9"
        />
      </div>

      {isLoading && <Spinner label="Cargando roles…" />}

      {isError && <ErrorState message={error?.message} onRetry={() => refetch()} />}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          title={search ? 'Sin resultados' : 'Todavía no hay roles'}
          description={
            search ? 'Prueba con otro término de búsqueda.' : 'Los roles que se creen van a aparecer aquí.'
          }
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map((rol) => (
            <RolCard
              key={rol.idRol}
              rol={rol}
              isExpanded={expandedId === rol.idRol}
              onToggle={() => setExpandedId((prev) => (prev === rol.idRol ? null : rol.idRol))}
              permisosCatalogo={permisosCatalogo}
              onDelete={setToDelete}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="¿Eliminar rol?"
        description="Se elimina de forma permanente de la base de datos — no se puede deshacer."
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={eliminar.isPending}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

function RolCard({
  rol,
  isExpanded,
  onToggle,
  permisosCatalogo,
  onDelete,
}: {
  rol: Rol;
  isExpanded: boolean;
  onToggle: () => void;
  permisosCatalogo: Permiso[] | undefined;
  onDelete: (rol: Rol) => void;
}) {
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Shield className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{rol.nombreRol}</p>
            <p className="truncate text-xs text-muted">{rol.descripcionRol}</p>
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 text-muted transition-transform',
              isExpanded && 'rotate-180',
            )}
          />
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <Link
            to={`/users/roles/${rol.idRol}/editar`}
            aria-label="Editar"
            title="Editar"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            aria-label="Eliminar"
            title="Eliminar"
            onClick={() => onDelete(rol)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-500/10 hover:text-danger-600 dark:hover:text-danger-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 border-t border-line pt-3">
          <RolPermisosBadges idRol={rol.idRol} permisosCatalogo={permisosCatalogo} />
        </div>
      )}
    </div>
  );
}

function RolPermisosBadges({
  idRol,
  permisosCatalogo,
}: {
  idRol: number;
  permisosCatalogo: Permiso[] | undefined;
}) {
  const { data: rolPermisos, isLoading, isError } = useRolPermisos(idRol);

  if (isLoading) return <Spinner label="Cargando permisos…" />;
  if (isError) {
    return (
      <p className="text-xs text-danger-600 dark:text-danger-400">
        No se pudieron cargar los permisos de este rol.
      </p>
    );
  }

  const permisoIds = rolPermisos?.permisos ?? [];
  if (permisoIds.length === 0) {
    return <p className="text-xs text-muted">Este rol todavía no tiene permisos asignados.</p>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {permisoIds.map((idPermiso) => {
        const permiso = permisosCatalogo?.find((p) => p.idPermiso === idPermiso);
        return (
          <Badge key={idPermiso} variant="neutral">
            {permiso?.nombrePermiso ?? `Permiso #${idPermiso}`}
          </Badge>
        );
      })}
    </div>
  );
}
