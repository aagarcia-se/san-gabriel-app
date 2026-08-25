import type { WithPayload } from '@/shared/api/apiEnvelope';

// Coincide con el SELECT de consultarPermisosDao.
// Los permisos se crean directo en base de datos (no desde la app) —
// este módulo es solo de LECTURA, para alimentar el checklist de
// permisos al crear/editar un Rol.
export interface Permiso {
  idPermiso: number;
  nombrePermiso: string;
  descripcionPermiso: string;
  rutaAcceso: string;
  fechaCreacion: string;
  estado: 'A' | 'N';
}

// GET /consultarPermisos responde:
// { status, message, permisos: [...] }
export type ConsultarPermisosResponse = WithPayload<'permisos', Permiso[]>;
