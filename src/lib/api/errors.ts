import { isAxiosError } from 'axios';

type ApiErrorBody = {
  error?: string;
  message?: string;
  errors?: Array<{ message?: string }>;
  code?: string;
  field?: 'title' | 'description' | 'category';
};

export function getApiErrorBody(error: unknown): ApiErrorBody | undefined {
  if (!isAxiosError<ApiErrorBody>(error)) return undefined;
  return error.response?.data;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const body = getApiErrorBody(error);
  return body?.errors?.[0]?.message || body?.message || body?.error || (error instanceof Error ? error.message : fallback);
}

export function getApiErrorStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined;
}
