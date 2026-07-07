import { z } from 'zod';

const baseEmailSchema = (requiredMessage: string) => z.string()
  .trim()
  .min(1, requiredMessage)
  .refine((val) => val.includes('@'), {
    message: "Email is missing the '@' symbol (e.g. user@example.com)",
  })
  .refine((val) => {
    const parts = val.split('@');
    return parts.length === 2 && parts[1].includes('.');
  }, {
    message: "Email domain is missing a dot suffix (e.g. '.com')",
  })
  .refine((val) => {
    return /\S+@\S+\.\S+/.test(val);
  }, {
    message: 'Please enter a valid email format',
  });

// Step 1: Credentials & Agreement
export const signupStep1Schema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: baseEmailSchema('Email address is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the Terms of Service and Privacy Policy',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Step 2: Contact Info
export const signupStep2Schema = z.object({
  phone: z.string()
    .trim()
    .min(1, 'Contact number is required')
    .transform((val) => val.replace(/\s+/g, ''))
    .refine((val) => /^(\+639|09)\d{9}$/.test(val), {
      message: 'Invalid PH mobile format (e.g. 09171234567 or +63 917 123 4567)',
    }),
  location: z.string().trim().min(1, 'Location is required'),
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
  password: z.string()
    .min(8, 'Must be at least 8 characters'),
});
