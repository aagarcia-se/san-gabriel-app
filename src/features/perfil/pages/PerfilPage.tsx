import { useAuthStore } from '@/features/auth/store/authStore';

export function PerfilPage() {
  const user = useAuthStore((state) => state.user);

  const fields: Array<[string, string | undefined | null]> = [
    ['Usuario', user?.usuario],
    ['Nombre completo', user ? `${user.nombre} ${user.apellido}` : undefined],
    ['Correo', user?.correo],
    ['Teléfono', user?.telefono ?? 'No registrado'],
    ['Rol', user?.rol],
    ['Sucursal', user?.sucursal],
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Mi perfil</h1>
        <p className="text-sm text-muted">
          Edición de perfil próximamente. Por ahora, esto es lo que tenemos
          registrado de tu cuenta.
        </p>
      </div>

      <div className="card divide-y divide-line">
        {fields.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0"
          >
            <span className="text-sm text-muted">{label}</span>
            <span className="text-sm font-medium text-ink">{value || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
