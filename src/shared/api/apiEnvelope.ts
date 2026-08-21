export interface ApiEnvelope {
  status: number;
  message: string;
}

export type WithPayload<K extends string, T> = ApiEnvelope & {
  [P in K]: T;
};