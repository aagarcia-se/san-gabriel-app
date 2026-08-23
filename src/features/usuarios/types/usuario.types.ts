import type { WithPayload } from '@/shared/api/apiEnvelope';

// Coincide exactamente con el SELECT de consultarUsuariosDao.
// OJO: "nombreUsuario" acá ya viene concatenado ("Nombre Apellido") por
// el `concat()` del backend — no es solo el primer nombre.
export interface UsuarioListItem {
  idUsuario: number;
  nombreUsuario: string;
  usuario: string;
  telefonoUsuario: string | null;
  correoUsuario: string;
  idRol: number;
  nombreRol: string;
  estadoUsuario: 'A' | 'B'; // A = activo, B = bloqueado
  idSucursal: number;
  nombreSucursal: string;
}

// GET /consultarUsuarios responde:
// { status, message, usuarios: [...] }
export type ConsultarUsuariosResponse = WithPayload<'usuarios', UsuarioListItem[]>;

// Las siguientes 4 responden con el rowsAffected del UPDATE/DELETE bajo
// una key distinta cada una (así lo hace el controller real) — no
// necesitamos el valor en sí, solo confirmar éxito, pero tipamos por
// completitud.
export type BloquearUsuarioResponse = WithPayload<'usuarioBloqueado', number>;
export type DesbloquearUsuarioResponse = WithPayload<'usuarioDesbloqueado', number>;
export type EliminarUsuarioResponse = WithPayload<'usuarioEliminado', number>;

// PUT /resetear-contrasenia responde con la nueva contraseña generada,
// para que el admin se la comparta al usuario.
export type ResetearContraseniaResponse = WithPayload<'passGenerada', string>;
