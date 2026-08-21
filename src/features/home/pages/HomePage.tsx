import { useAuthStore } from '@/features/auth/store/authStore';

export function HomePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-50">
          Bienvenido{user ? `, ${user.nombre}` : ''}
        </h1>
        <p className="text-sm text-slate-400">
          {user?.rol && user?.sucursal
            ? `${user.rol} · ${user.sucursal}`
            : 'Este es el punto de partida del proyecto.'}
        </p>
      </div>

      <div className="card">
        <p className="text-sm text-slate-300">
          Dime qué módulo quieres construir ahora (ej. productos, ventas,
          órdenes de producción) y seguimos integrándolo contra tu API,
          usando la misma rutaAcceso que ya trae su permiso.
        </p>
      </div>
    </div>
  );
}
