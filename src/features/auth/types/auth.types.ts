import type { WithPayload } from '@/shared/api/apiEnvelope';

// Body que espera POST /auth/login (ver auth.service.js: data.usuario, data.contrasena)
export interface LoginRequest {
  usuario: string;
  contrasena: string;
}

// Confirmado con un JWT decodificado real.
export interface AuthUser {
  idUsuario: number;
  usuario: string;
  nombre: string;
  apellido: string;
  telefono: string | null;
  correo: string;
  idRol: number;
  rol: string;
  estadoUsuario: string;
  idSucursal: number;
  sucursal: string;
}

// Confirmado con un JWT decodificado real.
export interface Permiso {
  idPermiso: number;
  nombrePermiso: string;
  rutaAcceso: string;
}

// Claims reales del JWT (payload firmado por jwt.generateToken en auth/jwt.js).
export interface JwtPayload {
  usuario: AuthUser;
  permisos: Permiso[];
  iat: number;
  exp: number;
}

// POST /auth/login responde:
// { status: 200, message: "Consulta exitosa", authUser: "<jwt firmado>" }
// authUser es el token plano (string) — los datos de usuario/permisos
// viven codificados dentro del payload del JWT.
export type LoginResponse = WithPayload<'authUser', string>;
