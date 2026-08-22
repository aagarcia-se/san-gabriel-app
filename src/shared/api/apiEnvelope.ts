/**
 * Sobre estándar de respuesta de la API.
 *
 * Ejemplo:
 * {
 *   status: 200,
 *   message: "Consulta exitosa",
 *   usuario: { ... }
 * }
 */
export interface ApiEnvelope {
  status: number;
  message: string;
}

/**
 * Agrega dinámicamente el payload utilizando el nombre
 * de propiedad definido por cada endpoint.
 *
 * Ejemplo:
 * WithPayload<'usuario', Usuario>
 *
 * genera:
 * {
 *   status: number;
 *   message: string;
 *   usuario: Usuario;
 * }
 */
export type WithPayload<K extends string, T> = ApiEnvelope & {
  [P in K]: T;
};
