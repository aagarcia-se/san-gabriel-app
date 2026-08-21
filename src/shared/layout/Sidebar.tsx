import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import { useAuthStore } from '@/features/auth/store/authStore';
import { getIconForRoute } from './permisoIcons';

// Visible solo desde md hacia arriba. En móvil se usa BottomNav.
export function Sidebar() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const permisos = useAuthStore((state) => state.permisos);
  const logout = useAuthStore((state) => state.logout);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-800 bg-slate-950 md:flex md:flex-col">
      <div className="flex h-[var(--header-height)] shrink-0 items-center px-6">
        <span className="text-lg font-semibold text-slate-50">San Gabriel App</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-3">
        {permisos.map(({ idPermiso, nombrePermiso, rutaAcceso }) => {
          const Icon = getIconForRoute(rutaAcceso);
          return (
            <NavLink
              key={idPermiso}
              to={rutaAcceso}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-600/15 text-brand-400'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200',
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{nombrePermiso}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-slate-800 p-3">
        <div className="px-3 py-1">
          <p className="truncate text-sm font-medium text-slate-200">
            {user ? `${user.nombre} ${user.apellido}` : 'Usuario'}
          </p>
          {user?.sucursal && (
            <p className="truncate text-xs text-slate-500">{user.sucursal}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-400 transition-colors hover:bg-slate-900 hover:text-red-400"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
