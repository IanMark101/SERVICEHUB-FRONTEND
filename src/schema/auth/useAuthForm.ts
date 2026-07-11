import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { apiLogin, apiRegister, apiForgotPassword, apiResetPassword, apiGoogleLogin } from '@/api/auth.api';
import { UserSession } from '../../components/auth/LoginContainer';
import { signupStep1Schema, signupStep2Schema, loginSchema, forgotSchema, resetSchema } from '@/schema/auth/authValidation';

interface UseAuthFormProps {
  onLoginSuccess: (userData: UserSession) => void;
  mode: 'login' | 'signup' | 'forgot' | 'reset';
  setMode: (mode: 'login' | 'signup' | 'forgot' | 'reset') => void;
  initialResetToken: string;
}

export const avatars = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', // Woman 1
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', // Man 1
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200', // Woman 2
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', // Man 2
];

export default function useAuthForm({
  onLoginSuccess,
  mode,
  setMode,
  initialResetToken,
}: UseAuthFormProps) {
  const router = useRouter();
  const [resetToken, setResetToken] = useState<string>(initialResetToken);
  const [step, setStep] = useState<number>(1);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isRegisterSuccess, setIsRegisterSuccess] = useState<boolean>(false);

  const {
    register,
    handleSubmit: handleRHFSubmit,
    setValue,
    watch,
    setError: setRHFError,
    clearErrors,
    formState: { errors },
  } = useForm({
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

  const formData = watch();

  useEffect(() => {
    if (initialResetToken) {
      setResetToken(initialResetToken);
    }
  }, [initialResetToken]);

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
        result.error.issues.forEach((issue: any) => {
          setRHFError(issue.path[0] as any, {
            type: 'manual',
            message: issue.message,
          });
        });
        return;
      }
    }
    if (step === 2) {
      const result = signupStep2Schema.safeParse(formData);
      if (!result.success) {
        result.error.issues.forEach((issue: any) => {
          setRHFError(issue.path[0] as any, {
            type: 'manual',
            message: issue.message,
          });
        });
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
          localStorage.setItem('accessToken', res.data.accessToken);
          const names = user.name.split(' ');
          const firstName = names[0] || '';
          const lastName = names.slice(1).join(' ') || '';
          onLoginSuccess({
            id: user.id,
            email: user.email,
            firstName,
            lastName,
            role: user.role === 'admin' ? 'admin' : (localStorage.getItem('workspaceRole') as any || 'seeker'),
            avatarUrl: user.avatarUrl || avatars[0],
            bio: user.bio || '',
            phone: user.phone,
            trustScore: user.trustScore,
            verificationStatus: user.verificationStatus,
            emailVerified: user.emailVerified,
          });
        } else {
          setError(res.error || 'Google Login failed');
        }
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Google authentication failed.');
      });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearErrors();
    setError('');

    if (mode === 'forgot') {
      const result = forgotSchema.safeParse(formData);
      if (!result.success) {
        result.error.issues.forEach((issue: any) => {
          setRHFError(issue.path[0] as any, {
            type: 'manual',
            message: issue.message,
          });
        });
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
        .catch((err) => {
          setError(err.response?.data?.error || 'Something went wrong.');
        });
      return;
    }

    if (mode === 'reset') {
      const result = resetSchema.safeParse(formData);
      if (!result.success) {
        result.error.issues.forEach((issue: any) => {
          setRHFError(issue.path[0] as any, {
            type: 'manual',
            message: issue.message,
          });
        });
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
        .catch((err) => {
          setError(err.response?.data?.error || 'Something went wrong.');
        });
      return;
    }

    if (mode === 'login') {
      const result = loginSchema.safeParse(formData);
      if (!result.success) {
        result.error.issues.forEach((issue: any) => {
          setRHFError(issue.path[0] as any, {
            type: 'manual',
            message: issue.message,
          });
        });
        return;
      }

      apiLogin({ email: formData.email, password: formData.password })
        .then((res) => {
          if (res.success) {
            const user = res.data.user;
            localStorage.setItem('accessToken', res.data.accessToken);
            const names = user.name.split(' ');
            const firstName = names[0] || '';
            const lastName = names.slice(1).join(' ') || '';
            onLoginSuccess({
              id: user.id,
              email: user.email,
              firstName,
              lastName,
              role: user.role === 'admin' ? 'admin' : (localStorage.getItem('workspaceRole') as any || 'seeker'),
              avatarUrl: user.avatarUrl || avatars[0],
              bio: user.bio || '',
              phone: user.phone,
              trustScore: user.trustScore,
              verificationStatus: user.verificationStatus,
              emailVerified: user.emailVerified,
            });
          } else {
            setError(res.error || 'Login failed');
          }
        })
        .catch((err) => {
          setError(err.response?.data?.error || 'Invalid email or password');
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

      apiRegister({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        phone: phoneFormatted || '+63 917 000 0000',
        location: formData.location || 'Poblacion, Cordova',
        bio: formData.bio,
        avatarUrl: formData.avatarUrl,
      })
        .then((res) => {
          if (res.success) {
            setIsRegisterSuccess(true);
            setError('');
          } else {
            setError(res.error || 'Registration failed');
          }
        })
        .catch((err) => {
          const validationErrors = err.response?.data?.errors;
          if (validationErrors && Array.isArray(validationErrors)) {
            setError(validationErrors.map((e: any) => e.message).join(', '));
          } else {
            setError(err.response?.data?.error || 'Registration failed');
          }
        });
    }
  };

  // Map RHF errors object to simple record string -> string for backward compatibility
  const fieldErrors: Record<string, string> = {};
  Object.keys(errors).forEach((key) => {
    const errorObj = errors[key as keyof typeof errors];
    if (errorObj) {
      fieldErrors[key] = (errorObj as any).message || '';
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
  };
}
