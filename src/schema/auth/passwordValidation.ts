import { z } from 'zod';

export const passwordRequirements = [
  { label: 'At least 8 characters', test: (value: string) => value.length >= 8 },
  { label: 'One uppercase letter', test: (value: string) => /[A-Z]/.test(value) },
  { label: 'One lowercase letter', test: (value: string) => /[a-z]/.test(value) },
  { label: 'One number', test: (value: string) => /[0-9]/.test(value) },
  { label: 'One special character', test: (value: string) => /[^A-Za-z0-9\s]/.test(value) },
];
export const strongPasswordSchema = z.string()
  .min(8, 'Use at least 8 characters.')
  .refine(value => new TextEncoder().encode(value).length <= 72, 'Use at most 72 bytes (fewer characters when using emoji).')
  .regex(/[A-Z]/, 'Include an uppercase letter.')
  .regex(/[a-z]/, 'Include a lowercase letter.')
  .regex(/[0-9]/, 'Include a number.')
  .regex(/[^A-Za-z0-9\s]/, 'Include a special character.');
export const passwordFormSchema = z.object({
  newPassword: strongPasswordSchema,
  confirmPassword: z.string().min(1, 'Confirm your new password.'),
}).refine(value => value.newPassword === value.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match.' });
