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
    // Le pasamos a LoginPage por qué llegó aquí, para mostrar el aviso
    // "debes iniciar sesión" en vez de dejarlo caer en blanco.
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, reason: 'auth-required' }}
      />
    );
  }

  return <>{children}</>;
}
