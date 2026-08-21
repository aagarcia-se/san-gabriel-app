import type { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface RequirePermissionProps extends PropsWithChildren {
  // rutaAcceso exacta del permiso que exige este módulo (ej. "/productos").
  // Debe coincidir con lo que devuelve el permiso en el JWT.
  ruta: string;
}

// Envuelve cada <Route> de módulo. Aunque el link no aparezca en el menú
// (porque el usuario no tiene ese permiso), esto evita que entre igual
// tipeando la URL directamente — la fuente de verdad son los permisos
// reales del JWT, no lo que se muestra en el Sidebar/BottomNav.
export function RequirePermission({ ruta, children }: RequirePermissionProps) {
  const permisos = useAuthStore((state) => state.permisos);
  const tienePermiso = permisos.some((p) => p.rutaAcceso === ruta);

  if (!tienePermiso) {
    return <Navigate to="/sin-acceso" replace />;
  }

  return <>{children}</>;
}
