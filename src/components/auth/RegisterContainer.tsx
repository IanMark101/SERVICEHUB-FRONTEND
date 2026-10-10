import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import useAuthForm from '../../schema/auth/useAuthForm';
import { AuthLayout } from '@/components/auth/AuthLayout';
import AuthLeftPanel from './AuthLeftPanel';
import SignupForm from './SignupForm';
import RegistrationSuccess from './RegistrationSuccess';
import { useApp } from '../../context/AppContext';
import { useRouter } from 'next/navigation';
import { UserSession } from './LoginContainer';

interface RegisterContainerProps {
  onLoginSuccess: (userData: UserSession) => void;
  onBackToHome?: () => void;
}

export default function RegisterContainer({
  onLoginSuccess,
  onBackToHome,
}: RegisterContainerProps) {
  const { isDark, toggleTheme } = useApp();
  const router = useRouter();
  const [theme] = useState<'orange'>('orange');
  const [mode] = useState<'signup'>('signup');

  const {
    captcha,
    formData,
    step,
    showPassword,
    setShowPassword,
    error,
    setError,
    successMsg,
    fieldErrors,
    isRegisterSuccess,
    registrationEmailSent,
    register,
    handleAvatarSelect,
    handlePrevStep,
    handleNextStep,
    handleGoogleSuccessResponse,
    handleSubmit,
    isLoading,
    setValue,
  } = useAuthForm({
    onLoginSuccess,
    mode,
    setMode: (m) => {
      if (m === 'login') {
        router.push('/login');
      }
    },
    initialResetToken: '',
  });

  const toggleMode = () => {
    router.push('/login');
  };

  const accentText = 'text-brand-text dark:text-orange-400';
  const accentBg = 'bg-brand-action hover:bg-brand-action-hover';

  return (
    <AuthLayout theme={theme}>
      {/* Left Panel: Redesigned Branding/Intro Visuals */}
      <AuthLeftPanel
        mode={mode}
        step={step}
        accentBg={accentBg}
        onBackToHome={onBackToHome}
      />

      {/* Right Panel: the panel itself is the registration surface */}
      <main className="auth-form-panel relative z-10 min-h-[100dvh] w-full border-black/[0.06] bg-[#fffdfa] transition-colors duration-300 dark:border-white/10 dark:bg-charcoal lg:w-1/2 lg:border-l">
        <div className="auth-form-panel__inner mx-auto flex min-h-[100dvh] w-full max-w-4xl flex-col px-5 py-5 sm:px-8 sm:py-7 lg:px-14 xl:px-20">
        {/* Mobile Header Bar */}
        <div className="mb-8 flex w-full items-center justify-between lg:hidden">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted dark:text-ink-secondary hover:text-ink dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg?v=7"
              alt="ServiceHub Logo"
              width={26}
              height={26}
              className="size-6.5 rounded-lg"
            />
            <span className="text-xs font-semibold tracking-tight text-ink dark:text-white">
              ServiceHub
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              className="ml-1 grid size-9 place-items-center rounded-xl border border-black/[0.08] bg-white text-ink-muted transition-colors hover:text-ink dark:border-white/10 dark:bg-charcoal dark:text-ink-secondary dark:hover:text-white"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        <div className="auth-form-panel__content mx-auto w-full max-w-[38rem] py-6 lg:py-9">
          
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

          {/* Signup Form Render */}
          {isRegisterSuccess ? (
            <RegistrationSuccess
              email={formData.email}
              emailSent={registrationEmailSent}
              onGoToLogin={toggleMode}
            />
          ) : (
            <SignupForm
              captcha={captcha}
              step={step}
              formData={formData}
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
              register={register}
              setValue={setValue}
              isLoading={isLoading}
            />
          )}
        </div>
        </div>
      </main>
    </AuthLayout>
  );
}
