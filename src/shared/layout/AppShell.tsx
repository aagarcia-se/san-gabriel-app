import type { PropsWithChildren } from 'react';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

// Layout raíz: en móvil -> Topbar + contenido + BottomNav.
// En tablet/desktop (md+) -> Sidebar fijo a la izquierda + contenido.
export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />
        <main className="app-container flex-1 py-6 pb-[calc(var(--bottom-nav-height)+1.5rem)] md:pb-6">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
