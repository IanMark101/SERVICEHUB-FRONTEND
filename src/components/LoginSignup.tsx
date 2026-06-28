import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Sun,
  Moon
} from 'lucide-react';
import { apiLogin, apiRegister, apiForgotPassword, apiResetPassword } from '../api/auth.api';
import { useApp } from '../context/AppContext';

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
  onLoginSuccess: (userData: UserSession) => void;
  onBackToHome?: () => void;
}

export default function LoginSignup({ onLoginSuccess, onBackToHome }: LoginSignupProps) {
  // Bind to App Context for global theme toggling
  const { isDark, toggleTheme } = useApp();

  // Theme state: 'green' (Emerald) or 'orange' (Amber/Orange) - default to orange
  const [theme, setTheme] = useState<'green' | 'orange'>('orange');

  // View mode: 'login' | 'signup' | 'forgot' | 'reset'
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');

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
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

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

  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', // Woman 1
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', // Man 1
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200', // Woman 2
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', // Man 2
  ];

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleRoleSelect = (role: 'seeker' | 'provider') => {
    setFormData(prev => ({ ...prev, role }));
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    setFormData(prev => ({ ...prev, avatarUrl }));
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        setError('Please fill in all account fields');
        return;
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
    }
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
      if (!formData.email) {
        setError('Please enter your email address');
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
      if (!formData.password) {
        setError('Please enter a new password');
        return;
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long');
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
      if (!formData.email || !formData.password) {
        setError('Please fill in email and password');
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
        location: 'Cordova, Cebu',
        bio: formData.bio,
        avatarUrl: formData.avatarUrl,
      })
        .then((res) => {
          if (res.success) {
            const user = res.data.user;
            localStorage.setItem('accessToken', res.data.accessToken);
            onLoginSuccess({
              id: user.id,
              email: user.email,
              firstName: formData.firstName,
              lastName: formData.lastName,
              role: formData.role,
              avatarUrl: user.avatarUrl || formData.avatarUrl,
              bio: user.bio || formData.bio,
              phone: user.phone,
              trustScore: user.trustScore,
              verificationStatus: user.verificationStatus,
              emailVerified: user.emailVerified,
            });
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
    setMode(prev => prev === 'login' ? 'signup' : 'login');
    setStep(1);
  };

  const isGreen = theme === 'green';
  const accentText = isGreen ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-500';
  const accentBg = isGreen ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-orange-600 hover:bg-orange-500';

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#fbfaf7] dark:bg-[#191919] relative overflow-hidden font-sans select-none text-slate-800 dark:text-[#f2efe9] transition-colors duration-300">

      {/* Decorative Blur Backgrounds - Pastel glows matching theme */}
      <div className={`absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-15 dark:opacity-20 blur-3xl transition-all duration-700 ${isGreen ? 'bg-emerald-500/10 dark:bg-emerald-900/35' : 'bg-orange-500/10 dark:bg-orange-900/35'} pointer-events-none`} />
      <div className={`absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-15 dark:opacity-20 blur-3xl transition-all duration-700 ${isGreen ? 'bg-emerald-500/10 dark:bg-emerald-900/35' : 'bg-orange-500/10 dark:bg-orange-900/35'} pointer-events-none`} style={{ animationDelay: '-5s' }} />

      {/* Left Column: Brand & Horizontal Stepper Indicator */}
      <div className="md:w-1/2 bg-slate-50/50 dark:bg-[#22211e]/40 p-8 sm:p-12 md:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 dark:border-neutral-800/80 relative overflow-hidden min-h-[40vh] md:min-h-screen transition-colors duration-300">

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
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-[#f2efe9]">ServiceHub</span>
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

          {/* Horizontal Header Row: Title on Left, Desc on Right */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-neutral-800/80 pb-4">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-[#f2efe9] leading-tight tracking-tight max-w-[200px]">
              Get Started with Us
            </h2>
            <p className="text-slate-500 dark:text-[#b4b0a9] text-xs max-w-[210px] leading-relaxed">
              Complete these easy steps to register your account.
            </p>
          </div>

          {/* Stepper Cards */}
          <div className="grid grid-cols-3 gap-3">
            {/* Card 1 */}
            <div className={`p-4 rounded-2xl flex flex-col justify-between min-h-[120px] transition-all duration-300 border ${mode === 'signup' && step === 1
                ? 'bg-white dark:bg-[#22211e] text-slate-950 dark:text-[#f2efe9] shadow-md border-orange-500/50 dark:border-neutral-800 scale-[1.02]'
                : 'bg-slate-100/50 dark:bg-[#1c1b18]/40 text-slate-400 dark:text-[#b4b0a9] border-slate-300 dark:border-neutral-800/40 hover:border-slate-400 dark:hover:border-neutral-800/60'
              }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${mode === 'signup' && step === 1
                  ? `${accentBg} text-white`
                  : 'bg-slate-200 dark:bg-[#2b2a26] text-slate-500 dark:text-[#b4b0a9]'
                }`}>
                1
              </div>
              <div className="mt-4">
                <h4 className="font-bold text-[10px] uppercase tracking-wider leading-none text-slate-400 dark:text-[#b4b0a9]">Step 1</h4>
                <p className="text-xs font-bold mt-1.5 leading-snug">Sign up account</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className={`p-4 rounded-2xl flex flex-col justify-between min-h-[120px] transition-all duration-300 border ${mode === 'signup' && step === 2
                ? 'bg-white dark:bg-[#22211e] text-slate-950 dark:text-[#f2efe9] shadow-md border-orange-500/50 dark:border-neutral-800 scale-[1.02]'
                : 'bg-slate-100/50 dark:bg-[#1c1b18]/40 text-slate-400 dark:text-[#b4b0a9] border-slate-300 dark:border-neutral-800/40 hover:border-slate-400 dark:hover:border-neutral-800/60'
              }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${mode === 'signup' && step === 2
                  ? `${accentBg} text-white`
                  : 'bg-slate-200 dark:bg-[#2b2a26] text-slate-500 dark:text-[#b4b0a9]'
                }`}>
                2
              </div>
              <div className="mt-4">
                <h4 className="font-bold text-[10px] uppercase tracking-wider leading-none text-slate-400 dark:text-[#b4b0a9]">Step 2</h4>
                <p className="text-xs font-bold mt-1.5 leading-snug">Set workspace</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className={`p-4 rounded-2xl flex flex-col justify-between min-h-[120px] transition-all duration-300 border ${mode === 'signup' && step === 3
                ? 'bg-white dark:bg-[#22211e] text-slate-950 dark:text-[#f2efe9] shadow-md border-orange-500/50 dark:border-neutral-800 scale-[1.02]'
                : 'bg-slate-100/50 dark:bg-[#1c1b18]/40 text-slate-400 dark:text-[#b4b0a9] border-slate-300 dark:border-neutral-800/40 hover:border-slate-400 dark:hover:border-neutral-800/60'
              }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${mode === 'signup' && step === 3
                  ? `${accentBg} text-white`
                  : 'bg-slate-200 dark:bg-[#2b2a26] text-slate-500 dark:text-[#b4b0a9]'
                }`}>
                3
              </div>
              <div className="mt-4">
                <h4 className="font-bold text-[10px] uppercase tracking-wider leading-none text-slate-400 dark:text-[#b4b0a9]">Step 3</h4>
                <p className="text-xs font-bold mt-1.5 leading-snug">Set profile</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Right Column: Clean Dark Form Panel */}
      <div className="md:w-1/2 p-8 sm:p-12 md:p-16 flex flex-col justify-center bg-[#fbfaf7] dark:bg-[#191919] relative min-h-[60vh] md:min-h-screen z-10 text-slate-800 dark:text-[#f2efe9] transition-colors duration-300">

        {/* Header */}
        <div className="mb-6">
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
                  : 'Enter your credentials to access your workspace.'}
          </p>
        </div>

        {/* Social login buttons */}
        {(mode === 'login' || (mode === 'signup' && step === 1)) && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                className="flex items-center justify-center space-x-2 bg-white dark:bg-[#22211e] hover:bg-slate-50 dark:hover:bg-[#2c2b27] border border-slate-300 dark:border-neutral-800/80 text-slate-700 dark:text-[#f2efe9] rounded-xl py-2.5 px-4 text-xs font-bold tracking-wide transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                <svg className="w-4 h-4 mr-1.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                <span>Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center space-x-2 bg-white dark:bg-[#22211e] hover:bg-slate-50 dark:hover:bg-[#2c2b27] border border-slate-300 dark:border-neutral-800/80 text-slate-700 dark:text-[#f2efe9] rounded-xl py-2.5 px-4 text-xs font-bold tracking-wide transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                <svg className="w-4 h-4 mr-1.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
                <span>GitHub</span>
              </button>
            </div>

            <div className="relative flex py-1 items-center mb-5">
              <div className="flex-grow border-t border-slate-200 dark:border-neutral-800/80"></div>
              <span className="flex-shrink mx-3 text-slate-400 dark:text-[#b4b0a9] text-[10px] font-bold tracking-widest uppercase">Or</span>
              <div className="flex-grow border-t border-slate-200 dark:border-neutral-800/80"></div>
            </div>
          </>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-950/20 dark:bg-red-950/40 border border-red-200 dark:border-red-900/35 rounded-xl text-red-650 dark:text-red-400 text-xs font-medium animate-in fade-in duration-150">
            {error}
          </div>
        )}

        {/* Success Message */}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-950/20 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/35 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-medium animate-in fade-in duration-150">
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* SIGN UP: STEP 1 */}
          {mode === 'signup' && step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-[#b4b0a9] uppercase tracking-wide mb-1.5">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="eg. John"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full bg-white dark:bg-[#22211e] border border-slate-300 dark:border-neutral-800/80 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-[#f2efe9] placeholder-slate-400 dark:placeholder-[#b4b0a9] focus:bg-slate-50/50 dark:focus:bg-[#2b2a26] focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-[#b4b0a9] uppercase tracking-wide mb-1.5">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="eg. Francisco"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full bg-white dark:bg-[#22211e] border border-slate-300 dark:border-neutral-800/80 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-[#f2efe9] placeholder-slate-400 dark:placeholder-[#b4b0a9] focus:bg-slate-50/50 dark:focus:bg-[#2b2a26] focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-[#b4b0a9] uppercase tracking-wide mb-1.5">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="eg. johnfrans@gmail.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-white dark:bg-[#22211e] border border-slate-300 dark:border-neutral-800/80 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-[#f2efe9] placeholder-slate-400 dark:placeholder-[#b4b0a9] focus:bg-slate-50/50 dark:focus:bg-[#2b2a26] focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-[#b4b0a9] uppercase tracking-wide mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-white dark:bg-[#22211e] border border-slate-300 dark:border-neutral-800/80 rounded-xl pl-4 pr-10 py-2.5 text-xs text-slate-900 dark:text-[#f2efe9] placeholder-slate-400 dark:placeholder-[#b4b0a9] focus:bg-slate-50/50 dark:focus:bg-[#2b2a26] focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-[#b4b0a9] hover:text-[#f2efe9]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="block text-[10px] text-slate-400 dark:text-[#b4b0a9] mt-1.5">Must be at least 8 characters.</span>
              </div>
            </>
          )}

          {/* SIGN UP: STEP 2 (Workspace selection - Only seeker and provider, NO admin) */}
          {mode === 'signup' && step === 2 && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800 dark:text-[#f2efe9] uppercase tracking-wide">
                Select your workspace
              </label>
              <div className="space-y-2.5">
                <div
                  onClick={() => handleRoleSelect('seeker')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col ${formData.role === 'seeker'
                      ? 'border-orange-500 bg-orange-50/30 dark:bg-orange-950/20'
                      : 'border-slate-300 dark:border-neutral-800 bg-white dark:bg-[#22211e] hover:bg-slate-50 dark:hover:bg-[#2c2b27]'
                    }`}
                >
                  <span className={`font-bold text-xs ${formData.role === 'seeker' ? 'text-orange-600 dark:text-orange-400' : 'text-slate-800 dark:text-[#f2efe9]'}`}>Seeker Workspace</span>
                  <p className="text-[10px] text-slate-500 dark:text-[#b4b0a9] mt-1">Hire service providers and track jobs.</p>
                </div>

                <div
                  onClick={() => handleRoleSelect('provider')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col ${formData.role === 'provider'
                      ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : 'border-slate-300 dark:border-neutral-800 bg-white dark:bg-[#22211e] hover:bg-slate-50 dark:hover:bg-[#2c2b27]'
                    }`}
                >
                  <span className={`font-bold text-xs ${formData.role === 'provider' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-[#f2efe9]'}`}>Provider Workspace</span>
                  <p className="text-[10px] text-slate-500 dark:text-[#b4b0a9] mt-1">Offer freelance services and accept bookings.</p>
                </div>
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
                <label className="block text-[10px] font-bold text-slate-500 dark:text-[#b4b0a9] uppercase tracking-wide mb-1.5">Contact Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="eg. +63 917 123 4567"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-white dark:bg-[#22211e] border border-slate-300 dark:border-neutral-800/80 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-[#f2efe9] placeholder-slate-400 dark:placeholder-[#b4b0a9] focus:bg-slate-50/50 dark:focus:bg-[#2b2a26] focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all"
                />
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
                  required
                />
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
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-[#b4b0a9] hover:text-[#f2efe9] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
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
                required
              />
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
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-[#b4b0a9] hover:text-[#f2efe9] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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
