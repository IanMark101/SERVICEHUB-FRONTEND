import { describe, expect, it } from 'vitest';
import { getApiErrorMessage, getUserFacingErrorMessage, isApiServiceUnavailable, SERVICE_UNAVAILABLE_MESSAGE } from './errors';

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

  it.each([
    ['Unsupported source URL: data:image/svg+xml;base64,PHN2Zz4=', 'This file can’t be used. Choose a JPG, PNG, or WebP photo and try again.'],
    ['Invalid MIME type: image/svg+xml', 'This file can’t be used. Choose a JPG, PNG, or WebP photo and try again.'],
    ['A JPEG, PNG, or WebP image no larger than 5MB is required.', 'Choose a JPG, PNG, or WebP photo no larger than 5 MB.'],
    ['A JPEG, PNG, or WebP data URL no larger than 10MB is required.', 'Choose a JPG, PNG, or WebP photo no larger than 10 MB.'],
    ['Invalid input: expected string, received undefined', 'Some details are missing or need changing. Check the form and try again.'],
    ['Invalid option: expected one of "GOVERNMENT_ID"|"BARANGAY_ID"', 'Some details are missing or need changing. Check the form and try again.'],
    ['Validation failed', 'Some details are missing or need changing. Check the form and try again.'],
    ['Unauthorized', 'Please sign in again to continue.'],
    ['Forbidden', 'You don’t have permission to do this.'],
    ['Network Error', 'We couldn’t reach ServiceHub. Check your internet connection and try again.'],
    ['timeout of 15000ms exceeded', 'This is taking longer than expected. Please try again.'],
  ])('explains %s without exposing technical details', (message, expected) => {
    expect(getApiErrorMessage(failure(400, { error: message }), 'Your photo could not be uploaded. Try again.')).toBe(expected);
  });

  it.each([
    'Request failed with status code 400',
    'Cannot read properties of undefined (reading storageKey)',
    'Unexpected token < in JSON at position 0',
    'Invalid prisma.user.findUnique() in C:\\private\\backend',
    '<!doctype html><html><body>Proxy error</body></html>',
  ])('uses the action-specific recovery message for %s', message => {
    expect(getApiErrorMessage(new Error(message), 'We couldn’t save your changes. Please try again.')).toBe('We couldn’t save your changes. Please try again.');
  });

  it('handles network failures, empty HTTP responses and non-string messages', () => {
    expect(getApiErrorMessage({ isAxiosError: true, code: 'ERR_NETWORK' }, 'Fallback')).toMatch(/Check your internet connection/);
    expect(getApiErrorMessage({ isAxiosError: true, code: 'ECONNABORTED' }, 'Fallback')).toMatch(/taking longer/);
    expect(getApiErrorMessage(failure(413, {}), 'Fallback')).toMatch(/Choose a smaller file/);
    expect(getApiErrorMessage(failure(415, {}), 'We couldn’t upload your photo. Choose another photo and try again.')).toBe('We couldn’t upload your photo. Choose another photo and try again.');
    expect(getApiErrorMessage(failure(429, {}), 'Fallback')).toMatch(/wait a moment/);
    expect(getApiErrorMessage(failure(400, { error: { code: 'BROKEN' } }), 'Fallback')).toBe('Fallback');
    expect(getUserFacingErrorMessage('  ', 'Fallback')).toBe('Fallback');
  });

  it('keeps clear business messages and instructions with a specific wait time', () => {
    expect(getApiErrorMessage(failure(409, { error: 'This listing is no longer available. Choose another service.' }), 'Fallback')).toBe('This listing is no longer available. Choose another service.');
    expect(getApiErrorMessage(failure(429, { error: 'Please wait 60 seconds before requesting another email.' }), 'Fallback')).toBe('Please wait 60 seconds before requesting another email.');
  });
});
