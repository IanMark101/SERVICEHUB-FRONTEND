import React, { useRef, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import GoogleSignInButton from './shared/GoogleSignInButton';
import { uploadAvatarToCloudinary } from '../../lib/imageUtils';
import SignupSteps from './signup/SignupSteps';
import type { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import type { AuthFormValues } from '../../schema/auth/useAuthForm';

interface SignupFormProps {
  step: number;
  formData: AuthFormValues;
  fieldErrors: Record<string, string>;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  handleGoogleSuccessResponse: (token: string) => void;
  setError: (msg: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleAvatarSelect: (url: string) => void;
  handlePrevStep: () => void;
  handleNextStep: () => void;
  isDark: boolean;
  accentText: string;
  accentBg: string;
  toggleMode: () => void;
  register: UseFormRegister<AuthFormValues>;
  setValue: UseFormSetValue<AuthFormValues>;
  isLoading?: boolean;
}

export default function SignupForm({
  step,
  formData,
  fieldErrors,
  showPassword,
  setShowPassword,
  handleGoogleSuccessResponse,
  setError,
  handleSubmit,
  handleAvatarSelect,
  handlePrevStep,
  handleNextStep,
  isDark,
  accentText,
  accentBg,
  toggleMode,
  register,
  setValue,
  isLoading = false,
}: SignupFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const cdnUrl = await uploadAvatarToCloudinary(file);
      handleAvatarSelect(cdnUrl);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Failed to process and upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Helper to format Philippine Phone Numbers: auto-formats digits to '9XX XXX XXXX'
  const formatPhoneNumber = (raw: string) => {
    let digits = raw.replace(/\D/g, '');
    if (digits.startsWith('63')) digits = digits.slice(2);
    if (digits.startsWith('0')) digits = digits.slice(1);
    digits = digits.slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  };

  // Compute per-step validity for button state
  const isStep1Valid =
    formData.firstName?.trim().length > 0 &&
    formData.lastName?.trim().length > 0 &&
    formData.email?.includes('@') &&
    formData.password?.length >= 8 &&
    /[A-Z]/.test(formData.password) &&
    /\d/.test(formData.password) &&
    formData.confirmPassword === formData.password &&
    formData.agreeTerms === true;

  const isPhoneValid = (formData.phone?.replace(/\D/g, '') || '').length === 10;
  const isStep2Valid = isPhoneValid && (formData.location?.trim().length > 0);

  const isNextDisabled = (step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid);

  return (
    <div className="space-y-6">
      
      {/* Top Eyebrow & Stepper */}
      <div className="w-full space-y-3">
        <div className="w-full flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
            Resident registration
          </span>
          <span className="text-xs font-semibold text-[#c86544] dark:text-orange-400">
            Step {step} of 3
          </span>
        </div>

        {/* Compact segmented progress */}
        <ol className="grid w-full grid-cols-3 border-y border-black/[0.08] dark:border-white/10">
          {[
            { s: 1, title: 'Credentials', desc: 'Login details' },
            { s: 2, title: 'Contact', desc: 'Phone & location' },
            { s: 3, title: 'Profile', desc: 'Avatar & bio' }
          ].map((item) => {
            const isActive = step === item.s;
            const isCompleted = step > item.s;
            return (
              <li
                key={item.s}
                aria-current={isActive ? 'step' : undefined}
                className={`relative min-w-0 px-3 py-3 transition-colors first:pl-0 last:pr-0 ${item.s > 1 ? 'border-l border-black/[0.06] dark:border-white/10' : ''} ${
                  isActive
                    ? 'text-[#c86544] dark:text-orange-300'
                    : isCompleted
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-neutral-400 dark:text-neutral-500'
                }`}
              >
                {isActive && <span className="absolute inset-x-3 -bottom-px h-0.5 bg-[#c86544] first:left-0 dark:bg-orange-400" />}
                <span className="text-[10px] font-semibold tracking-[0.14em]">
                  {isCompleted ? 'DONE' : `0${item.s}`}
                </span>
                <p className="mt-1 text-xs font-semibold leading-tight text-[#0a0a0a] dark:text-white">
                  {item.title}
                </p>
                <p className="mt-0.5 hidden text-[10px] leading-tight text-neutral-500 dark:text-neutral-400 sm:block">
                  {item.desc}
                </p>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Header Info */}
      <div>
        <h2 className="font-sans text-3xl font-semibold leading-tight tracking-tight text-[#0a0a0a] dark:text-white">
          {step === 1 && 'Create an Account'}
          {step === 2 && 'Contact & Barangay'}
          {step === 3 && 'Profile Setup'}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          {step === 1 && 'Enter your personal information to get started with ServiceHub.'}
          {step === 2 && 'Provide your mobile number and select your Cordova neighborhood.'}
          {step === 3 && 'Choose your avatar and introduce yourself to the community.'}
        </p>
      </div>

      {/* Main Multi-Step Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <SignupSteps
          model={{
            step,
            register,
            fieldErrors,
            showPassword,
            setShowPassword,
            formData,
            isPhoneValid,
            formatPhoneNumber,
            setValue,
            fileInputRef,
            handleFileUpload,
            uploading,
            uploadError,
            handleAvatarSelect,
            isDark,
            accentText,
            accentBg
          }}
        />

        {/* Form controls */}
        <div className="flex items-center gap-3 pt-3">
          {step > 1 && (
            <button
              type="button"
              onClick={handlePrevStep}
              className="flex w-1/3 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-black/[0.08] bg-white py-3 text-xs font-bold text-slate-700 shadow-xs transition-all hover:bg-slate-50 active:scale-[0.98] dark:border-white/10 dark:bg-zinc-800/80 dark:text-zinc-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          <button
            type="submit"
            onClick={step < 3 ? (e) => { e.preventDefault(); handleNextStep(); } : undefined}
            disabled={isLoading || (step < 3 && isNextDisabled)}
            aria-disabled={isLoading || (step < 3 && isNextDisabled)}
            aria-describedby={step === 1 && !formData.agreeTerms ? 'agreeTerms-help' : undefined}
            className={`flex flex-grow items-center justify-center space-x-2 rounded-xl py-3 text-sm font-bold shadow-md transition-all ${
              isLoading
                ? 'bg-slate-300 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed shadow-none'
                : (step < 3 && isNextDisabled)
                  ? 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed shadow-none'
                  : 'bg-[#c86544] hover:bg-[#aa5032] active:scale-[0.98] text-white shadow-orange-950/15 cursor-pointer'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>{step === 3 ? 'Complete Registration' : 'Next Step'}</span>
            )}
          </button>
        </div>
      </form>

      {/* Google Login Component for Easy Registration */}
      {step === 1 && (
        <div className="space-y-3 pt-3 border-t border-black/[0.06] dark:border-white/10 mt-3">
          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/[0.08] dark:border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="bg-white dark:bg-[#181716] px-3 text-slate-400 dark:text-zinc-500 font-bold tracking-widest uppercase">
                OR
              </span>
            </div>
          </div>

          <GoogleSignInButton
            onSuccess={handleGoogleSuccessResponse}
            onError={setError}
            isDark={isDark}
            mode="signup"
            step={step}
          />
          <p className="text-[10px] text-slate-400 dark:text-zinc-500 text-center leading-relaxed px-1">
            Google Sign-In creates your account using your Google email. Resident identity verification unlocks marketplace actions.
          </p>
        </div>
      )}

      {/* Footer Switcher */}
      <div className="text-center text-xs pt-3.5 border-t border-black/[0.06] dark:border-white/10">
        <span className="text-slate-500 dark:text-zinc-400">
          Already have an account?
        </span>
        <button
          type="button"
          onClick={toggleMode}
          className="font-bold text-[#c86544] hover:text-[#aa5032] dark:text-orange-400 dark:hover:text-orange-300 ml-1.5 cursor-pointer focus:outline-none transition-colors"
        >
          Log in
        </button>
      </div>
    </div>
  );
}
