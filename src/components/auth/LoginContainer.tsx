import React, { useState, useEffect } from 'react';
import useAuthForm from '../../schema/auth/useAuthForm';
import AuthLeftPanel from './AuthLeftPanel';
import LoginForm from './LoginForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import ResetPasswordForm from './ResetPasswordForm';
import { useApp } from '../../context/AppContext';
import { useRouter } from 'next/navigation';
import { AuthLayout } from "@/components/auth/AuthLayout"

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
  const { isDark } = useApp();
  const router = useRouter();
  const [theme] = useState<'orange'>('orange');
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');
  const [initialResetToken, setInitialResetToken] = useState<string>('');

  // Read resetToken from query params if any
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('resetToken');
      if (token) {
        setInitialResetToken(token);
        setMode('reset');
      }
    }
  }, []);

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
  } = useAuthForm({
    onLoginSuccess,
    mode,
    setMode,
    initialResetToken,
  });

  const toggleMode = () => {
    router.push('/register');
  };

  const accentText = 'text-orange-600 dark:text-orange-500';
  const accentBg = 'bg-orange-600 hover:bg-orange-500';

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
      <div className="md:w-1/2 p-4 sm:p-8 md:p-10 flex flex-col justify-center bg-[#fbfaf7] dark:bg-[#191919] relative h-full md:h-screen md:overflow-y-auto z-10 text-slate-800 dark:text-[#f2efe9] transition-colors duration-300">
        
        {/* Error Message Banner Slot */}
        <div className="h-8 mb-2 relative flex items-center justify-center flex-shrink-0">
          {error ? (
            <div className="absolute inset-0 p-2 bg-red-950/20 dark:bg-red-950/40 border border-red-200 dark:border-red-900/35 rounded-xl text-red-655 dark:text-red-400 text-xs font-medium flex items-center justify-center animate-in fade-in duration-150">
              {error}
            </div>
          ) : (
            <div className="h-full w-full" />
          )}
        </div>

        {/* Success Message Banner Slot */}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-950/20 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/35 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-medium animate-in fade-in duration-150">
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
    </AuthLayout>
  );
}
