import { useAuthStore } from '@/features/auth/store/authStore';

export function InicioPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-ink">
          Bienvenido{user ? `, ${user.nombre}` : ''}
        </h1>
        <p className="text-sm text-muted">
          {user?.rol && user?.sucursal
            ? `${user.rol} · ${user.sucursal}`
            : 'Este es tu punto de partida en San Gabriel App.'}
        </p>
      </div>

      <div className="card">
        <p className="text-sm text-muted">
          Todavía estamos definiendo qué va aquí — accesos directos, resumen
          del día, pendientes… Cuéntame qué te gustaría ver en esta pantalla
          y lo construimos.
        </p>
      </div>
    </div>
  );
}
