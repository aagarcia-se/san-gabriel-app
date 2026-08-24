import type { ApiEnvelope, WithPayload } from '@/shared/api/apiEnvelope';

// Coincide con el SELECT de consultarSucursalesDao.
export interface Sucursal {
  idSucursal: number;
  nombreSucursal: string;
  direccionSucursal: string;
  municipioSucursal: string;
  departamentoSucursal: string;
  latitudSucursal: number | null;
  longitudSucursal: number | null;
  telefonoSucursal: string;
  correoSucursal: string;
  fechaCreacion: string;
  estado: 'A' | 'N';
}

// GET /getSucursales responde:
// { status, message, sucursales: [...] }
export type ConsultarSucursalesResponse = WithPayload<'sucursales', Sucursal[]>;

// POST /ingresarSucursal — ingresarSucursalDao no inserta lat/long, así
// que no van en el formulario de creación. fechaCreacion se genera en
// el navegador (dayjs), igual que en Usuarios.
export interface IngresarSucursalRequest {
  nombreSucursal: string;
  direccionSucursal: string;
  municipioSucursal: string;
  departamentoSucursal: string;
  telefonoSucursal: string;
  correoSucursal: string;
  fechaCreacion: string;
}
export type IngresarSucursalResponse = WithPayload<
  'sucursal',
  { idSucursal: number } & IngresarSucursalRequest
>;

// PUT /actualizar-sucursal — tampoco toca lat/long.
export interface ActualizarSucursalRequest {
  idSucursal: number;
  nombreSucursal: string;
  direccionSucursal: string;
  municipioSucursal: string;
  departamentoSucursal: string;
  telefonoSucursal: string;
  correoSucursal: string;
}

// Estos dos no traen payload extra, solo { status, message }.
export type ActualizarSucursalResponse = ApiEnvelope;
export type EliminarSucursalResponse = ApiEnvelope;
