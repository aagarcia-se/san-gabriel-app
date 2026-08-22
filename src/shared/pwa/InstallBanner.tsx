import { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePwaInstallStore } from './usePwaInstall';

const DISMISS_KEY = 'pwa-install-dismissed-at';
const DISMISS_DAYS = 14;

function wasRecentlyDismissed(): boolean {
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const dismissedAt = Number(raw);
  if (Number.isNaN(dismissedAt)) return false;
  const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
  return daysSince < DISMISS_DAYS;
}

// Banner flotante arriba, visible en cualquier pantalla (login o app).
// Aparece solo si el navegador ofreció instalarla (Android/desktop) o
// si es iOS (donde no hay evento nativo, así que se muestran los pasos
// manuales). Se puede cerrar; reaparece pasados 14 días.
export function InstallBanner() {
  const isInstallable = usePwaInstallStore((state) => state.isInstallable);
  const isInstalled = usePwaInstallStore((state) => state.isInstalled);
  const isIos = usePwaInstallStore((state) => state.isIos);
  const promptInstall = usePwaInstallStore((state) => state.promptInstall);

  const [dismissed, setDismissed] = useState(() => wasRecentlyDismissed());

  const showIosHint = isIos && !isInstalled && !dismissed;
  const showNativePrompt = isInstallable && !isInstalled && !dismissed;

  if (!showIosHint && !showNativePrompt) return null;

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
  }

  return (
    <div className="fixed inset-x-0 top-0 z-50 px-3 pt-safe-top sm:px-4 sm:pt-3">
      <div className="mx-auto mt-3 flex max-w-lg items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-lg shadow-slate-950/10 sm:mt-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600">
          <Download className="h-5 w-5 text-white" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">Instala San Gabriel App</p>
          {showIosHint ? (
            <p className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-muted">
              Toca <Share className="h-3.5 w-3.5 shrink-0" /> y luego
              "Agregar a inicio".
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-muted">
              Acceso rápido desde tu pantalla de inicio, sin el navegador.
            </p>
          )}
        </div>

        {showNativePrompt && (
          <button
            type="button"
            onClick={promptInstall}
            className="btn-primary shrink-0 !px-3 !py-1.5 text-xs"
          >
            Instalar
          </button>
        )}

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Cerrar aviso de instalación"
          className="shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
