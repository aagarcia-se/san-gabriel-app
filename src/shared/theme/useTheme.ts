import { create } from 'zustand';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

// El <script> inline en index.html ya aplicó la clase "dark" al <html>
// antes del primer render (evita el flash del tema equivocado). Aquí solo
// leemos ese estado inicial para que React y el DOM arranquen sincronizados.
function getInitialTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

// applyTheme SOLO cambia la clase "dark" y persiste la preferencia — ya
// no toca el <meta name="theme-color"> aquí. Antes lo hacía siempre,
// pero eso significaba que alternar el tema EN EL LOGIN también movía
// la barra de estado del teléfono a blanco, cosa que no debe pasar: el
// login siempre debe verse con el mismo navy fijo. Ahora cada pantalla
// decide si debe sincronizar el theme-color con el tema activo:
// - LoginPage: nunca lo sincroniza (queda fijo en #020617).
// - AppShell (área autenticada): sí lo sincroniza (ver su useEffect).
function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
}

// Deben coincidir exactamente con --color-bg de globals.css (light/dark).
// Lo usan las pantallas que sí quieren mantener el status bar sincronizado
// con el tema activo (por ahora, solo AppShell).
export const THEME_COLOR = { light: '#ffffff', dark: '#020617' } as const;

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },
}));
