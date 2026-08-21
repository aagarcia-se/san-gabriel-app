import { Link } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { getIconForRoute } from '@/shared/layout/permisoIcons';

// Solo tiene sentido en móvil (el Sidebar de desktop ya muestra todo).
// Aquí listamos TODOS los permisos, incluidos los que ya están en la
// barra inferior, para que "Más" funcione como un directorio completo.
export function MasPage() {
  const permisos = useAuthStore((state) => state.permisos);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-50">Más opciones</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {permisos.map(({ idPermiso, nombrePermiso, rutaAcceso }) => {
          const Icon = getIconForRoute(rutaAcceso);
          return (
            <Link
              key={idPermiso}
              to={rutaAcceso}
              className="card flex flex-col items-center gap-2 py-6 text-center transition-colors hover:bg-slate-800/60"
            >
              <Icon className="h-6 w-6 text-brand-400" />
              <span className="text-sm text-slate-200">{nombrePermiso}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
