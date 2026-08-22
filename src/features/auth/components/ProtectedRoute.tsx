import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { isTokenExpired } from '@/shared/lib/jwt';

export function ProtectedRoute({ children }: PropsWithChildren) {
  const location = useLocation();
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Sesión válida solo si hay token, está marcada como autenticada, y el
  // JWT no expiró (evita depender de un 401 para reaccionar).
  const sessionValid = isAuthenticated && !!token && !isTokenExpired(token);

  if (!sessionValid) {
    // Solo mostramos "Debes iniciar sesión" cuando alguien intentó entrar
    // a una URL específica (deep link) sin sesión. Visitar la raíz "/" es
    // el punto de entrada normal del sitio (ej. primera vez que se abre
    // desde el navegador) y no debe sentirse como un aviso/error.
    const isDeepLink = location.pathname !== '/';

    return (
      <Navigate
        to="/login"
        replace
        state={isDeepLink ? { from: location.pathname, reason: 'auth-required' } : undefined}
      />
    );
  }

  return <>{children}</>;
}
