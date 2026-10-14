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
  const body = error.response?.data;
  return body && typeof body === 'object' && !Array.isArray(body) ? body : undefined;
}

/** Translate transport and validation details without replacing useful product messages. */
export function getUserFacingErrorMessage(message: unknown, fallback: string): string {
  if (typeof message !== 'string' || !message.trim()) return fallback;
  const text = message.trim();

  if (/^(?:network (?:error|failed)|failed to fetch|fetch failed|load failed)\.?$/i.test(text)) {
    return 'We couldn’t reach ServiceHub. Check your internet connection and try again.';
  }
  if (/timeout|timed out/i.test(text)) {
    return 'This is taking longer than expected. Please try again.';
  }
  if (/^(?:unauthorized|unauthenticated|jwt expired|invalid token|token expired|authentication required)\.?$/i.test(text)) {
    return 'Please sign in again to continue.';
  }
  if (/^(?:forbidden|access denied)\.?$/i.test(text)) {
    return 'You don’t have permission to do this.';
  }
  if (/^invalid credentials\.?$/i.test(text)) {
    return 'The email or password doesn’t match. Check both and try again.';
  }
  if (/^too many requests\.?$/i.test(text)) {
    return 'Please wait a moment before trying again.';
  }

  // The image endpoints include their actual limit in the response. Keep that
  // limit rather than applying verification's 5 MB limit to every upload.
  const imageLimit = /(?:JPEG|JPG), PNG, or WebP (?:data URL|image) no larger than (\d+)\s?MB/i.exec(text);
  if (imageLimit) return `Choose a JPG, PNG, or WebP photo no larger than ${imageLimit[1]} MB.`;
  if (/unsupported (?:file|image|source)|invalid (?:image|mime|file type)|(?:file|image).*(?:mime|not (?:allowed|supported))|(?:mime|file type).*(?:invalid|unsupported|not allowed)/i.test(text)) {
    return 'This file can’t be used. Choose a JPG, PNG, or WebP photo and try again.';
  }
  if (/^(?:payload|request entity|file) too large\.?$/i.test(text)) {
    return 'The upload is too large. Choose a smaller file and try again.';
  }
  if (/^(?:bad request|validation failed|invalid (?:input|enum|option|type)|too (?:small|big): expected)|expected .*(?:received|undefined)|unrecognized key/i.test(text)) {
    return 'Some details are missing or need changing. Check the form and try again.';
  }

  // Never display runtime errors, stack traces, storage details or HTML error
  // pages. The caller supplies the action-specific recovery message.
  if (/request failed with status code|^(?:error|typeerror|syntaxerror|referenceerror):|unexpected (?:token|end of json)|cannot (?:read|set) properties|is not a function|\b(?:prisma|sqlstate|econnrefused|enotfound|econnreset|err_[a-z_]+|stack trace|base64|cloudinary)\b|data:image\/|<\/?(?:html|!doctype|body)\b|[a-z]:\\|\bat .+\.(?:ts|js):\d+/i.test(text) || /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+$/.test(text) || /^(?:internal server error|unsupported media type)\.?$/i.test(text)) {
    return fallback;
  }
  return text;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isApiServiceUnavailable(error)) return SERVICE_UNAVAILABLE_MESSAGE;
  // Older development servers may return Prisma queries and filesystem paths.
  // Keep server failure details out of product screens; validation stays intact.
  if ((getApiErrorStatus(error) || 0) >= 500) return fallback;
  if (isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return 'This is taking longer than expected. Please try again.';
    }
    if (!error.response && error.code === 'ERR_NETWORK') {
      return 'We couldn’t reach ServiceHub. Check your internet connection and try again.';
    }
    if (error.code === 'ERR_CANCELED') return fallback;
  }
  const body = getApiErrorBody(error);
  const message = body?.errors?.[0]?.message || body?.message || body?.error;
  if (message) return getUserFacingErrorMessage(message, fallback);
  const status = getApiErrorStatus(error);
  if (status === 401) return 'Please sign in again to continue.';
  if (status === 403) return 'You don’t have permission to do this.';
  if (status === 413) return 'The upload is too large. Choose a smaller file and try again.';
  if (status === 415) return fallback;
  if (status === 429) return 'Please wait a moment before trying again.';
  return getUserFacingErrorMessage(error instanceof Error ? error.message : undefined, fallback);
}

export function getApiErrorStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined;
}
