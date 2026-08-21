import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getDefaultRoute } from '@/shared/lib/routing';

export function RootRedirect() {
  const permisos = useAuthStore((state) => state.permisos);
  return <Navigate to={getDefaultRoute(permisos)} replace />;
}
