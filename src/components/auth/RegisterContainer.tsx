import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
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

      {/* Right Panel: Scrollable Column */}
      <div className="w-full md:w-1/2 min-h-screen flex flex-col items-center justify-start py-8 px-4 sm:px-6 md:px-8 lg:px-10 overflow-y-auto bg-[#f5f4f2] dark:bg-[#121211] relative z-10 transition-colors duration-300">
        
        {/* Mobile Header Bar */}
        <div className="md:hidden flex items-center justify-between w-full max-w-xl mb-4 px-1">
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
          </div>
        </div>

        {/* Floating Card Container */}
        <div className="w-full max-w-xl my-auto rounded-3xl border border-black/[0.06] bg-white p-6 sm:p-8 md:p-9 shadow-[0_12px_36px_-12px_rgba(15,15,15,0.08)] dark:border-white/10 dark:bg-[#181716] transition-all">
          
          {/* Error Message Banner */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-medium animate-in fade-in duration-150">
              {error}
            </div>
          )}

          {/* Success Message Banner */}
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-medium animate-in fade-in duration-150">
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
      </div>
    </AuthLayout>
  );
}
