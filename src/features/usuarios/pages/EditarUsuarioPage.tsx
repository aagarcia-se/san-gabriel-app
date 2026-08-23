import { useNavigate, useParams } from 'react-router-dom';
import { useUsuarios } from '../api/useUsuarios';
import { useActualizarDatosUsuario } from '../api/useUsuarioMutations';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { UsuarioForm, type UsuarioFormValues } from './UsuarioForm';

// El nombre completo llega concatenado desde consultarUsuarios (ej.
// "Angel Garcia") — lo partimos en la primera palabra vs. el resto.
// No es infalible con nombres compuestos ("Maria Jose", "De La Cruz"),
// por eso el formulario avisa que hay que verificarlo antes de guardar.
function splitNombreCompleto(nombreCompleto: string): { nombre: string; apellido: string } {
  const partes = nombreCompleto.trim().split(/\s+/);
  return {
    nombre: partes[0] ?? '',
    apellido: partes.slice(1).join(' '),
  };
}

export function EditarUsuarioPage() {
  const { idUsuario } = useParams<{ idUsuario: string }>();
  const navigate = useNavigate();

  const { data: usuarios, isLoading, isError, error, refetch } = useUsuarios();
  const usuario = usuarios?.find((u) => u.idUsuario === Number(idUsuario));

  const { mutate, isPending, error: mutationError } = useActualizarDatosUsuario();

  function handleSubmit(values: UsuarioFormValues) {
    if (!usuario) return;
    mutate(
      {
        idUsuario: usuario.idUsuario,
        nombreUsuario: values.nombreUsuario.trim(),
        apellidoUsuario: values.apellidoUsuario.trim(),
        correoUsuario: values.correoUsuario.trim(),
        idRol: Number(values.idRol),
        idSucursal: Number(values.idSucursal),
      },
      {
        onSuccess: () => navigate('/users', { replace: true }),
      },
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Editar usuario" backTo="/users" />

      {isLoading && <Spinner label="Cargando…" />}

      {isError && <ErrorState message={error?.message} onRetry={() => refetch()} />}

      {!isLoading && !isError && !usuario && (
        <EmptyState
          title="Usuario no encontrado"
          description="Puede que ya no exista, o el enlace esté roto."
        />
      )}

      {usuario && (
        <div className="card">
          <UsuarioForm
            initialValues={{
              nombreUsuario: splitNombreCompleto(usuario.nombreUsuario).nombre,
              apellidoUsuario: splitNombreCompleto(usuario.nombreUsuario).apellido,
              correoUsuario: usuario.correoUsuario,
              idRol: String(usuario.idRol),
              idSucursal: String(usuario.idSucursal),
            }}
            submitLabel="Guardar cambios"
            isSubmitting={isPending}
            errorMessage={mutationError?.message}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/users')}
          />
        </div>
      )}
    </div>
  );
}
