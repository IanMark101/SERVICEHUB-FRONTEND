import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Sun,
  Moon
} from 'lucide-react';
import { apiLogin, apiRegister, apiForgotPassword, apiResetPassword, apiGoogleLogin } from '../api/auth.api';
import { useApp } from '../context/AppContext';
import { useToast } from './Toast';

export interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'seeker' | 'provider' | 'admin';
  avatarUrl: string;
  bio: string;
  phone: string;
  trustScore?: number;
  verificationStatus?: string;
  emailVerified?: boolean;
}

interface LoginSignupProps {
  initialMode?: 'login' | 'signup';
  onLoginSuccess: (userData: UserSession) => void;
  onBackToHome?: () => void;
}

export default function LoginSignup({ initialMode, onLoginSuccess, onBackToHome }: LoginSignupProps) {
  const router = useRouter();
  // Bind to App Context for global theme toggling
  const { isDark, toggleTheme } = useApp();
  const { info } = useToast();

  // Theme state: 'green' (Emerald) or 'orange' (Amber/Orange) - default to orange
  const [theme, setTheme] = useState<'green' | 'orange'>('orange');

  // View mode: 'login' | 'signup' | 'forgot' | 'reset'
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>(initialMode || 'login');

  // Sync mode if initialMode prop changes
  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  // Reset password token from url
  const [resetToken, setResetToken] = useState<string>('');

  // Signup step tracker: 1, 2, or 3
  const [step, setStep] = useState<number>(1);

  // Input fields state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'seeker' as 'seeker' | 'provider',
    bio: '',
    phone: '',
    location: 'Poblacion, Cordova', // added location
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('resetToken');
      if (token) {
        setResetToken(token);
        setMode('reset');
      }
    }
  }, []);

  // Google Login Verification and Auto-Creation Handler
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

  // Dynamically load Google accounts.id client script and render the official button
  useEffect(() => {
    let script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    const initAndRenderBtn = () => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (clientId && (window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            handleGoogleSuccessResponse(response.credential);
          }
        });

        const btnContainer = document.getElementById('google-signin-btn');
        if (btnContainer) {
          (window as any).google.accounts.id.renderButton(
            btnContainer,
            {
              theme: isDark ? 'filled_black' : 'outline',
              size: 'large',
              shape: 'pill',
              width: btnContainer.offsetWidth || 300
            }
          );
        }
      }
    };

    if ((window as any).google) {
      initAndRenderBtn();
    } else {
      script.onload = initAndRenderBtn;
    }

    return () => {
      // Keep script loaded to avoid thrashing on mode toggle, but clear container
      const btnContainer = document.getElementById('google-signin-btn');
      if (btnContainer) {
        btnContainer.innerHTML = '';
      }
    };
  }, [mode, step, isDark]);

  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', // Woman 1
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', // Man 1
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200', // Woman 2
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', // Man 2
  ];

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleRoleSelect = (role: 'seeker' | 'provider') => {
    setFormData(prev => ({ ...prev, role }));
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    setFormData(prev => ({ ...prev, avatarUrl }));
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
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setError('');
    setStep(prev => prev - 1);
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
              setFormData(prev => ({ ...prev, password: '' }));
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
              role: formData.role, // Use role selected or default seeker
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

      // Basic phone format formatting to match PH mobile prefix
      let phoneFormatted = formData.phone.trim();
      if (phoneFormatted && !phoneFormatted.startsWith('+63')) {
        // Remove leading 0 if present, e.g. 0917... -> +63 917...
        const cleaned = phoneFormatted.replace(/^0/, '');
        // If it starts with 9 and has 10 digits
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
            setSuccessMsg("Registration successful! A verification email has been sent. Please verify your email address to unlock account access.");
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

  const toggleMode = () => {
    setError('');
    setSuccessMsg('');
    if (mode === 'login') {
      router.push('/register');
    } else {
      router.push('/login');
    }
  };

  const isGreen = theme === 'green';
  const accentText = isGreen ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-500';
  const accentBg = isGreen ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-orange-600 hover:bg-orange-500';

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-[#fbfaf7] dark:bg-[#191919] relative overflow-hidden font-sans select-none text-slate-800 dark:text-[#f2efe9] transition-colors duration-300">

      {/* Decorative Blur Backgrounds - Pastel glows matching theme */}
      <div className={`absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-15 dark:opacity-20 blur-3xl transition-all duration-700 ${isGreen ? 'bg-emerald-500/10 dark:bg-emerald-900/35' : 'bg-orange-500/10 dark:bg-orange-900/35'} pointer-events-none`} />
      <div className={`absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-15 dark:opacity-20 blur-3xl transition-all duration-700 ${isGreen ? 'bg-emerald-500/10 dark:bg-emerald-900/35' : 'bg-orange-500/10 dark:bg-orange-900/35'} pointer-events-none`} style={{ animationDelay: '-5s' }} />

      {/* Left Column: Brand & Horizontal Stepper Indicator */}
      <div className="md:w-1/2 bg-slate-50/50 dark:bg-[#22211e]/40 p-6 sm:p-10 md:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 dark:border-neutral-800/80 relative overflow-hidden min-h-[40vh] md:h-screen transition-colors duration-300">

        {/* Subtle grid line overlays - black lines in light mode, white lines in dark mode */}
        <div className="absolute inset-0 bg-grid-pattern pointer-events-none"></div>

        {/* Branding Logo & Theme switchers */}
        <div className="relative z-10 flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToHome}
            className="flex items-center space-x-2 group hover:opacity-90 transition-all focus:outline-none cursor-pointer"
            title="Back to Landing Page"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700/60 text-slate-500 dark:text-[#b4b0a9] group-hover:bg-slate-200 dark:group-hover:bg-[#22211e] group-hover:shadow-sm transition-all">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            </div>
            <div className={`p-1.5 rounded-lg ${accentBg} text-white flex items-center justify-center font-extrabold text-base shadow-sm transition-colors w-9 h-9`}>
              S
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-[#f2efe9]">ServiceHub Cordova</span>
          </button>

          {/* Theme Toggle Button (Light/Dark Mode) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 h-9 w-9 rounded-xl border transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer bg-white dark:bg-[#22211e] border-slate-200 dark:border-neutral-800/80 text-slate-500 dark:text-amber-500 hover:text-slate-800 dark:hover:text-amber-400 shadow-sm"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Bottom branding and steps container aligned horizontally */}
        <div className="mt-12 md:mt-auto space-y-8 relative z-10">

          {mode === 'signup' ? (
            <>
              {/* Horizontal Header Row: Title on Left, Desc on Right */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-neutral-800/80 pb-4">
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-[#f2efe9] leading-tight tracking-tight max-w-[200px]">
                  Get Started with Us
                </h2>
                <p className="text-slate-500 dark:text-[#b4b0a9] text-xs max-w-[210px] leading-relaxed">
                  Complete these easy steps to register your account.
                </p>
              </div>

              {/* Active Cordova Area Badge */}
              <div className="flex">
                <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold tracking-wide">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                  <span>CORDOVA AREA NETWORK ACTIVE</span>
                </div>
              </div>

              {/* Stepper Cards */}
              <div className="grid grid-cols-3 gap-3">
                {/* Card 1 */}
                <div className={`p-4 rounded-2xl flex flex-col justify-between min-h-[120px] transition-all duration-300 border ${step === 1
                  ? 'bg-white dark:bg-[#22211e] text-slate-950 dark:text-[#f2efe9] shadow-md border-orange-500/50 dark:border-neutral-800 scale-[1.02]'
                  : 'bg-slate-100/50 dark:bg-[#1c1b18]/40 text-slate-400 dark:text-[#b4b0a9] border-slate-300 dark:border-neutral-800/40 hover:border-slate-400 dark:hover:border-neutral-800/60'
                  }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${step === 1
                    ? `${accentBg} text-white`
                    : 'bg-slate-200 dark:bg-[#2b2a26] text-slate-500 dark:text-[#b4b0a9]'
                    }`}>
                    1
                  </div>
                  <div className="mt-4">
                    <h4 className="font-bold text-[10px] uppercase tracking-wider leading-none text-slate-400 dark:text-[#b4b0a9]">Step 1</h4>
                    <p className="text-xs font-bold mt-1.5 leading-snug">Sign Up</p>
                  </div>
                </div>

                {/* Card 2 */}
                <div className={`p-4 rounded-2xl flex flex-col justify-between min-h-[120px] transition-all duration-300 border ${step === 2
                  ? 'bg-white dark:bg-[#22211e] text-slate-950 dark:text-[#f2efe9] shadow-md border-orange-500/50 dark:border-neutral-800 scale-[1.02]'
                  : 'bg-slate-100/50 dark:bg-[#1c1b18]/40 text-slate-400 dark:text-[#b4b0a9] border-slate-300 dark:border-neutral-800/40 hover:border-slate-400 dark:hover:border-neutral-800/60'
                  }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${step === 2
                    ? `${accentBg} text-white`
                    : 'bg-slate-200 dark:bg-[#2b2a26] text-slate-500 dark:text-[#b4b0a9]'
                    }`}>
                    2
                  </div>
                  <div className="mt-4">
                    <h4 className="font-bold text-[10px] uppercase tracking-wider leading-none text-slate-400 dark:text-[#b4b0a9]">Step 2</h4>
                    <p className="text-xs font-bold mt-1.5 leading-snug">Contact Info</p>
                  </div>
                </div>

                {/* Card 3 */}
                <div className={`p-4 rounded-2xl flex flex-col justify-between min-h-[120px] transition-all duration-300 border ${step === 3
                  ? 'bg-white dark:bg-[#22211e] text-slate-950 dark:text-[#f2efe9] shadow-md border-orange-500/50 dark:border-neutral-800 scale-[1.02]'
                  : 'bg-slate-100/50 dark:bg-[#1c1b18]/40 text-slate-400 dark:text-[#b4b0a9] border-slate-300 dark:border-neutral-800/40 hover:border-slate-400 dark:hover:border-neutral-800/60'
                  }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${step === 3
                    ? `${accentBg} text-white`
                    : 'bg-slate-200 dark:bg-[#2b2a26] text-slate-500 dark:text-[#b4b0a9]'
                    }`}>
                    3
                  </div>
                  <div className="mt-4">
                    <h4 className="font-bold text-[10px] uppercase tracking-wider leading-none text-slate-400 dark:text-[#b4b0a9]">Step 3</h4>
                    <p className="text-xs font-bold mt-1.5 leading-snug">Profile Setup</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-4xl font-extrabold text-slate-900 dark:text-[#f2efe9] leading-tight tracking-tight">
                  Welcome Back!
                </h2>
                <p className="text-slate-500 dark:text-[#b4b0a9] text-sm leading-relaxed max-w-sm">
                  Find or offer local services with verified, trusted Cordova residents. Connect with skilled providers, coordinate jobs in real-time, and manage secure transactions.
                </p>
              </div>

              {/* Active Cordova Area Badge */}
              <div className="flex">
                <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold tracking-wide">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                  <span>CORDOVA AREA NETWORK ACTIVE</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Right Column: Clean Dark Form Panel */}
      <div className="md:w-1/2 p-4 sm:p-8 md:p-10 flex flex-col justify-center bg-[#fbfaf7] dark:bg-[#191919] relative h-full md:h-screen md:overflow-y-auto z-10 text-slate-800 dark:text-[#f2efe9] transition-colors duration-300">

        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-[#f2efe9] tracking-tight">
            {mode === 'signup'
              ? 'Sign Up Account'
              : mode === 'forgot'
                ? 'Forgot Password'
                : mode === 'reset'
                  ? 'Reset Password'
                  : 'Sign In Account'}
          </h3>
          <p className="text-slate-500 dark:text-[#b4b0a9] text-xs mt-1 leading-normal">
            {mode === 'signup'
              ? 'Enter your personal data to create your account.'
              : mode === 'forgot'
                ? 'Enter your email address to receive a secure password reset link.'
                : mode === 'reset'
                  ? 'Choose a new password for your account.'
                  : 'Enter your credentials to access the Cordova local service network.'}
          </p>
        </div>

        {/* Social login buttons (Google Auth) */}
        {(mode === 'login' || (mode === 'signup' && step === 1)) && (
          <>
            <div className="w-full mb-3 flex flex-col items-center">
              {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
                <div id="google-signin-btn" className="w-full flex justify-center min-h-[40px]"></div>
              ) : (
                <button
                  type="button"
                  onClick={() => setError("Google Sign-In is not configured yet. Please define NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment variables.")}
                  className="w-full max-w-[400px] min-h-[40px] flex items-center justify-center space-x-3 px-4 py-2 border border-slate-300 dark:border-neutral-800 rounded-xl bg-white dark:bg-[#22211e] hover:bg-slate-50 dark:hover:bg-[#2b2a26] text-slate-700 dark:text-[#f2efe9] text-xs font-semibold shadow-sm transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.355 0 3.39 2.673 1.482 6.564l3.784 3.201z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.49 12.275c0-.818-.073-1.636-.218-2.433H12v4.613h6.448c-.278 1.472-1.11 2.718-2.355 3.554l3.664 2.84c2.146-1.98 3.382-4.89 3.382-8.574z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.266 14.235A7.172 7.172 0 0 1 4.909 12c0-.78.127-1.536.357-2.235L1.482 6.564A11.954 11.954 0 0 0 0 12c0 1.942.463 3.774 1.282 5.418l3.984-3.183z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.973-1.08 7.964-2.924l-3.664-2.84c-1.018.682-2.318 1.082-4.3 1.082-3.3 0-6.1-2.236-7.1-5.236L1.118 17.265C3.018 21.164 6.982 24 12 24z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              )}
            </div>

            <div className="relative flex py-1 items-center mb-3">
              <div className="flex-grow border-t border-slate-200 dark:border-neutral-800/80"></div>
              <span className="flex-shrink mx-3 text-slate-400 dark:text-[#b4b0a9] text-[10px] font-bold tracking-widest uppercase">Or</span>
              <div className="flex-grow border-t border-slate-200 dark:border-neutral-800/80"></div>
            </div>
          </>
        )}

        {/* Error Message Slot (Height-Stabilized to prevent layout shifting) */}
        <div className="h-8 mb-2 relative flex items-center justify-center flex-shrink-0">
          {error ? (
            <div className="absolute inset-0 p-2 bg-red-950/20 dark:bg-red-950/40 border border-red-200 dark:border-red-900/35 rounded-xl text-red-650 dark:text-red-400 text-xs font-medium flex items-center justify-center animate-in fade-in duration-150">
              {error}
            </div>
          ) : (
            // Spacer wrapper matching the exact same layout height
            <div className="h-full w-full" />
          )}
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-950/20 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/35 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-medium animate-in fade-in duration-150">
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">

          {/* SIGN UP: STEP 1 */}
          {mode === 'signup' && step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-[#b4b0a9] uppercase tracking-wide mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="eg. John"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full bg-white dark:bg-[#22211e] border border-slate-300 dark:border-neutral-800/80 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-[#f2efe9] placeholder-slate-400 dark:placeholder-[#b4b0a9] focus:bg-slate-50/50 dark:focus:bg-[#2b2a26] focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all"
                  />
                  <div className="h-3.5 mt-0.5 flex items-center">
                    {fieldErrors.firstName && (
                      <span className="text-[10px] text-red-500 font-semibold leading-none animate-in fade-in duration-100">{fieldErrors.firstName}</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-[#b4b0a9] uppercase tracking-wide mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="eg. Francisco"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full bg-white dark:bg-[#22211e] border border-slate-300 dark:border-neutral-800/80 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-[#f2efe9] placeholder-slate-400 dark:placeholder-[#b4b0a9] focus:bg-slate-50/50 dark:focus:bg-[#2b2a26] focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all"
                  />
                  <div className="h-3.5 mt-0.5 flex items-center">
                    {fieldErrors.lastName && (
                      <span className="text-[10px] text-red-500 font-semibold leading-none animate-in fade-in duration-100">{fieldErrors.lastName}</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-[#b4b0a9] uppercase tracking-wide mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="eg. johnfrans@gmail.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-white dark:bg-[#22211e] border border-slate-300 dark:border-neutral-800/80 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-[#f2efe9] placeholder-slate-400 dark:placeholder-[#b4b0a9] focus:bg-slate-50/50 dark:focus:bg-[#2b2a26] focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all"
                />
                <div className="h-3.5 mt-0.5 flex items-center">
                  {fieldErrors.email && (
                    <span className="text-[10px] text-red-500 font-semibold leading-none animate-in fade-in duration-100">{fieldErrors.email}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-[#b4b0a9] uppercase tracking-wide mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-white dark:bg-[#22211e] border border-slate-300 dark:border-neutral-800/80 rounded-xl pl-4 pr-10 py-2 text-xs text-slate-900 dark:text-[#f2efe9] placeholder-slate-400 dark:placeholder-[#b4b0a9] focus:bg-slate-50/50 dark:focus:bg-[#2b2a26] focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-[#b4b0a9] hover:text-[#f2efe9]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="h-3.5 mt-0.5 flex items-center">
                  {fieldErrors.password ? (
                    <span className="text-[10px] text-red-500 font-semibold leading-none animate-in fade-in duration-100">{fieldErrors.password}</span>
                  ) : (
                    <span className="text-[10px] text-slate-400 dark:text-[#b4b0a9] leading-none">Must be at least 8 characters.</span>
                  )}
                </div>
              </div>
            </>
          )}

          {/* SIGN UP: STEP 2 (Contact & Location Details) */}
          {mode === 'signup' && step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-[#b4b0a9] uppercase tracking-wide mb-1.5">Contact Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="eg. +63 917 123 4567"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-white dark:bg-[#22211e] border border-slate-300 dark:border-neutral-800/80 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-[#f2efe9] placeholder-slate-400 dark:placeholder-[#b4b0a9] focus:bg-slate-50/50 dark:focus:bg-[#2b2a26] focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all"
                />
                <div className="h-4 mt-1 flex items-center">
                  {fieldErrors.phone && (
                    <span className="text-[10px] text-red-500 font-semibold leading-none animate-in fade-in duration-100">{fieldErrors.phone}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-[#b4b0a9] uppercase tracking-wide mb-1.5">Cordova Barangay / Location</label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full bg-white dark:bg-[#22211e] border border-slate-300 dark:border-neutral-800/80 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-[#f2efe9] focus:bg-slate-50/50 dark:focus:bg-[#2b2a26] focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all"
                >
                  <option value="Poblacion, Cordova">Poblacion (Downtown)</option>
                  <option value="San Miguel, Cordova">San Miguel</option>
                  <option value="Bangbang, Cordova">Bangbang</option>
                  <option value="Gabi, Cordova">Gabi</option>
                  <option value="Ibabao, Cordova">Ibabao</option>
                  <option value="Pilipog, Cordova">Pilipog</option>
                  <option value="Catarman, Cordova">Catarman</option>
                  <option value="Alegria, Cordova">Alegria</option>
                  <option value="Buagsong, Cordova">Buagsong</option>
                  <option value="Dapitan, Cordova">Dapitan</option>
                  <option value="Day-as, Cordova">Day-as</option>
                </select>
                <div className="h-4 mt-1" />
              </div>
            </div>
          )}

          {/* SIGN UP: STEP 3 (Profile details) */}
          {mode === 'signup' && step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-[#b4b0a9] uppercase tracking-wide mb-2">Select Profile Avatar</label>
                <div className="flex items-center space-x-4">
                  <img
                    src={formData.avatarUrl}
                    alt="Selected Profile"
                    className="w-12 h-12 rounded-full object-cover border-2 border-slate-300 dark:border-neutral-700/60 shadow-sm"
                  />
                  <div className="flex space-x-2">
                    {avatars.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAvatarSelect(url)}
                        className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all hover:scale-105 cursor-pointer ${formData.avatarUrl === url ? 'border-orange-500 shadow-sm scale-105' : 'border-slate-300 dark:border-neutral-800 opacity-60'
                          }`}
                      >
                        <img src={url} alt={`Option ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-[#b4b0a9] uppercase tracking-wide mb-1.5">Short Bio</label>
                <textarea
                  name="bio"
                  rows={3}
                  placeholder="Tell the community about yourself..."
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full bg-white dark:bg-[#22211e] border border-slate-300 dark:border-neutral-800/80 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-[#f2efe9] placeholder-slate-400 dark:placeholder-[#b4b0a9] focus:bg-slate-50/50 dark:focus:bg-[#2b2a26] focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 resize-none transition-all"
                />
              </div>
            </div>
          )}

          {/* LOG IN FORM */}
          {mode === 'login' && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-[#b4b0a9] uppercase tracking-wide mb-1.5">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="eg. alexmercer@gmail.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-white dark:bg-[#22211e] border border-slate-300 dark:border-neutral-800/80 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-[#f2efe9] placeholder-slate-400 dark:placeholder-[#b4b0a9] focus:bg-slate-50/50 dark:focus:bg-[#2b2a26] focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all"
                />
                <div className="h-4 mt-1 flex items-center">
                  {fieldErrors.email && (
                    <span className="text-[10px] text-red-500 font-semibold leading-none animate-in fade-in duration-100">{fieldErrors.email}</span>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-[#b4b0a9] uppercase tracking-wide">Password</label>
                  <button
                    type="button"
                    onClick={() => { setError(''); setSuccessMsg(''); setMode('forgot'); }}
                    className={`text-[10px] ${accentText} font-bold hover:underline cursor-pointer`}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-white dark:bg-[#22211e] border border-slate-300 dark:border-neutral-800/80 rounded-xl pl-4 pr-10 py-2.5 text-xs text-slate-900 dark:text-[#f2efe9] placeholder-slate-400 dark:placeholder-[#b4b0a9] focus:bg-slate-50/50 dark:focus:bg-[#2b2a26] focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-[#b4b0a9] hover:text-[#f2efe9] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="h-4 mt-1 flex items-center">
                  {fieldErrors.password && (
                    <span className="text-[10px] text-red-500 font-semibold leading-none animate-in fade-in duration-100">{fieldErrors.password}</span>
                  )}
                </div>
              </div>
            </>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-[#b4b0a9] uppercase tracking-wide mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                placeholder="eg. alexmercer@gmail.com"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-white dark:bg-[#22211e] border border-slate-300 dark:border-neutral-800/80 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-[#f2efe9] placeholder-slate-400 dark:placeholder-[#b4b0a9] focus:bg-slate-50/50 dark:focus:bg-[#2b2a26] focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all"
              />
              <div className="h-4 mt-1 flex items-center">
                {fieldErrors.email && (
                  <span className="text-[10px] text-red-500 font-semibold leading-none animate-in fade-in duration-100">{fieldErrors.email}</span>
                )}
              </div>
            </div>
          )}

          {/* RESET PASSWORD FORM */}
          {mode === 'reset' && (
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-[#b4b0a9] uppercase tracking-wide mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your new password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-white dark:bg-[#22211e] border border-slate-300 dark:border-neutral-800/80 rounded-xl pl-4 pr-10 py-2.5 text-xs text-slate-900 dark:text-[#f2efe9] placeholder-slate-400 dark:placeholder-[#b4b0a9] focus:bg-slate-50/50 dark:focus:bg-[#2b2a26] focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-[#b4b0a9] hover:text-[#f2efe9] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="h-4 mt-1 flex items-center">
                {fieldErrors.password && (
                  <span className="text-[10px] text-red-500 font-semibold leading-none animate-in fade-in duration-100">{fieldErrors.password}</span>
                )}
              </div>
            </div>
          )}

          {/* Submit buttons */}
          <div className="pt-2 flex space-x-3">
            {mode === 'signup' && step > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="w-1/3 flex items-center justify-center space-x-2 border border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-[#22211e] text-slate-500 dark:text-[#b4b0a9] rounded-xl py-2.5 text-xs font-bold transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              type="submit"
              onClick={mode === 'signup' && step < 3 ? (e) => { e.preventDefault(); handleNextStep(); } : undefined}
              className={`flex-grow ${accentBg} hover:opacity-95 text-white font-extrabold rounded-xl py-3 text-xs tracking-wider transition-all active:scale-[0.98] shadow-sm cursor-pointer`}
            >
              {mode === 'login'
                ? 'Sign In'
                : mode === 'forgot'
                  ? 'Send Reset Link'
                  : mode === 'reset'
                    ? 'Reset Password'
                    : step === 3
                      ? 'Sign Up'
                      : 'Next Step'}
            </button>
          </div>
        </form>

        {/* Form Switcher Footer */}
        <div className="mt-8 text-center text-xs">
          {mode === 'forgot' || mode === 'reset' ? (
            <button
              type="button"
              onClick={() => { setError(''); setSuccessMsg(''); setMode('login'); }}
              className={`font-bold ${accentText} hover:underline cursor-pointer`}
            >
              Back to Log in
            </button>
          ) : (
            <>
              <span className="text-slate-550 dark:text-[#b4b0a9] font-medium">
                {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
              </span>
              <button
                type="button"
                onClick={toggleMode}
                className={`font-bold ${accentText} hover:underline ml-1 cursor-pointer`}
              >
                {mode === 'signup' ? 'Log in' : 'Register here'}
              </button>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
