import { useEffect, type PropsWithChildren } from 'react';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { THEME_COLOR, useThemeStore } from '@/shared/theme/useTheme';

// Layout raíz: en móvil -> Topbar + contenido + BottomNav.
// En tablet/desktop (md+) -> Sidebar fijo a la izquierda + contenido.
export function AppShell({ children }: PropsWithChildren) {
  const theme = useThemeStore((state) => state.theme);

  // A diferencia del login (que mantiene el status bar fijo en navy
  // siempre), acá SÍ queremos que la barra de estado del teléfono/PWA
  // refleje el tema activo — cambia a blanco en modo claro, vuelve a
  // navy en modo oscuro.
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute('content', THEME_COLOR[theme]);
  }, [theme]);

  // Al salir del área autenticada (ej. cerrar sesión, volver a /login),
  // el status bar debe volver al navy fijo del login — sin esto, se
  // quedaría en blanco si el usuario estaba en modo claro.
  useEffect(() => {
    return () => {
      const meta = document.querySelector('meta[name="theme-color"]');
      meta?.setAttribute('content', '#020617');
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      {/* min-w-0: un flex item sin esto NO se encoge por debajo del
          ancho de su contenido — si algo adentro es más ancho de lo
          normal (texto sin truncar, etc.), esta columna empuja todo
          el documento más allá del viewport, y en móvil eso saca la
          barra inferior (fixed) fuera de vista hasta alejar el zoom. */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="app-container min-w-0 flex-1 py-6 pb-[calc(var(--bottom-nav-height)+1.5rem)] md:pb-6">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
