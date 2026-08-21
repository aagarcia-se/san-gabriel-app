import { NavLink, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useAuthStore } from '@/features/auth/store/authStore';
import { getIconForRoute } from './permisoIcons';

const MAX_PRIMARY_ITEMS = 4;

// Visible solo en móvil (< md). En tablet/desktop se usa Sidebar.
export function BottomNav() {
  const location = useLocation();
  const permisos = useAuthStore((state) => state.permisos);

  const primaryItems = permisos.slice(0, MAX_PRIMARY_ITEMS);
  const hasMore = permisos.length > MAX_PRIMARY_ITEMS;
  const isMoreActive = !primaryItems.some((p) => p.rutaAcceso === location.pathname);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-950/95
        pb-safe-bottom backdrop-blur md:hidden"
      style={{ height: 'calc(var(--bottom-nav-height) + env(safe-area-inset-bottom))' }}
    >
      <ul className="flex h-[var(--bottom-nav-height)] items-stretch justify-around">
        {primaryItems.map(({ idPermiso, nombrePermiso, rutaAcceso }) => {
          const Icon = getIconForRoute(rutaAcceso);
          return (
            <li key={idPermiso} className="flex-1">
              <NavLink
                to={rutaAcceso}
                className={({ isActive }) =>
                  cn(
                    'flex h-full flex-col items-center justify-center gap-1 text-[11px]',
                    isActive ? 'text-brand-400' : 'text-slate-400',
                  )
                }
              >
                <Icon className="h-6 w-6" />
                <span className="max-w-[4.5rem] truncate">{nombrePermiso}</span>
              </NavLink>
            </li>
          );
        })}

        {hasMore && (
          <li className="flex-1">
            <NavLink
              to="/mas"
              className={cn(
                'flex h-full flex-col items-center justify-center gap-1 text-[11px]',
                isMoreActive && location.pathname === '/mas'
                  ? 'text-brand-400'
                  : 'text-slate-400',
              )}
            >
              <Menu className="h-6 w-6" />
              <span>Más</span>
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
}
