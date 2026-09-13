import { describe, expect, it } from 'vitest';
import { loginSchema, signupStep1Schema, signupStep2Schema } from './authValidation';

describe('authentication validation', () => {
  it('accepts a valid login and trims its email', () => {
    const result = loginSchema.parse({ email: ' user@example.com ', password: 'secret' });
    expect(result.email).toBe('user@example.com');
  });

  it('rejects a malformed email', () => {
    const result = loginSchema.safeParse({ email: 'user@example', password: 'secret' });
    expect(result.success).toBe(false);
  });

  it('requires strong matching signup credentials and terms consent', () => {
    const result = signupStep1Schema.safeParse({
      firstName: 'Ana',
      lastName: 'Cruz',
      email: 'ana@example.com',
      password: 'Password1',
      confirmPassword: 'Password2',
      agreeTerms: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join('.'));
      expect(paths).toEqual(expect.arrayContaining(['confirmPassword', 'agreeTerms']));
    }
  });

  it('normalizes a valid Philippine mobile number', () => {
    const result = signupStep2Schema.parse({ phone: '917 123 4567', location: 'Cordova' });
    expect(result.phone).toBe('9171234567');
  });
});
