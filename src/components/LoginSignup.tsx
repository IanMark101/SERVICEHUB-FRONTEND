import React, { useState, useEffect } from 'react';
import useAuthForm from './auth/useAuthForm';
import AuthLayout from './auth/AuthLayout';
import AuthLeftPanel from './auth/AuthLeftPanel';
import LoginForm from './auth/LoginForm';
import SignupForm from './auth/SignupForm';
import ForgotPasswordForm from './auth/ForgotPasswordForm';
import ResetPasswordForm from './auth/ResetPasswordForm';
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
  initialMode?: 'login' | 'signup';
  onLoginSuccess: (userData: UserSession) => void;
  onBackToHome?: () => void;
}

export default function LoginSignup({
  initialMode,
  onLoginSuccess,
  onBackToHome,
}: LoginSignupProps) {
  const { isDark } = useApp();
  const [theme, setTheme] = useState<'green' | 'orange'>('orange');
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>(
    initialMode || 'login'
  );
  const [initialResetToken, setInitialResetToken] = useState<string>('');

  // Sync mode if initialMode prop changes
  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

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
    handleInputChange,
    handleAvatarSelect,
    handlePrevStep,
    handleNextStep,
    handleGoogleSuccessResponse,
    handleSubmit,
  } = useAuthForm({
    onLoginSuccess,
    mode,
    setMode,
    initialResetToken,
  });

  const toggleMode = () => {
    setError('');
    if (mode === 'login') {
      setMode('signup');
    } else {
      setMode('login');
    }
  };

  const isGreen = theme === 'green';
  const accentText = isGreen ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-500';
  const accentBg = isGreen ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-orange-600 hover:bg-orange-500';

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
            <div className="absolute inset-0 p-2 bg-red-950/20 dark:bg-red-950/40 border border-red-200 dark:border-red-900/35 rounded-xl text-red-650 dark:text-red-400 text-xs font-medium flex items-center justify-center animate-in fade-in duration-150">
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
            handleInputChange={handleInputChange}
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
          />
        )}

        {mode === 'signup' && (
          <SignupForm
            step={step}
            formData={formData}
            handleInputChange={handleInputChange}
            fieldErrors={fieldErrors}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            handleGoogleSuccessResponse={handleGoogleSuccessResponse}
            setError={setError}
            handleSubmit={handleSubmit}
            handleAvatarSelect={handleAvatarSelect}
            handlePrevStep={handlePrevStep}
            handleNextStep={handleNextStep}
            isDark={isDark}
            accentText={accentText}
            accentBg={accentBg}
            toggleMode={toggleMode}
          />
        )}

        {mode === 'forgot' && (
          <ForgotPasswordForm
            formData={formData}
            handleInputChange={handleInputChange}
            fieldErrors={fieldErrors}
            handleSubmit={handleSubmit}
            accentText={accentText}
            accentBg={accentBg}
            setMode={setMode}
          />
        )}

        {mode === 'reset' && (
          <ResetPasswordForm
            formData={formData}
            handleInputChange={handleInputChange}
            fieldErrors={fieldErrors}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            handleSubmit={handleSubmit}
            accentText={accentText}
            accentBg={accentBg}
            setMode={setMode}
          />
        )}

      </div>
    </AuthLayout>
  );
}
