import { useMemo, useState } from 'react';
import { Search, Users as UsersIcon } from 'lucide-react';
import { useUsuarios } from '../api/useUsuarios';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Badge } from '@/shared/ui/Badge';
import type { UsuarioListItem } from '../types/usuario.types';

export function UsuariosPage() {
  const { data: usuarios, isLoading, isError, error, refetch } = useUsuarios();
  const [search, setSearch] = useState('');

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

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Usuarios</h1>
        <p className="text-sm text-muted">Personal con acceso a San Gabriel App.</p>
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
              <UsuarioCard key={usuario.idUsuario} usuario={usuario} />
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function UsuarioCard({ usuario }: { usuario: UsuarioListItem }) {
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
