import React, { useRef, useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Camera, Upload, Sparkles, Check, Image as ImageIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import AuthInput from './shared/AuthInput';
import GoogleSignInButton from './shared/GoogleSignInButton';
import { avatars } from '../../schema/auth/useAuthForm';
import { uploadAvatarToCloudinary } from '../../lib/imageUtils';
import SignupSteps from './signup/SignupSteps';

// High-fidelity Philippine Flag SVG for cross-platform rendering (Windows/macOS/mobile)
function PhilippineFlag({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 300" className={`rounded-[2px] shadow-xs object-cover flex-shrink-0 ${className}`}>
      <rect width="600" height="150" fill="#0038A8" />
      <rect y="150" width="600" height="150" fill="#CE1126" />
      <polygon points="0,0 259.8,150 0,300" fill="#FFFFFF" />
      <circle cx="86.6" cy="150" r="28" fill="#FCD116" />
      <polygon points="86.6,105 91,140 82.2,140" fill="#FCD116" />
      <polygon points="86.6,195 91,160 82.2,160" fill="#FCD116" />
      <polygon points="41.6,150 76.6,154.4 76.6,145.6" fill="#FCD116" />
      <polygon points="131.6,150 96.6,154.4 96.6,145.6" fill="#FCD116" />
      <circle cx="36" cy="48" r="8" fill="#FCD116" />
      <circle cx="36" cy="252" r="8" fill="#FCD116" />
      <circle cx="218" cy="150" r="8" fill="#FCD116" />
    </svg>
  );
}

interface SignupFormProps {
  step: number;
  formData: any;
  fieldErrors: Record<string, string>;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  handleGoogleSuccessResponse: (token: string) => void;
  setError: (msg: string) => void;
  handleSubmit: (e: any) => void;
  handleAvatarSelect: (url: string) => void;
  handlePrevStep: () => void;
  handleNextStep: () => void;
  isDark: boolean;
  accentText: string;
  accentBg: string;
  toggleMode: () => void;
  register: any;
  setValue: any;
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
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to process and upload image');
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
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Mobile-visible Logo Header */}
      <div className="md:hidden flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <img src="/logo.svg" alt="Logo" className="w-7 h-7 object-contain rounded-lg shadow-sm" />
          <span className="text-sm font-extrabold tracking-tight text-slate-800 dark:text-white">ServiceHub Cordova</span>
        </div>
      </div>

      {/* Stepper cards (Moved from Left Panel to Right Panel) */}
      <div className="w-full space-y-2">
        {/* Dynamic Progress Indicator */}
        <div className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
          <span>Registration Progress</span>
          <span className="text-orange-600 dark:text-orange-400 font-extrabold">Step {step} of 3</span>
        </div>

        {/* Stepper cards container */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {[
            { s: 1, title: 'Credentials', desc: 'Create login details' },
            { s: 2, title: 'Contact Details', desc: 'Phone and location' },
            { s: 3, title: 'Profile Setup', desc: 'Customize avatar and bio' }
          ].map((item) => (
            <div
              key={item.s}
              className={`border rounded-xl p-3 transition-all duration-300 cursor-default shadow-sm flex flex-col items-center text-center ${
                step === item.s
                  ? 'bg-white dark:bg-[#202022] border-orange-500/50 dark:border-orange-500/50 ring-1 ring-orange-500/30 scale-[1.01]'
                  : 'bg-white/40 dark:bg-[#151517]/40 border-slate-200 dark:border-slate-800/80 opacity-75'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 border shadow-inner mx-auto ${
                  step === item.s
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400 border-slate-255 dark:border-slate-700'
                }`}
              >
                {item.s}
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                {item.title}
              </p>
              <p className="hidden md:block text-[9px] text-slate-400 dark:text-slate-500 mt-1 leading-tight">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Header Info */}
      <div className="border-t border-slate-200 dark:border-slate-800/60 pt-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
          {step === 1 && 'Sign Up Account'}
          {step === 2 && 'Contact Info'}
          {step === 3 && 'Profile Setup'}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs">
          {step === 1 && 'Enter your personal data to create your account.'}
          {step === 2 && 'Provide your contact information and select your Cordova barangay.'}
          {step === 3 && 'Finalize your public profile details.'}
        </p>
      </div>

      {/* Main Multi-Step Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
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
        <div className="pt-2 flex space-x-3">
          {step > 1 && (
            <button
              type="button"
              onClick={handlePrevStep}
              className="w-1/3 flex items-center justify-center space-x-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#22211e] text-slate-500 dark:text-[#b4b0a9] rounded-lg py-2 text-xs font-bold transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          <button
            type="submit"
            onClick={step < 3 ? (e) => { e.preventDefault(); handleNextStep(); } : undefined}
            disabled={isLoading}
            className={`flex-grow py-2.5 rounded-lg font-bold text-sm shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              isLoading
                ? 'bg-slate-300 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                : (step < 3 && isNextDisabled)
                  ? 'bg-orange-600/75 dark:bg-orange-700/70 hover:bg-orange-600 text-white shadow-sm'
                  : 'bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white shadow-md'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>{step === 3 ? 'Sign Up' : 'Next Step'}</span>
            )}
          </button>
        </div>
      </form>

      {/* Google Login Component for Easy Registration */}
      {step === 1 && (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800/80 mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#fbfaf7] dark:bg-[#191919] px-3 text-slate-400 dark:text-slate-500 font-bold tracking-widest uppercase">
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
          <p className="text-[10px] text-slate-450 dark:text-slate-500 text-center leading-relaxed px-1">
            Google Sign-In creates your account using your Google email. Identity Verification is required after registration to unlock bookings, service listings, requests, and offers.
          </p>
        </div>
      )}

      {/* Footer Switcher */}
      <div className="text-center text-sm pt-4 border-t border-slate-200 dark:border-slate-800">
        <span className="text-slate-500 dark:text-slate-400 font-medium">
          Already have an account?
        </span>
        <button
          type="button"
          onClick={toggleMode}
          className="font-bold text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400 ml-1 cursor-pointer focus:outline-none transition-colors"
        >
          Log in
        </button>
      </div>

    </div>
  );
}
