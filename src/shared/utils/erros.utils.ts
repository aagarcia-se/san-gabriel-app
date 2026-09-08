import { ApiError } from "../api/httpClient";

export function getErrorMessage(err: unknown): string | undefined {
    if (err === null || err === undefined) {
      return undefined;
    }

    if (typeof err === 'object' && 'message' in err) {
      const apiError = err as ApiError;
      return apiError.message;
    }

    if (err instanceof Error) {
      return err.message;
    }

    return undefined;
}