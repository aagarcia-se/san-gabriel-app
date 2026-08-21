import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';

export function Topbar() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800
        bg-slate-950/90 px-4 backdrop-blur pt-safe-top md:hidden"
      style={{ height: 'var(--header-height)' }}
    >
      <span className="text-lg font-semibold text-slate-50">San Gabriel App</span>
      <button
        type="button"
        onClick={handleLogout}
        className="text-sm font-medium text-slate-400 hover:text-red-400"
      >
        Salir
      </button>
    </header>
  );
}
