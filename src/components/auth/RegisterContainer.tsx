import React, { useState } from 'react';
import useAuthForm from './useAuthForm';
import AuthLayout from './AuthLayout';
import AuthLeftPanel from './AuthLeftPanel';
import SignupForm from './SignupForm';
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
  const [mode, setMode] = useState<'signup'>('signup');

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

        {/* Signup Form Render */}
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

      </div>
    </AuthLayout>
  );
}
