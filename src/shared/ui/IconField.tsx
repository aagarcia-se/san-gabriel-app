import type { PropsWithChildren } from 'react';
import type { LucideIcon } from 'lucide-react';

interface IconFieldProps extends PropsWithChildren {
  icon: LucideIcon;
}

// Envuelve un <input>/<select> con un ícono a la izquierda. El hijo debe
// tener la clase "pl-9" además de "input" para dejarle espacio al ícono.
export function IconField({ icon: Icon, children }: IconFieldProps) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      {children}
    </div>
  );
}
