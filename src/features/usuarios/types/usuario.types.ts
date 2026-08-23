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
