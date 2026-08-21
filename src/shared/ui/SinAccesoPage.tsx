import { ShieldAlert } from 'lucide-react';

export function SinAccesoPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <ShieldAlert className="h-10 w-10 text-amber-500" />
      <p className="text-sm font-medium text-muted">
        No tienes permiso para ver este módulo.
      </p>
      <p className="max-w-xs text-sm text-muted">
        Si crees que deberías tener acceso, contacta a un administrador
        para que revise los permisos de tu rol.
      </p>
    </div>
  );
}
