import { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useAuthStore } from '@/features/auth/store/authStore';
import { getTopLevelLinks, getVisibleMenu } from './menuSchema';

const MAX_PRIMARY_ITEMS = 4;

// Orden de prioridad para el BottomNav:
//
// 1. Inicio       -> siempre
// 2. Dashboard    -> si existe
// 3. Producción   -> si existe
// 4. Ventas       -> si existe
// 5. Resto
function getBottomNavLinks<T extends { to: string }>(links: T[]) {
  const inicio = links.find((item) => item.to === '/inicio');

  const dashboard = links.find(
    (item) => item.to === '/dashboard',
  );

  const produccion = links.find(
    (item) => item.to === '/ordenes-produccion',
  );

  const ventas = links.find(
    (item) => item.to === '/ventas',
  );

  // Construimos las opciones prioritarias.
  // filter(Boolean) elimina las opciones que no existan
  // por permisos.
  const prioritized = [
    inicio,
    dashboard,
    produccion,
    ventas,
  ].filter(Boolean) as T[];

  // Guardamos las rutas que ya fueron colocadas
  // para no duplicarlas al agregar el resto.
  const prioritizedPaths = new Set(
    prioritized.map((item) => item.to),
  );

  // Todo lo demás conserva el orden original
  // que viene de menuSchema.
  const remaining = links.filter(
    (item) => !prioritizedPaths.has(item.to),
  );

  return [
    ...prioritized,
    ...remaining,
  ];
}

// Visible solo en móvil (< md).
// En tablet/desktop se usa Sidebar.
export function BottomNav() {
  const location = useLocation();
  const permisos = useAuthStore((state) => state.permisos);

  const menu = useMemo(
    () => getVisibleMenu(permisos),
    [permisos],
  );

  const topLevelLinks = useMemo(
    () => getTopLevelLinks(menu),
    [menu],
  );

  // Primero ordenamos según las prioridades
  const orderedLinks = useMemo(
    () => getBottomNavLinks(topLevelLinks),
    [topLevelLinks],
  );

  // Después de ordenar, tomamos solamente los primeros 4.
  const primaryItems = orderedLinks.slice(0, MAX_PRIMARY_ITEMS);

  const hasGroups = menu.some(
    (entry) => entry.type === 'group',
  );

  const hasMore =
    orderedLinks.length > MAX_PRIMARY_ITEMS || hasGroups;

  const isMoreActive =
    location.pathname === '/mas' ||
    !primaryItems.some(
      (item) => item.to === location.pathname,
    );

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95
        pb-safe-bottom backdrop-blur md:hidden"
      style={{
        height:
          'calc(var(--bottom-nav-height) + env(safe-area-inset-bottom))',
      }}
    >
      <ul className="flex h-[var(--bottom-nav-height)] items-stretch justify-around">
        {primaryItems.map(
          ({ to, label, mobileLabel, icon: Icon }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex h-full flex-col items-center justify-center gap-1 text-[11px]',
                    isActive
                      ? 'text-brand-600 dark:text-brand-400'
                      : 'text-muted',
                  )
                }
              >
                <Icon className="h-6 w-6" />

                <span className="max-w-[5rem] text-center text-[10px] leading-tight line-clamp-2">
                  {mobileLabel ?? label}
                </span>
              </NavLink>
            </li>
          ),
        )}

        {hasMore && (
          <li className="flex-1">
            <NavLink
              to="/mas"
              className={cn(
                'flex h-full flex-col items-center justify-center gap-1 text-[11px]',
                isMoreActive
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