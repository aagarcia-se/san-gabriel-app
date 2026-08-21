import { useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useAuthStore } from '@/features/auth/store/authStore';
import { ThemeToggle } from '@/shared/theme/ThemeToggle';
import { getVisibleMenu, type MenuGroup, type MenuLink } from './menuSchema';

// Visible solo desde md hacia arriba. En móvil se usa BottomNav + MasPage.
export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const permisos = useAuthStore((state) => state.permisos);
  const logout = useAuthStore((state) => state.logout);

  const menu = useMemo(() => getVisibleMenu(permisos), [permisos]);

  // Colapsado por defecto (menú más compacto); se abre solo si el grupo
  // contiene la ruta activa al cargar.
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const entry of menu) {
      if (entry.type === 'group' && entry.items.some((item) => item.to === location.pathname)) {
        initial.add(entry.label);
      }
    }
    return initial;
  });

  function toggleGroup(label: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-56 shrink-0 border-r border-line bg-surface md:flex md:flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between px-4">
        <span className="truncate text-sm font-semibold text-ink">San Gabriel App</span>
        <ThemeToggle className="h-8 w-8" />
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 pb-3">
        {menu.map((entry) =>
          entry.type === 'link' ? (
            <SidebarLink key={entry.to} entry={entry} />
          ) : (
            <SidebarGroup
              key={entry.label}
              entry={entry}
              isOpen={openGroups.has(entry.label)}
              onToggle={() => toggleGroup(entry.label)}
              currentPath={location.pathname}
            />
          ),
        )}
      </nav>

      <div className="shrink-0 border-t border-line p-2.5">
        <div className="px-2 py-1">
          <p className="truncate text-[13px] font-medium text-ink">
            {user ? `${user.nombre} ${user.apellido}` : 'Usuario'}
          </p>
          {user?.sucursal && <p className="truncate text-xs text-muted">{user.sucursal}</p>}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-1 w-full rounded-lg px-2 py-1.5 text-left text-[13px] font-medium text-muted transition-colors hover:bg-surface-2 hover:text-red-500 dark:hover:text-red-400"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

function SidebarLink({ entry }: { entry: MenuLink }) {
  const Icon = entry.icon;
  return (
    <NavLink
      to={entry.to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors',
          isActive
            ? 'bg-brand-500/10 text-brand-600 dark:bg-brand-600/15 dark:text-brand-400'
            : 'text-muted hover:bg-surface-2 hover:text-ink',
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{entry.label}</span>
    </NavLink>
  );
}

function SidebarGroup({
  entry,
  isOpen,
  onToggle,
  currentPath,
}: {
  entry: MenuGroup;
  isOpen: boolean;
  onToggle: () => void;
  currentPath: string;
}) {
  const Icon = entry.icon;
  const hasActiveChild = entry.items.some((item) => item.to === currentPath);

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors',
          hasActiveChild ? 'text-ink' : 'text-muted hover:bg-surface-2 hover:text-ink',
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate text-left">{entry.label}</span>
        <ChevronDown
          className={cn('h-3.5 w-3.5 shrink-0 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <div className="ml-4 mt-0.5 space-y-0.5 border-l border-line pl-2.5">
          {entry.items.map((item) => (
            <SidebarLink key={item.to} entry={item} />
          ))}
        </div>
      )}
    </div>
  );
}
