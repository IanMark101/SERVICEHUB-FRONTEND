import React, { useState } from 'react';
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
  const { isDark } = useApp();
  const router = useRouter();
  const [theme] = useState<'orange'>('orange');
  const [mode] = useState<'signup'>('signup');

  const {
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

      {/* Right Panel: Independently Scrollable Column */}
      <section className="relative z-10 min-h-[100dvh] min-w-0 overflow-y-auto bg-[#fbfaf7] text-slate-800 transition-colors dark:bg-[#171715] dark:text-[#f2efe9]">
        <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-start px-5 py-8 sm:px-8 md:py-10 lg:px-10">
          {/* Error Message Banner Slot */}
          {error && (
            <div className="mb-4 p-2.5 bg-red-950/20 dark:bg-red-950/40 border border-red-200 dark:border-red-900/35 rounded-xl text-red-655 dark:text-red-400 text-xs font-semibold text-center animate-in fade-in duration-150 flex-shrink-0">
              {error}
            </div>
          )}

          {/* Success Message Banner Slot */}
          {successMsg && (
            <div className="mb-4 p-2.5 bg-emerald-950/20 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/35 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold text-center animate-in fade-in duration-150 flex-shrink-0">
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
      </section>
    </AuthLayout>
  );
}
