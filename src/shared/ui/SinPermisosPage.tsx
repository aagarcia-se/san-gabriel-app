import { Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';

export function SinPermisosPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <Inbox className="h-10 w-10 text-slate-500" />
      <p className="text-sm font-medium text-slate-300">
        Tu usuario no tiene módulos asignados todavía.
      </p>
      <p className="max-w-xs text-sm text-slate-500">
        Contacta a un administrador para que asigne los permisos
        correspondientes a tu rol.
      </p>
      <button type="button" onClick={handleLogout} className="btn-secondary mt-2">
        Cerrar sesión
      </button>
    </div>
  );
}
