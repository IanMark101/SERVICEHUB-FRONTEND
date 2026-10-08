import { describe, expect, it } from 'vitest';
import { getApiErrorMessage, isApiServiceUnavailable, SERVICE_UNAVAILABLE_MESSAGE } from './errors';

const failure = (status: number, data: object) => ({ isAxiosError: true, response: { status, data } });

describe('API failure messages', () => {
  it('shows an actionable service message for a database quota failure', () => {
    const error = failure(503, { code: 'DATABASE_QUOTA_EXCEEDED', error: 'Invalid prisma.refreshToken.findUnique() in C:\\private\\backend' });
    expect(isApiServiceUnavailable(error)).toBe(true);
    expect(getApiErrorMessage(error, 'Workload unavailable.')).toBe(SERVICE_UNAVAILABLE_MESSAGE);
  });

  it('recognizes older quota responses and ordinary service outages', () => {
    expect(getApiErrorMessage(failure(500, { code: 'DATABASE_QUOTA_EXCEEDED' }), 'Fallback')).toBe(SERVICE_UNAVAILABLE_MESSAGE);
    expect(getApiErrorMessage(failure(503, {}), 'Fallback')).toBe(SERVICE_UNAVAILABLE_MESSAGE);
  });

  it('keeps raw legacy server errors out of the interface', () => {
    expect(getApiErrorMessage(failure(500, { error: 'Invalid prisma.refreshToken.findUnique() in C:\\private\\backend' }), 'Workload is temporarily unavailable.'))
      .toBe('Workload is temporarily unavailable.');
  });

  it('preserves meaningful validation and permission messages', () => {
    expect(getApiErrorMessage(failure(400, { errors: [{ message: 'Enter a valid phone number.' }] }), 'Fallback')).toBe('Enter a valid phone number.');
    expect(getApiErrorMessage(failure(403, { error: 'Please verify your email address first' }), 'Fallback')).toBe('Please verify your email address first');
    expect(isApiServiceUnavailable(failure(401, {}))).toBe(false);
  });
});
