import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useCrearUsuario } from '../api/useUsuarioMutations';
import { PageHeader } from '@/shared/ui/PageHeader';
import { UsuarioForm, type UsuarioFormValues } from './UsuarioForm';

export function CrearUsuarioPage() {
  const navigate = useNavigate();
  const { mutate, isPending, error } = useCrearUsuario();

  function handleSubmit(values: UsuarioFormValues) {
    mutate(
      {
        nombreUsuario: values.nombreUsuario.trim(),
        apellidoUsuario: values.apellidoUsuario.trim(),
        correoUsuario: values.correoUsuario.trim(),
        idRol: Number(values.idRol),
        idSucursal: Number(values.idSucursal),
        // Se genera acá, en el navegador — el formulario no la pide.
        fechaCreacion: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        onSuccess: () => navigate('/users', { replace: true }),
      },
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Nuevo usuario" backTo="/users" />

      <div className="card">
        <p className="mb-4 text-sm text-muted">
          El usuario y la contraseña se generan automáticamente y se envían por correo a la
          persona.
        </p>
        <UsuarioForm
          submitLabel="Crear usuario"
          isSubmitting={isPending}
          errorMessage={error?.message}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/users')}
        />
      </div>
    </div>
  );
}
