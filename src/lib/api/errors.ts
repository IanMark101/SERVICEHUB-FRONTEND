import { isAxiosError } from 'axios';

type ApiErrorBody = {
  error?: string;
  message?: string;
  errors?: Array<{ message?: string }>;
  code?: string;
  field?: 'title' | 'description' | 'category';
};

export const SERVICE_UNAVAILABLE_MESSAGE = 'ServiceHub is temporarily unavailable. Please try again later.';

export function isApiServiceUnavailable(error: unknown): boolean {
  const code = getApiErrorBody(error)?.code;
  return getApiErrorStatus(error) === 503 || code === 'DATABASE_QUOTA_EXCEEDED' || code === 'DATABASE_UNAVAILABLE';
}

export function getApiErrorBody(error: unknown): ApiErrorBody | undefined {
  if (!isAxiosError<ApiErrorBody>(error)) return undefined;
  return error.response?.data;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isApiServiceUnavailable(error)) return SERVICE_UNAVAILABLE_MESSAGE;
  // Older development servers may return Prisma queries and filesystem paths.
  // Keep server failure details out of product screens; validation stays intact.
  if ((getApiErrorStatus(error) || 0) >= 500) return fallback;
  const body = getApiErrorBody(error);
  return body?.errors?.[0]?.message || body?.message || body?.error || (error instanceof Error ? error.message : fallback);
}

export function getApiErrorStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined;
}
