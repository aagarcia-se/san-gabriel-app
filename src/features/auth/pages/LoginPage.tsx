import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useLogin } from '../api/useLogin';
import { ThemeToggle } from '@/shared/theme/ThemeToggle';

interface LocationState {
  reason?: 'auth-required';
}

export function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { mutate, isPending, error } = useLogin();

  // Se captura UNA sola vez, al montar (no en cada render), a partir del
  // state que dejó ProtectedRoute. Justo después se limpia ese state del
  // historial del navegador (ver useEffect) — si no, al recargar /login
  // el aviso reaparecía siempre, porque React Router persiste el state
  // dentro de la entrada del historial, no en memoria de la app.
  const [showAuthRequiredNotice] = useState(
    () => (location.state as LocationState | null)?.reason === 'auth-required',
  );

  useEffect(() => {
    if (showAuthRequiredNotice) {
      navigate(location.pathname, { replace: true, state: null });
    }
    // Solo debe correr una vez al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!usuario.trim() || !contrasena) return;
    mutate({ usuario: usuario.trim(), contrasena });
  }

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Panel de marca — solo visible en laptop/escritorio (lg+).
          Se mantiene con la paleta de marca fija (no sigue el tema),
          es un panel decorativo, igual que en apps tipo SaaS. */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-900 to-slate-950 p-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
          <span className="text-lg font-bold text-white">SG</span>
        </div>
        <div className="relative space-y-3">
          <h2 className="text-3xl font-semibold text-white">
            Panadería San Gabriel
          </h2>
          <p className="max-w-sm text-brand-100">
            Gestiona tu operación desde cualquier dispositivo: pedidos,
            inventario y más, todo en un mismo lugar.
          </p>
        </div>
      </div>

      {/* Panel de formulario — full width en móvil, mitad en desktop */}
      <div className="relative flex w-full flex-1 items-center justify-center px-4 py-10 lg:w-1/2">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:text-left">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 lg:hidden">
              <span className="text-xl font-bold text-white">SG</span>
            </div>
            <h1 className="text-2xl font-semibold text-ink">Iniciar sesión</h1>
            <p className="mt-1 text-sm text-muted">
              Ingresa con tu cuenta de San Gabriel App
            </p>
          </div>

          <form onSubmit={handleSubmit} className="card space-y-4" noValidate>
            {showAuthRequiredNotice && (
              <p
                role="status"
                className="flex items-center gap-2 rounded-lg bg-brand-500/10 px-3 py-2 text-sm text-brand-600 dark:text-brand-300"
              >
                <LogIn className="h-4 w-4 shrink-0" />
                Debes iniciar sesión para continuar.
              </p>
            )}

            <div className="space-y-1.5">
              <label htmlFor="usuario" className="text-sm font-medium text-ink/80">
                Usuario
              </label>
              <input
                id="usuario"
                name="usuario"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                autoFocus
                className="input"
                placeholder="Tu usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                disabled={isPending}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="contrasena" className="text-sm font-medium text-ink/80">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="contrasena"
                  name="contrasena"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="input pr-16"
                  placeholder="••••••••"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  disabled={isPending}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-xs font-medium text-muted hover:text-ink"
                  tabIndex={-1}
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
                {error.message}
              </p>
            )}

            <button type="submit" className="btn-primary w-full" disabled={isPending}>
              {isPending ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
