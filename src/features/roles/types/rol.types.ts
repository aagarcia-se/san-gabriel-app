import type { ApiEnvelope, WithPayload } from '@/shared/api/apiEnvelope';

// Coincide con el SELECT de consultarRolesDao.
export interface Rol {
  idRol: number;
  nombreRol: string;
  descripcionRol: string;
  fechaCreacion: string;
  estado: 'A' | 'N';
}

// GET /consultarRoles responde:
// { status, message, roles: [...] }
export type ConsultarRolesResponse = WithPayload<'roles', Rol[]>;

// POST /ingresarRol — fechaCreacion se genera en el navegador (dayjs),
// igual que en Usuarios/Sucursales.
export interface IngresarRolRequest {
  nombreRol: string;
  descripcionRol: string;
  fechaCreacion: string;
}
export type IngresarRolResponse = WithPayload<'idRol', number>;

// PUT /actualizarRol/ — OJO: eliminarRolDao hace un DELETE real (no
// soft delete como el resto de módulos) — la eliminación es permanente.
export interface ActualizarRolRequest {
  idRol: number;
  nombreRol: string;
  descripcionRol: string;
}
export type ActualizarRolResponse = WithPayload<'rol', number>; // rowsAffected

export type EliminarRolResponse = ApiEnvelope;

// GET /consultarRolesPermisosId/:idRol — devuelve el rol junto con los
// IDs de los permisos que ya tiene asignados (consultarRolesPermisosPorIdDao
// retorna un solo objeto, no un array).
export interface RolConPermisos {
  idRol: number;
  nombreRol: string;
  descripcionRol: string;
  permisos: number[];
}
export type ConsultarRolPermisosResponse = WithPayload<'rolesPermisos', RolConPermisos>;

// Los endpoints "batch" son los que hay que usar para asignar/quitar
// permisos de un rol (más rápidos — corren en una sola transacción).
export interface RolPermisoPair {
  idRol: number;
  idPermiso: number;
}
export type IngresarPermisosBatchRequest = RolPermisoPair[];
export type EliminarPermisosBatchRequest = RolPermisoPair[];
export type IngresarPermisosBatchResponse = WithPayload<'permisosAsignados', number>;
export type EliminarRolPermisosBatchResponse = WithPayload<'permisosEliminados', number>;
