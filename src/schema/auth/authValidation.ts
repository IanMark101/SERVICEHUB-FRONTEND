import { z } from 'zod';
import { strongPasswordSchema } from './passwordValidation';

const baseEmailSchema = (requiredMessage: string) => z.string()
  .trim()
  .min(1, requiredMessage)
  .refine((val) => val.includes('@'), {
    message: 'Include @ in your email address, like name@example.com.',
  })
  .refine((val) => {
    const parts = val.split('@');
    return parts.length === 2 && parts[1].includes('.');
  }, {
    message: 'Enter the full email address, like name@example.com.',
  })
  .refine((val) => {
    return /\S+@\S+\.\S+/.test(val);
  }, {
    message: 'Check your email address, like name@example.com.',
  });

// Step 1: Credentials & Agreement
export const signupStep1Schema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: baseEmailSchema('Email address is required'),
  password: strongPasswordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the Terms of Service and Privacy Policy',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export function formatSignupAddress(address: { barangay: string; cityMunicipality: string; province: string }) {
  return [address.barangay, address.cityMunicipality, address.province].map((part) => part.trim()).join(', ');
}

// Step 2: Contact Info
export const signupStep2Schema = z.object({
  phone: z.string()
    .trim()
    .min(1, 'Contact number is required')
    .transform((val) => val.replace(/\s+/g, ''))
    .refine((val) => /^(\+639|09|9)\d{9}$/.test(val), {
      message: 'Enter a Philippine mobile number, like 917 123 4567.',
    }),
  barangay: z.string().trim().min(1, 'Barangay is required').max(100, 'Barangay must be at most 100 characters'),
  cityMunicipality: z.string().trim().min(1, 'City / municipality is required').max(100, 'City / municipality must be at most 100 characters'),
  province: z.string().trim().min(1, 'Province is required').max(100, 'Province must be at most 100 characters'),
}).superRefine((data, context) => {
  if (formatSignupAddress(data).length > 100) {
    context.addIssue({
      code: 'custom',
      path: ['province'],
      message: 'Keep the combined barangay, city / municipality, and province within 100 characters.',
    });
  }
});

// Login Form
export const loginSchema = z.object({
  email: baseEmailSchema('Email is required'),
  password: z.string().min(1, 'Password is required'),
});

// Forgot Password Form
export const forgotSchema = z.object({
  email: baseEmailSchema('Email is required'),
});

// Reset Password Form
export const resetSchema = z.object({
  password: strongPasswordSchema,
  confirmPassword: z.string().min(1, 'Confirm your new password.'),
}).refine(data => data.password === data.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match.' });
