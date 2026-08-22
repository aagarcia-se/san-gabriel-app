import { Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { ThemeToggle } from '@/shared/theme/ThemeToggle';
import { usePwaInstallStore } from '@/shared/pwa/usePwaInstall';

export function Topbar() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const isInstallable = usePwaInstallStore((state) => state.isInstallable);
  const promptInstall = usePwaInstallStore((state) => state.promptInstall);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between border-b border-line
        bg-surface/95 px-4 backdrop-blur pt-safe-top md:hidden"
      style={{ height: 'var(--header-height)' }}
    >
      <span className="text-lg font-semibold text-ink">San Gabriel App</span>
      <div className="flex items-center gap-1.5">
        {isInstallable && (
          <button
            type="button"
            onClick={promptInstall}
            aria-label="Instalar la aplicación"
            title="Instalar app"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <Download className="h-[18px] w-[18px]" />
          </button>
        )}
        <ThemeToggle />
        <button
          type="button"
          onClick={handleLogout}
          className="ml-1 text-sm font-medium text-muted hover:text-danger-600 dark:hover:text-danger-400"
        >
          Salir
        </button>
      </div>
    </header>
  );
}
