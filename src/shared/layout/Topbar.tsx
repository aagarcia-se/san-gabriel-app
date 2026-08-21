import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { ThemeToggle } from '@/shared/theme/ThemeToggle';

export function Topbar() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between border-b border-line
        bg-bg/90 px-4 backdrop-blur pt-safe-top md:hidden"
      style={{ height: 'var(--header-height)' }}
    >
      <span className="text-lg font-semibold text-ink">San Gabriel App</span>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm font-medium text-muted hover:text-red-500 dark:hover:text-red-400"
        >
          Salir
        </button>
      </div>
    </header>
  );
}
