import { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useAuthStore } from '@/features/auth/store/authStore';
import { getTopLevelLinks, getVisibleMenu } from './menuSchema';

const MAX_PRIMARY_ITEMS = 4;

// Visible solo en móvil (< md). En tablet/desktop se usa Sidebar.
export function BottomNav() {
  const location = useLocation();
  const permisos = useAuthStore((state) => state.permisos);

  const menu = useMemo(() => getVisibleMenu(permisos), [permisos]);
  const topLevelLinks = useMemo(() => getTopLevelLinks(menu), [menu]);

  const primaryItems = topLevelLinks.slice(0, MAX_PRIMARY_ITEMS);
  const hasGroups = menu.some((entry) => entry.type === 'group');
  const hasMore = topLevelLinks.length > MAX_PRIMARY_ITEMS || hasGroups;
  const isMoreActive = !primaryItems.some((item) => item.to === location.pathname);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95
        pb-safe-bottom backdrop-blur md:hidden"
      style={{ height: 'calc(var(--bottom-nav-height) + env(safe-area-inset-bottom))' }}
    >
      <ul className="flex h-[var(--bottom-nav-height)] items-stretch justify-around">
        {primaryItems.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex h-full flex-col items-center justify-center gap-1 text-[11px]',
                  isActive ? 'text-brand-600 dark:text-brand-400' : 'text-muted',
                )
              }
            >
              <Icon className="h-6 w-6" />
              <span className="max-w-[4.5rem] truncate">{label}</span>
            </NavLink>
          </li>
        ))}

        {hasMore && (
          <li className="flex-1">
            <NavLink
              to="/mas"
              className={cn(
                'flex h-full flex-col items-center justify-center gap-1 text-[11px]',
                isMoreActive && location.pathname === '/mas'
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-muted',
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
