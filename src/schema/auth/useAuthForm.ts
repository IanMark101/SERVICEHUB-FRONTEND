import { useState, FormEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { apiLogin, apiRegister, apiForgotPassword, apiResetPassword, apiGoogleLogin } from '@/api/auth.api';
import { UserSession } from '../../components/auth/LoginContainer';
import { signupStep1Schema, signupStep2Schema, loginSchema, forgotSchema, resetSchema } from '@/schema/auth/authValidation';
import { setAccessToken } from '@/lib/api/axios';
import { getApiErrorBody, getApiErrorMessage } from '@/lib/api/errors';
import type { FieldPath } from 'react-hook-form';
import type { ZodIssue } from 'zod';

export interface AuthFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
  role: 'seeker' | 'provider';
  bio: string;
  phone: string;
  location: string;
  avatarUrl: string;
}

interface UseAuthFormProps {
  onLoginSuccess: (userData: UserSession) => void;
  mode: 'login' | 'signup' | 'forgot' | 'reset';
  setMode: (mode: 'login' | 'signup' | 'forgot' | 'reset') => void;
  initialResetToken: string;
}

export const avatars = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4,c0aede,d1d4f9',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Milo&backgroundColor=ffd5dc,ffdfbf',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna&backgroundColor=b6e3f4,ffd5dc',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Jasper&backgroundColor=c0aede,ffdfbf',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Sparky&backgroundColor=b6e3f4,d1d4f9',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Bella&backgroundColor=ffd5dc,ffdfbf',
];

export default function useAuthForm({
  onLoginSuccess,
  mode,
  setMode,
  initialResetToken,
}: UseAuthFormProps) {
  const [resetToken] = useState<string>(initialResetToken);
  const [step, setStep] = useState<number>(1);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isRegisterSuccess, setIsRegisterSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    setValue,
    setError: setRHFError,
    clearErrors,
    control,
    formState: { errors },
  } = useForm<AuthFormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
      role: 'seeker' as 'seeker' | 'provider',
      bio: '',
      phone: '',
      location: 'Alegria, Cordova',
      avatarUrl: avatars[0],
    }
  });

  // All fields have concrete defaults above, so the watched object is complete.
  const formData = useWatch({ control }) as AuthFormValues;

  const applyValidationIssues = (issues: ZodIssue[]) => {
    issues.forEach((issue) => {
      const field = issue.path[0];
      if (typeof field === 'string') {
        setRHFError(field as FieldPath<AuthFormValues>, { type: 'manual', message: issue.message });
      }
    });
  };

  const resolveWorkspaceRole = (): 'seeker' | 'provider' =>
    localStorage.getItem('workspaceRole') === 'provider' ? 'provider' : 'seeker';

  const handleRoleSelect = (role: 'seeker' | 'provider') => {
    setValue('role', role);
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    setValue('avatarUrl', avatarUrl);
  };

  const handleNextStep = () => {
    clearErrors();
    setError('');

    if (step === 1) {
      const result = signupStep1Schema.safeParse(formData);
      if (!result.success) {
        applyValidationIssues(result.error.issues);
        return;
      }
    }
    if (step === 2) {
      const result = signupStep2Schema.safeParse(formData);
      if (!result.success) {
        applyValidationIssues(result.error.issues);
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    clearErrors();
    setError('');
    setStep((prev) => prev - 1);
  };

  const handleGoogleSuccessResponse = (idToken: string) => {
    setError('');
    setSuccessMsg('');
    apiGoogleLogin(idToken)
      .then((res) => {
        if (res.success) {
          const user = res.data.user;
          setAccessToken(res.data.accessToken);
          const names = (user.name || '').split(' ');
          const firstName = names[0] || '';
          const lastName = names.slice(1).join(' ') || '';
          onLoginSuccess({
            id: user.id,
            email: user.email,
            firstName,
            lastName,
            role: user.role === 'admin' ? 'admin' : resolveWorkspaceRole(),
            avatarUrl: user.avatarUrl || '',
            bio: user.bio || '',
            phone: user.phone,
            location: user.location,
            trustScore: user.trustScore,
            verificationStatus: user.verificationStatus,
            emailVerified: user.emailVerified,
            onboardingStatus: user.onboardingStatus,
          });
        } else {
          setError(res.error || 'Google Login failed');
        }
      })
      .catch((err: unknown) => {
        setError(getApiErrorMessage(err, 'Google authentication failed.'));
      });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearErrors();
    setError('');

    if (mode === 'forgot') {
      const result = forgotSchema.safeParse(formData);
      if (!result.success) {
        applyValidationIssues(result.error.issues);
        return;
      }
      apiForgotPassword(formData.email)
        .then((res) => {
          if (res.success) {
            setSuccessMsg(res.message || 'If an account exists, a reset link has been sent.');
            setError('');
          } else {
            setError(res.error || 'Failed to send reset link.');
          }
        })
        .catch((err: unknown) => {
          setError(getApiErrorMessage(err, 'Something went wrong.'));
        });
      return;
    }

    if (mode === 'reset') {
      const result = resetSchema.safeParse(formData);
      if (!result.success) {
        applyValidationIssues(result.error.issues);
        return;
      }
      apiResetPassword({ token: resetToken, password: formData.password })
        .then((res) => {
          if (res.success) {
            setSuccessMsg('Password reset successfully. Redirecting to login...');
            setError('');
            setTimeout(() => {
              setMode('login');
              setSuccessMsg('');
              setValue('password', '');
            }, 3000);
          } else {
            setError(res.error || 'Failed to reset password.');
          }
        })
        .catch((err: unknown) => {
          setError(getApiErrorMessage(err, 'Something went wrong.'));
        });
      return;
    }

    if (mode === 'login') {
      const result = loginSchema.safeParse(formData);
      if (!result.success) {
        applyValidationIssues(result.error.issues);
        return;
      }

      setIsLoading(true);
      apiLogin({ email: formData.email, password: formData.password })
        .then((res) => {
          if (res.success) {
            const user = res.data.user;
            setAccessToken(res.data.accessToken);
            const names = (user.name || '').split(' ');
            const firstName = names[0] || '';
            const lastName = names.slice(1).join(' ') || '';
            onLoginSuccess({
              id: user.id,
              email: user.email,
              firstName,
              lastName,
              role: user.role === 'admin' ? 'admin' : resolveWorkspaceRole(),
              avatarUrl: user.avatarUrl || '',
              bio: user.bio || '',
              phone: user.phone,
              location: user.location,
              trustScore: user.trustScore,
              verificationStatus: user.verificationStatus,
              emailVerified: user.emailVerified,
              onboardingStatus: user.onboardingStatus,
            });
          } else {
            setError(res.error || 'Login failed');
          }
        })
        .catch((err: unknown) => {
          setError(getApiErrorMessage(err, 'Invalid email or password'));
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      if (step < 3) {
        handleNextStep();
        return;
      }

      let phoneFormatted = formData.phone.trim();
      if (phoneFormatted && !phoneFormatted.startsWith('+63')) {
        const cleaned = phoneFormatted.replace(/^0/, '');
        if (cleaned.startsWith('9') && cleaned.replace(/\s/g, '').length === 10) {
          const raw = cleaned.replace(/\s/g, '');
          phoneFormatted = `+63 ${raw.slice(0, 3)} ${raw.slice(3, 6)} ${raw.slice(6)}`;
        }
      }

      setIsLoading(true);
      apiRegister({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        phone: phoneFormatted || '+63 917 000 0000',
        location: formData.location || 'Poblacion, Cordova',
        bio: formData.bio,
        // Avatar uploads require an authenticated account. Do not send a local
        // data URL to the API during registration; the user can upload it after
        // signing in and verifying their email.
        avatarUrl: formData.avatarUrl?.startsWith('data:') ? undefined : formData.avatarUrl,
      })
        .then((res) => {
          if (res.success) {
            setIsRegisterSuccess(true);
            setError('');
          } else {
            setError(res.error || 'Registration failed');
          }
        })
        .catch((err: unknown) => {
          const body = getApiErrorBody(err);
          const validationErrors = body?.errors;
          if (validationErrors && Array.isArray(validationErrors)) {
            setError(validationErrors.map((validationError) => validationError.message).filter(Boolean).join(', '));
          } else {
            setError(getApiErrorMessage(err, 'Registration failed'));
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  // Map RHF errors object to simple record string -> string for backward compatibility
  const fieldErrors: Record<string, string> = {};
  Object.keys(errors).forEach((key) => {
    const errorObj = errors[key as keyof typeof errors];
    if (errorObj) {
      fieldErrors[key] = typeof errorObj.message === 'string' ? errorObj.message : '';
    }
  });

  return {
    formData,
    step,
    setStep,
    showPassword,
    setShowPassword,
    error,
    setError,
    successMsg,
    setSuccessMsg,
    fieldErrors,
    isRegisterSuccess,
    setIsRegisterSuccess,
    register,
    handleRoleSelect,
    handleAvatarSelect,
    handleNextStep,
    handlePrevStep,
    handleGoogleSuccessResponse,
    handleSubmit,
    isLoading,
    setValue,
  };
}
