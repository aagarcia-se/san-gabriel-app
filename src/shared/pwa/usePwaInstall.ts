import { create } from 'zustand';

// El navegador no tipa este evento de forma estándar todavía.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
}

function detectIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

interface PwaInstallState {
  deferredPrompt: BeforeInstallPromptEvent | null;
  // true solo cuando el navegador (Chrome/Edge/Android) ofreció el
  // evento nativo de instalación y todavía no se usó.
  isInstallable: boolean;
  isInstalled: boolean;
  // Safari/iOS no dispara beforeinstallprompt — ahí se muestran
  // instrucciones manuales ("Compartir" > "Agregar a inicio") en vez
  // del botón nativo.
  isIos: boolean;
  setDeferredPrompt: (event: BeforeInstallPromptEvent | null) => void;
  setInstalled: (installed: boolean) => void;
  promptInstall: () => Promise<void>;
}

export const usePwaInstallStore = create<PwaInstallState>((set, get) => ({
  deferredPrompt: null,
  isInstallable: false,
  isInstalled: detectStandalone(),
  isIos: detectIos(),
  setDeferredPrompt: (event) => set({ deferredPrompt: event, isInstallable: !!event }),
  setInstalled: (installed) => set({ isInstalled: installed, isInstallable: false }),
  promptInstall: async () => {
    const { deferredPrompt } = get();
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    set({
      deferredPrompt: null,
      isInstallable: false,
      isInstalled: choice.outcome === 'accepted' ? true : get().isInstalled,
    });
  },
}));
