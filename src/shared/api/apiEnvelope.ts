// Tu API responde siempre con este sobre (visto en auth.controller.js):
// { status: 200, message: "Consulta exitosa", <dataKey>: <payload> }
// Lo usamos como base genérica para tipar cada endpoint.
export interface ApiEnvelope<T, K extends string> {
  status: number;
  message: string;
}

export type WithPayload<K extends string, T> = ApiEnvelope<T, K> & {
  [key in K]: T;
};
