import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import useAuthForm from '../../schema/auth/useAuthForm';
import AuthLeftPanel from './AuthLeftPanel';
import LoginForm from './LoginForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import ResetPasswordForm from './ResetPasswordForm';
import { useApp } from '../../context/AppContext';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';

export interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'seeker' | 'provider' | 'admin';
  avatarUrl: string;
  bio: string;
  phone: string;
  location?: string;
  trustScore?: number;
  verificationStatus?: string;
  emailVerified?: boolean;
  onboardingStatus?: 'PENDING' | 'COMPLETED' | 'SKIPPED';
  isActive?: boolean;
}

interface LoginContainerProps {
  onLoginSuccess: (userData: UserSession) => void;
  onBackToHome?: () => void;
}

export default function LoginContainer({
  onLoginSuccess,
  onBackToHome,
}: LoginContainerProps) {
  const { isDark, toggleTheme } = useApp();
  const router = useRouter();
  const [theme] = useState<'orange'>('orange');
  const [initialResetToken] = useState(() => typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('resetToken') || '');
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>(() => initialResetToken ? 'reset' : 'login');

  const {
    formData,
    step,
    showPassword,
    setShowPassword,
    error,
    setError,
    successMsg,
    fieldErrors,
    register,
    handleGoogleSuccessResponse,
    handleSubmit,
    isLoading,
  } = useAuthForm({
    onLoginSuccess,
    mode,
    setMode,
    initialResetToken,
  });

  const toggleMode = () => {
    router.push('/register');
  };

  const accentText = 'text-[#c86544] dark:text-orange-400';
  const accentBg = 'bg-[#c86544] hover:bg-[#aa5032]';

  return (
    <AuthLayout theme={theme}>
      {/* Left Panel: Redesigned Branding/Intro Visuals */}
      <AuthLeftPanel
        mode={mode}
        step={step}
        accentBg={accentBg}
        onBackToHome={onBackToHome}
      />

      {/* Right Panel: Height-stabilized Forms Column */}
      <main className="w-full lg:w-[54%] min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 xl:p-12 relative z-10 overflow-y-auto bg-[#f5f4f2] dark:bg-[#121211] transition-colors duration-300">
        
        {/* Mobile-Only Header Bar */}
        <div className="lg:hidden flex items-center justify-between w-full max-w-md mb-4 px-1">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg?v=3"
              alt="ServiceHub Logo"
              width={26}
              height={26}
              className="size-6.5 rounded-lg"
            />
            <span className="text-xs font-semibold tracking-tight text-[#0a0a0a] dark:text-white">
              ServiceHub
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              className="ml-1 grid size-9 place-items-center rounded-xl border border-black/[0.08] bg-white text-slate-600 transition-colors hover:text-slate-950 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-white"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        {/* Floating Card Container */}
        <div className="w-full max-w-md rounded-3xl border border-black/[0.06] bg-white p-6 sm:p-8 shadow-[0_12px_36px_-12px_rgba(15,15,15,0.08)] dark:border-white/10 dark:bg-[#181716] transition-all">
          
          {/* Error Message Banner */}
          {error && (
            <div role="alert" className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-medium animate-in fade-in duration-150">
              {error}
            </div>
          )}

          {/* Success Message Banner */}
          {successMsg && (
            <div role="status" className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-medium animate-in fade-in duration-150">
              {successMsg}
            </div>
          )}

          {/* Dynamic Form Render based on Active mode */}
          {mode === 'login' && (
            <LoginForm
              formData={formData}
              fieldErrors={fieldErrors}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              handleGoogleSuccessResponse={handleGoogleSuccessResponse}
              setError={setError}
              handleSubmit={handleSubmit}
              isDark={isDark}
              accentText={accentText}
              setMode={setMode}
              toggleMode={toggleMode}
              register={register}
              isLoading={isLoading}
            />
          )}

          {mode === 'forgot' && (
            <ForgotPasswordForm
              formData={formData}
              fieldErrors={fieldErrors}
              handleSubmit={handleSubmit}
              accentText={accentText}
              accentBg={accentBg}
              setMode={setMode}
              register={register}
            />
          )}

          {mode === 'reset' && (
            <ResetPasswordForm
              formData={formData}
              fieldErrors={fieldErrors}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              handleSubmit={handleSubmit}
              accentText={accentText}
              accentBg={accentBg}
              setMode={setMode}
              register={register}
            />
          )}
        </div>
      </main>
    </AuthLayout>
  );
}
