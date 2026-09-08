import { useEffect, useState, type FormEvent } from 'react';
import { Check, Eye, EyeOff, KeyRound, Mail, Pencil, User, X } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useActualizarPassword, useActualizarPerfil } from '../api/usePerfilMutations';
import { IconField } from '@/shared/ui/IconField';
import { ButtonSpinner } from '@/shared/ui/ButtonSpinner';
import { cn } from '@/shared/lib/cn';
import type { ApiError } from '@/shared/api/httpClient';

interface PerfilFormValues {
  nombre: string;
  apellido: string;
  correo: string;
  usuario: string;
}

const PASSWORD_REQUISITOS = [
  { label: 'Al menos 8 caracteres', test: (pass: string) => pass.length >= 8 },
  { label: 'Una letra mayúscula', test: (pass: string) => /[A-Z]/.test(pass) },
  { label: 'Un número', test: (pass: string) => /[0-9]/.test(pass) },
  { label: 'Un carácter especial (* / -)', test: (pass: string) => /[^A-Za-z0-9]/.test(pass) },
];

function passwordCumpleTodo(pass: string) {
  return PASSWORD_REQUISITOS.every((req) => req.test(pass));
}

// Alerta de éxito que se puede cerrar a mano y que además se oculta
// sola después de unos segundos.
function SuccessAlert({
  message,
  onDismiss,
  autoDismissMs = 5000,
}: {
  message: string;
  onDismiss: () => void;
  autoDismissMs?: number;
}) {
  useEffect(() => {
    const timeout = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(timeout);
  }, [onDismiss, autoDismissMs]);

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-600 dark:text-green-400">
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Cerrar"
        className="shrink-0 rounded-md p-0.5 transition-colors hover:bg-green-500/20"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function PerfilPage() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const actualizarPerfil = useActualizarPerfil();
  const actualizarPassword = useActualizarPassword();

  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState<PerfilFormValues>({
    nombre: user?.nombre ?? '',
    apellido: user?.apellido ?? '',
    correo: user?.correo ?? '',
    usuario: user?.usuario ?? '',
  });
  const [perfilError, setPerfilError] = useState<string | undefined>();
  const [perfilSuccess, setPerfilSuccess] = useState(false);

  const [passValues, setPassValues] = useState({ nueva: '', confirmar: '' });
  const [showPass, setShowPass] = useState(false);
  const [passError, setPassError] = useState<string | undefined>();
  const [passSuccess, setPassSuccess] = useState(false);
  const [passTouched, setPassTouched] = useState(false);

  const confirmanCoinciden =
    passValues.confirmar.length > 0 && passValues.nueva === passValues.confirmar;

  function startEditing() {
    setValues({
      nombre: user?.nombre ?? '',
      apellido: user?.apellido ?? '',
      correo: user?.correo ?? '',
      usuario: user?.usuario ?? '',
    });
    setPerfilError(undefined);
    setPerfilSuccess(false);
    setIsEditing(true);
  }

  function handleSubmitPerfil(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setPerfilError(undefined);
    setPerfilSuccess(false);

    actualizarPerfil.mutate(
      {
        idUsuario: user.idUsuario,
        nombreUsuario: values.nombre.trim(),
        apellidoUsuario: values.apellido.trim(),
        correoUsuario: values.correo.trim(),
        usuario: values.usuario.trim(),
      },
      {
        onSuccess: () => {
          updateUser({
            nombre: values.nombre.trim(),
            apellido: values.apellido.trim(),
            correo: values.correo.trim(),
            usuario: values.usuario.trim(),
          });
          setIsEditing(false);
          setPerfilSuccess(true);
        },
        onError: (err : unknown) => {
          setPerfilError((err as ApiError).message ?? 'No se pudo actualizar el perfil.');
        },
      },
    );
  }

  function handleSubmitPassword(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setPassError(undefined);
    setPassSuccess(false);
    setPassTouched(true);

    if (!passwordCumpleTodo(passValues.nueva)) {
      setPassError('La contraseña no cumple con todos los requisitos.');
      return;
    }
    if (!confirmanCoinciden) {
      setPassError('Las contraseñas no coinciden.');
      return;
    }

    actualizarPassword.mutate(
      { usuario: user.usuario, contrasena: passValues.nueva },
      {
        onSuccess: () => {
          setPassValues({ nueva: '', confirmar: '' });
          setPassTouched(false);
          setPassSuccess(true);
        },
        onError: (err : unknown) => {
          setPassError((err as ApiError).message ?? 'No se pudo actualizar la contraseña.');
        },
      },
    );
  }

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
          Puedes actualizar tu nombre, correo y usuario. El rol y la sucursal los administra
          otro usuario con permisos de gestión.
        </p>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink/80">Datos personales</h2>
          {!isEditing && (
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 transition-colors hover:text-brand-500 dark:text-brand-400"
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </button>
          )}
        </div>

        {!isEditing ? (
          <div className="divide-y divide-line">
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
        ) : (
          <form onSubmit={handleSubmitPerfil} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="nombre" className="text-sm font-medium text-ink/80">
                  Nombre
                </label>
                <IconField icon={User}>
                  <input
                    id="nombre"
                    type="text"
                    required
                    value={values.nombre}
                    onChange={(e) => setValues((prev) => ({ ...prev, nombre: e.target.value }))}
                    disabled={actualizarPerfil.isPending}
                    className="input pl-9"
                  />
                </IconField>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="apellido" className="text-sm font-medium text-ink/80">
                  Apellido
                </label>
                <IconField icon={User}>
                  <input
                    id="apellido"
                    type="text"
                    required
                    value={values.apellido}
                    onChange={(e) => setValues((prev) => ({ ...prev, apellido: e.target.value }))}
                    disabled={actualizarPerfil.isPending}
                    className="input pl-9"
                  />
                </IconField>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="correo" className="text-sm font-medium text-ink/80">
                Correo
              </label>
              <IconField icon={Mail}>
                <input
                  id="correo"
                  type="email"
                  required
                  value={values.correo}
                  onChange={(e) => setValues((prev) => ({ ...prev, correo: e.target.value }))}
                  disabled={actualizarPerfil.isPending}
                  className="input pl-9"
                />
              </IconField>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="usuario" className="text-sm font-medium text-ink/80">
                Usuario
              </label>
              <IconField icon={User}>
                <input
                  id="usuario"
                  type="text"
                  required
                  value={values.usuario}
                  onChange={(e) => setValues((prev) => ({ ...prev, usuario: e.target.value }))}
                  disabled={actualizarPerfil.isPending}
                  className="input pl-9"
                />
              </IconField>
              <p className="text-xs text-muted">
                Es el usuario con el que inicias sesión — si lo cambias, úsalo la próxima vez.
              </p>
            </div>

            {perfilError && (
              <p
                role="alert"
                className="rounded-lg bg-danger-500/10 px-3 py-2 text-sm text-danger-600 dark:text-danger-400"
              >
                {perfilError}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={actualizarPerfil.isPending}
                className="btn-secondary"
              >
                <X className="h-4 w-4" />
                Cancelar
              </button>
              <button type="submit" disabled={actualizarPerfil.isPending} className="btn-primary">
                {actualizarPerfil.isPending && <ButtonSpinner />}
                {actualizarPerfil.isPending ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        )}

        {perfilSuccess && !isEditing && (
          <SuccessAlert
            message="Perfil actualizado correctamente."
            onDismiss={() => setPerfilSuccess(false)}
          />
        )}
      </div>

      <div className="card space-y-4">
        <h2 className="text-sm font-medium text-ink/80">Cambiar contraseña</h2>

        <form onSubmit={handleSubmitPassword} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="nuevaContrasena" className="text-sm font-medium text-ink/80">
              Nueva contraseña
            </label>
            <div className="relative">
              <IconField icon={KeyRound}>
                <input
                  id="nuevaContrasena"
                  type={showPass ? 'text' : 'password'}
                  required
                  value={passValues.nueva}
                  onChange={(e) => {
                    setPassValues((prev) => ({ ...prev, nueva: e.target.value }));
                    setPassTouched(true);
                  }}
                  disabled={actualizarPassword.isPending}
                  className="input pl-9 pr-9"
                />
              </IconField>
              <button
                type="button"
                onClick={() => setShowPass((prev) => !prev)}
                aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-ink"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {passTouched && (
              <ul className="space-y-1 pt-1">
                {PASSWORD_REQUISITOS.map((req) => {
                  const cumple = req.test(passValues.nueva);
                  return (
                    <li
                      key={req.label}
                      className={cn(
                        'flex items-center gap-1.5 text-xs transition-colors',
                        cumple ? 'text-green-600 dark:text-green-400' : 'text-muted',
                      )}
                    >
                      {cumple ? (
                        <Check className="h-3.5 w-3.5 shrink-0" />
                      ) : (
                        <X className="h-3.5 w-3.5 shrink-0" />
                      )}
                      {req.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmarContrasena" className="text-sm font-medium text-ink/80">
              Confirmar contraseña
            </label>
            <IconField icon={KeyRound}>
              <input
                id="confirmarContrasena"
                type={showPass ? 'text' : 'password'}
                required
                value={passValues.confirmar}
                onChange={(e) =>
                  setPassValues((prev) => ({ ...prev, confirmar: e.target.value }))
                }
                disabled={actualizarPassword.isPending}
                className="input pl-9"
              />
            </IconField>

            {passValues.confirmar.length > 0 && (
              <p
                className={cn(
                  'flex items-center gap-1.5 pt-1 text-xs transition-colors',
                  confirmanCoinciden
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-danger-600 dark:text-danger-400',
                )}
              >
                {confirmanCoinciden ? (
                  <Check className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <X className="h-3.5 w-3.5 shrink-0" />
                )}
                {confirmanCoinciden ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
              </p>
            )}
          </div>

          {passError && (
            <p
              role="alert"
              className="rounded-lg bg-danger-500/10 px-3 py-2 text-sm text-danger-600 dark:text-danger-400"
            >
              {passError}
            </p>
          )}

          {passSuccess && (
            <SuccessAlert
              message="Contraseña actualizada correctamente."
              onDismiss={() => setPassSuccess(false)}
            />
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={
                actualizarPassword.isPending ||
                !passwordCumpleTodo(passValues.nueva) ||
                !confirmanCoinciden
              }
              className="btn-primary"
            >
              {actualizarPassword.isPending && <ButtonSpinner />}
              {actualizarPassword.isPending ? 'Actualizando…' : 'Actualizar contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}