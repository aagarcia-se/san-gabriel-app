import { useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { findVisibleGroup, getVisibleMenu } from './menuSchema';

interface MenuGroupPageProps {
  // Ruta propia del grupo (ej. "/inventarios"), tal como está definida
  // en menuSchema.ts.
  to: string;
}

// Reutilizable para cualquier grupo del menú: busca el grupo ya filtrado
// por los permisos del usuario y muestra sus items como tarjetas — el
// mismo patrón que ya usa "Más" en móvil, ahora también para desktop.
export function MenuGroupPage({ to }: MenuGroupPageProps) {
  const permisos = useAuthStore((state) => state.permisos);
  const menu = useMemo(() => getVisibleMenu(permisos), [permisos]);
  const group = findVisibleGroup(menu, to);

  // El rol no tiene ningún permiso dentro de este grupo (o alguien entró
  // a la URL a mano sin tener acceso a nada de esta sección).
  if (!group) {
    return <Navigate to="/sin-acceso" replace />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-ink">{group.label}</h1>
        <p className="text-sm text-muted">Elige una opción para continuar.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {group.items.map(({ to: itemTo, label, icon: Icon }) => (
          <Link
            key={itemTo}
            to={itemTo}
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
