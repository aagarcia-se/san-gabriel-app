import { Navigate } from 'react-router-dom';

// "Inicio" es de acceso libre para cualquier usuario con sesión (no
// depende de permisos por rol), así que siempre es un aterrizaje seguro.
export function RootRedirect() {
  return <Navigate to="/inicio" replace />;
}
