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

  // Se captura UNA sola vez, al montar (no en cada render). Justo
  // después se limpia el state del historial (ver useEffect) — si no,
  // al recargar /login el aviso reaparecía siempre, porque React Router
  // persiste el state dentro de la entrada del historial.
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
    <div className="relative flex min-h-screen overflow-hidden bg-[#020617]">
      {/* Cuadrícula de fondo, a pantalla completa */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Glow superior izquierdo */}
      <div
        className="pointer-events-none absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgb(244 63 94 / 0.3) 0%, rgb(244 63 94 / 0) 70%)',
        }}
      />

      {/* Glow inferior derecho */}
      <div
        className="pointer-events-none absolute -bottom-64 -right-64 h-[700px] w-[700px] rounded-full opacity-10 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgb(255 255 255 / 0.18) 0%, rgb(255 255 255 / 0) 70%)',
        }}
      />

      <div className="relative z-10 flex min-h-screen w-full flex-col lg:flex-row">
        {/* Panel izquierdo — solo desktop */}
        <div className="hidden w-1/2 flex-col justify-between p-12 lg:flex">
          <div className="flex h-12 w-12 animate-logo-in items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-white/[0.08] backdrop-blur-sm">
            <span className="text-lg font-bold text-[#F4F4F2]">SG</span>
          </div>

          <div className="max-w-lg space-y-6">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                San Gabriel App
              </span>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-semibold leading-tight tracking-tight text-[#F4F4F2]">
                Gestiona tu negocio
                <br />
                <span className="text-slate-400">desde un solo lugar.</span>
              </h2>
              <p className="max-w-md text-base leading-7 text-slate-400">
                Controla ventas, inventario, productos y operaciones de tu
                negocio desde cualquier dispositivo.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="h-px w-12 bg-brand-500/60" />
              <div className="h-px w-3 bg-brand-500/20" />
              <div className="h-px w-2 bg-brand-500/10" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>© {new Date().getFullYear()} San Gabriel</span>
            <span>Gestión empresarial</span>
          </div>
        </div>

        {/* Panel del formulario */}
        <div className="flex w-full flex-1 items-center justify-center px-5 py-12 lg:w-1/2">
          <div className="w-full max-w-sm">
            <div className="mb-8 text-center lg:hidden">
              <div className="mx-auto mb-5 flex h-14 w-14 animate-logo-in animate-logo-glow items-center justify-center rounded-full bg-brand-500">
                <span className="text-xl font-bold text-[#F4F4F2]">SG</span>
              </div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                San Gabriel App
              </p>
            </div>

            <div className="rounded-3xl border border-white/[0.08] bg-[#0E1628]/80 p-7 shadow-2xl backdrop-blur-xl sm:p-8">
              <div className="mb-7">
                <h1 className="text-2xl font-semibold tracking-tight text-[#F4F4F2]">
                  Iniciar sesión
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Ingresa con tu cuenta de San Gabriel App
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {showAuthRequiredNotice && (
                  <p
                    role="status"
                    className="flex items-center gap-2 rounded-xl border border-brand-500/20 bg-brand-500/10 px-3 py-2.5 text-sm text-brand-300"
                  >
                    <LogIn className="h-4 w-4 shrink-0" />
                    Debes iniciar sesión para continuar.
                  </p>
                )}

                <div className="space-y-2">
                  <label htmlFor="usuario" className="text-sm font-medium text-slate-300">
                    Usuario
                  </label>
                  <input
                    id="usuario"
                    name="usuario"
                    type="text"
                    autoComplete="username"
                    autoCapitalize="none"
                    autoFocus
                    placeholder="Tu usuario"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    disabled={isPending}
                    required
                    className="w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3 text-sm text-[#F4F4F2] outline-none transition-all placeholder:text-slate-600 focus:border-brand-500/60 focus:bg-black/30 focus:ring-2 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contrasena" className="text-sm font-medium text-slate-300">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="contrasena"
                      name="contrasena"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={contrasena}
                      onChange={(e) => setContrasena(e.target.value)}
                      disabled={isPending}
                      required
                      className="w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3 pr-20 text-sm text-[#F4F4F2] outline-none transition-all placeholder:text-slate-600 focus:border-brand-500/60 focus:bg-black/30 focus:ring-2 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center px-4 text-xs font-medium text-slate-500 transition-colors hover:text-slate-300"
                      tabIndex={-1}
                    >
                      {showPassword ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="rounded-xl border border-danger-500/20 bg-danger-500/10 px-3 py-2.5 text-sm text-danger-300"
                  >
                    {error.message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-brand transition-all duration-200 hover:bg-brand-400 hover:shadow-lg hover:shadow-brand-500/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? 'Ingresando…' : 'Ingresar'}
                </button>
              </form>
            </div>

            <p className="mt-6 text-center text-xs text-slate-600 lg:hidden">
              © {new Date().getFullYear()} San Gabriel · Gestión empresarial
            </p>
          </div>
        </div>
      </div>

      <div className="absolute right-5 top-5 z-30">
        <ThemeToggle className="border-white/[0.08] bg-white/[0.06] text-slate-300 hover:bg-white/[0.1] hover:text-white" />
      </div>
    </div>
  );
}
