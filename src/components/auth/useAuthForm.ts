import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiLogin, apiRegister, apiForgotPassword, apiResetPassword, apiGoogleLogin } from '../../api/auth.api';
import { UserSession } from '../LoginSignup';

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'seeker' as 'seeker' | 'provider',
    bio: '',
    phone: '',
    location: 'Poblacion, Cordova',
    avatarUrl: avatars[0],
  });

  useEffect(() => {
    if (initialResetToken) {
      setResetToken(initialResetToken);
    }
  }, [initialResetToken]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleRoleSelect = (role: 'seeker' | 'provider') => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    setFormData((prev) => ({ ...prev, avatarUrl }));
  };

  const handleNextStep = () => {
    if (step === 1) {
      const errors: Record<string, string> = {};
      if (!formData.firstName.trim()) {
        errors.firstName = 'First name is required';
      }
      if (!formData.lastName.trim()) {
        errors.lastName = 'Last name is required';
      }
      if (!formData.email.trim()) {
        errors.email = 'Email address is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Invalid email format';
      }
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        errors.password = 'Must be at least 8 characters';
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }
    }
    if (step === 2) {
      const errors: Record<string, string> = {};
      if (!formData.phone.trim()) {
        errors.phone = 'Contact number is required';
      }
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }
    }
    setFieldErrors({});
    setError('');
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
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
            role: 'seeker', // Default initial view role, switchable in dashboard
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

    if (mode === 'forgot') {
      if (!formData.email.trim()) {
        setFieldErrors({ email: 'Email is required' });
        return;
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setFieldErrors({ email: 'Invalid email format' });
        return;
      }
      setFieldErrors({});
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
      if (!formData.password) {
        setFieldErrors({ password: 'Password is required' });
        return;
      }
      if (formData.password.length < 8) {
        setFieldErrors({ password: 'Must be at least 8 characters' });
        return;
      }
      setFieldErrors({});
      apiResetPassword({ token: resetToken, password: formData.password })
        .then((res) => {
          if (res.success) {
            setSuccessMsg('Password reset successfully. Redirecting to login...');
            setError('');
            setTimeout(() => {
              setMode('login');
              setSuccessMsg('');
              setFormData((prev) => ({ ...prev, password: '' }));
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
      const errors: Record<string, string> = {};
      if (!formData.email.trim()) {
        errors.email = 'Email is required';
      }
      if (!formData.password) {
        errors.password = 'Password is required';
      }
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }
      setFieldErrors({});

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
              role: formData.role,
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
            setSuccessMsg(
              'Registration successful! A verification email has been sent. Please verify your email address to unlock account access.'
            );
            setError('');
            setStep(1);
            setTimeout(() => {
              router.push('/login');
              setSuccessMsg('');
            }, 6000);
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

  return {
    formData,
    setFormData,
    step,
    setStep,
    showPassword,
    setShowPassword,
    error,
    setError,
    successMsg,
    setSuccessMsg,
    fieldErrors,
    setFieldErrors,
    handleInputChange,
    handleRoleSelect,
    handleAvatarSelect,
    handleNextStep,
    handlePrevStep,
    handleGoogleSuccessResponse,
    handleSubmit,
  };
}
