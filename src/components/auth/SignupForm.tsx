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
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Top Eyebrow & Stepper */}
      <div className="w-full space-y-2.5">
        <div className="w-full flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#c86544]/30 bg-[#c86544]/[0.08] px-3 py-0.5 text-[11px] font-semibold text-[#aa5032] dark:border-orange-500/30 dark:bg-orange-950/40 dark:text-orange-300">
            <span>Resident Registration</span>
          </div>
          <span className="text-xs font-bold text-[#c86544] dark:text-orange-400">
            Step {step} of 3
          </span>
        </div>

        {/* Stepper Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 w-full">
          {[
            { s: 1, title: 'Credentials', desc: 'Login details' },
            { s: 2, title: 'Contact', desc: 'Phone & location' },
            { s: 3, title: 'Profile', desc: 'Avatar & bio' }
          ].map((item) => {
            const isActive = step === item.s;
            const isCompleted = step > item.s;
            return (
              <div
                key={item.s}
                className={`rounded-xl p-2 sm:p-2.5 transition-all flex flex-col items-center text-center border ${
                  isActive
                    ? 'bg-neutral-50/90 dark:bg-zinc-900 border-[#c86544]/50 shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/15 border-emerald-500/30'
                    : 'bg-neutral-50/40 dark:bg-zinc-900/40 border-black/[0.05] dark:border-white/5 opacity-65'
                }`}
              >
                <div
                  className={`size-6 rounded-full flex items-center justify-center text-[11px] font-bold mb-1 ${
                    isActive
                      ? 'bg-[#c86544] text-white shadow-xs'
                      : isCompleted
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-200 dark:bg-zinc-800 text-neutral-500 dark:text-zinc-400'
                  }`}
                >
                  {isCompleted ? '✓' : item.s}
                </div>
                <p className="text-xs font-semibold text-[#0a0a0a] dark:text-white leading-tight">
                  {item.title}
                </p>
                <p className="hidden sm:block text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-tight">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Header Info */}
      <div className="border-t border-black/[0.06] dark:border-white/10 pt-3.5">
        <h2 className="font-sans text-2xl font-semibold text-[#0a0a0a] dark:text-white tracking-tight leading-tight">
          {step === 1 && 'Create an Account'}
          {step === 2 && 'Contact & Barangay'}
          {step === 3 && 'Profile Setup'}
        </h2>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm leading-relaxed">
          {step === 1 && 'Enter your personal information to get started with ServiceHub.'}
          {step === 2 && 'Provide your mobile number and select your Cordova neighborhood.'}
          {step === 3 && 'Choose your avatar and introduce yourself to the community.'}
        </p>
      </div>

      {/* Main Multi-Step Form */}
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
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
        <div className="pt-2 flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={handlePrevStep}
              className="w-1/3 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/10 bg-white dark:bg-zinc-800/80 hover:bg-slate-50 text-slate-700 dark:text-zinc-200 active:scale-[0.98] font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          <button
            type="submit"
            onClick={step < 3 ? (e) => { e.preventDefault(); handleNextStep(); } : undefined}
            disabled={isLoading}
            aria-disabled={isLoading || (step < 3 && isNextDisabled)}
            aria-describedby={step === 1 && !formData.agreeTerms ? 'agreeTerms-help' : undefined}
            className={`flex-grow py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 ${
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
