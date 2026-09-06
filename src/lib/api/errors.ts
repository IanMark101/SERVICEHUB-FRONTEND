import { isAxiosError } from 'axios';

type ApiErrorBody = {
  error?: string;
  message?: string;
  errors?: Array<{ message?: string }>;
};

export function getApiErrorBody(error: unknown): ApiErrorBody | undefined {
  if (!isAxiosError<ApiErrorBody>(error)) return undefined;
  return error.response?.data;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const body = getApiErrorBody(error);
  return body?.message || body?.error || (error instanceof Error ? error.message : fallback);
}
