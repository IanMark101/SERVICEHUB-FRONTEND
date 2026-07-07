import React, { useState } from 'react';
import useAuthForm from './useAuthForm';
import AuthLayout from './AuthLayout';
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
    register,
    handleAvatarSelect,
    handlePrevStep,
    handleNextStep,
    handleGoogleSuccessResponse,
    handleSubmit,
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
      <div className="w-full md:w-1/2 h-screen overflow-y-auto bg-[#fbfaf7] dark:bg-[#191919] relative z-10 text-slate-800 dark:text-[#f2efe9] transition-colors duration-300">
        <div className="w-full max-w-2xl mx-auto py-10 px-4 sm:px-6 md:px-8 flex flex-col justify-start min-h-full">
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
            />
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
