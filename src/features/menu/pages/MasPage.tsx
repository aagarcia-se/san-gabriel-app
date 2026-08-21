import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { getVisibleMenu, type MenuGroup, type MenuLink } from '@/shared/layout/menuSchema';

// Solo tiene sentido en móvil (el Sidebar de desktop ya muestra todo).
// Refleja la misma agrupación del Sidebar: primero los accesos sueltos,
// luego cada grupo (Inventarios, Configuraciones) como su propia sección.
export function MasPage() {
  const permisos = useAuthStore((state) => state.permisos);
  const menu = useMemo(() => getVisibleMenu(permisos), [permisos]);

  const topLevelLinks = menu.filter((entry): entry is MenuLink => entry.type === 'link');
  const groups = menu.filter((entry): entry is MenuGroup => entry.type === 'group');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Más opciones</h1>

      <MenuGrid items={topLevelLinks} />

      {groups.map((group) => (
        <div key={group.label} className="space-y-2">
          <h2 className="text-sm font-semibold text-muted">{group.label}</h2>
          <MenuGrid items={group.items} />
        </div>
      ))}
    </div>
  );
}

function MenuGrid({ items }: { items: MenuLink[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          className="card flex flex-col items-center gap-2 py-6 text-center transition-colors hover:bg-surface-2"
        >
          <Icon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          <span className="text-sm text-ink">{label}</span>
        </Link>
      ))}
    </div>
  );
}
