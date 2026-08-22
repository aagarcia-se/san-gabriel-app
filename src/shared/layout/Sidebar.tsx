import { useMemo } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Download } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useAuthStore } from '@/features/auth/store/authStore';
import { ThemeToggle } from '@/shared/theme/ThemeToggle';
import { usePwaInstallStore } from '@/shared/pwa/usePwaInstall';
import { getVisibleMenu, type MenuEntry, type MenuGroup, type MenuLink } from './menuSchema';

// Visible solo desde md hacia arriba. En móvil se usa BottomNav + MasPage.
export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const permisos = useAuthStore((state) => state.permisos);
  const logout = useAuthStore((state) => state.logout);

  const isInstallable = usePwaInstallStore((state) => state.isInstallable);
  const promptInstall = usePwaInstallStore((state) => state.promptInstall);

  const menu = useMemo(() => getVisibleMenu(permisos), [permisos]);

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
        {menu.map((entry) => (
          <SidebarItem key={entry.to} entry={entry} currentPath={location.pathname} />
        ))}
      </nav>

      <div className="shrink-0 border-t border-line p-2.5">
        {isInstallable && (
          <button
            type="button"
            onClick={promptInstall}
            className="mb-1 flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13px] font-medium text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <Download className="h-4 w-4 shrink-0" />
            Instalar app
          </button>
        )}

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

function SidebarItem({ entry, currentPath }: { entry: MenuEntry; currentPath: string }) {
  if (entry.type === 'link') {
    return <SidebarLink entry={entry} />;
  }
  return <SidebarGroupLink entry={entry} currentPath={currentPath} />;
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

// Un grupo es un click directo a su propia pantalla (ej. "/inventarios"),
// no un desplegable. Se marca activo tanto en su propia pantalla como en
// cualquiera de sus sub-opciones, para que el usuario ubique en qué
// sección está aunque haya entrado a un item puntual.
function SidebarGroupLink({ entry, currentPath }: { entry: MenuGroup; currentPath: string }) {
  const Icon = entry.icon;
  const isActive =
    currentPath === entry.to || entry.items.some((item) => item.to === currentPath);

  return (
    <Link
      to={entry.to}
      className={cn(
        'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors',
        isActive
          ? 'bg-brand-500/10 text-brand-600 dark:bg-brand-600/15 dark:text-brand-400'
          : 'text-muted hover:bg-surface-2 hover:text-ink',
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate">{entry.label}</span>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
    </Link>
  );
}
