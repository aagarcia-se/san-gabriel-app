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

// POST /crearUsuario — el usuario y la contraseña se generan en el
// backend (y la contraseña se envía por correo), así que el frontend
// NO los manda. fechaCreacion se genera en el navegador (dayjs) y se
// envía sin mostrarse en el formulario.
export interface CrearUsuarioRequest {
  nombreUsuario: string;
  apellidoUsuario: string;
  correoUsuario: string;
  idRol: number;
  idSucursal: number;
  fechaCreacion: string;
}
export type CrearUsuarioResponse = WithPayload<'idUsuario', number>;

// PUT /actualizar-datos-usuario — nombre, correo, rol y sucursal.
// (el username se edita aparte, en /perfil, con actualizarUsuario)
export interface ActualizarDatosUsuarioRequest {
  idUsuario: number;
  nombreUsuario: string;
  apellidoUsuario: string;
  correoUsuario: string;
  idRol: number;
  idSucursal: number;
}
export type ActualizarDatosUsuarioResponse = WithPayload<'usuarioActualizado', number>;
