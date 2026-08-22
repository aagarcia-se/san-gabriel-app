import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { getVisibleMenu } from '@/shared/layout/menuSchema';

// Un solo grid con todo lo de primer nivel — links y grupos por igual.
// Tocar un grupo (ej. "Inventarios") lleva a su propia pantalla con sus
// sub-opciones, el mismo patrón que ahora también usa el Sidebar de
// desktop, así que aquí ya no hace falta desglosar los grupos aparte.
export function MasPage() {
  const permisos = useAuthStore((state) => state.permisos);
  const menu = useMemo(() => getVisibleMenu(permisos), [permisos]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-ink">Más opciones</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {menu.map(({ to, label, icon: Icon }) => (
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
    </div>
  );
}
