import { useEffect } from 'react';
import { usePwaInstallStore } from './usePwaInstall';

// Se monta una sola vez en App.tsx. Captura el evento que Chrome/Edge
// disparan cuando la PWA cumple los requisitos para poder instalarse
// (manifest válido + service worker registrado, ambos ya configurados
// en vite.config.ts), y detecta cuándo el usuario ya la instaló.
export function PwaInstallListener() {
  const setDeferredPrompt = usePwaInstallStore((state) => state.setDeferredPrompt);
  const setInstalled = usePwaInstallStore((state) => state.setInstalled);

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      // Evita que el navegador muestre su propio mini-banner genérico;
      // el control queda en nuestro InstallBanner/botón.
      event.preventDefault();
      setDeferredPrompt(event as never);
    }

    function handleAppInstalled() {
      setInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [setDeferredPrompt, setInstalled]);

  return null;
}
