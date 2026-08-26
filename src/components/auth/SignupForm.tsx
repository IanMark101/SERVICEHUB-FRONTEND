import React, { useRef, useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Camera, Upload, Sparkles, Check, Image as ImageIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import AuthInput from './shared/AuthInput';
import GoogleSignInButton from './shared/GoogleSignInButton';
import { avatars } from '../../schema/auth/useAuthForm';
import { uploadAvatarToCloudinary } from '../../lib/imageUtils';

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
          <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain rounded-lg shadow-sm" />
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
        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div className="grid grid-cols-2 gap-3 animate-fade-in">
              <AuthInput
                label="First Name"
                placeholder="eg. John"
                error={fieldErrors.firstName}
                {...register('firstName')}
              />
              <AuthInput
                label="Last Name"
                placeholder="eg. Francisco"
                error={fieldErrors.lastName}
                {...register('lastName')}
              />
            </div>

            <AuthInput
              label="Email"
              type="email"
              placeholder="eg. johnfrans@gmail.com"
              error={fieldErrors.email}
              {...register('email')}
            />

            {/* Password input and Live Checklist grouped for tighter margin */}
            <div className="space-y-2">
              <AuthInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                error={fieldErrors.password}
                {...register('password')}
              >
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 cursor-pointer focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </AuthInput>

              {/* Live Password Strength Indicators */}
              <div className="space-y-1 px-1 flex flex-col">
                <div className="flex items-center space-x-1.5 text-[10px] font-semibold transition-all">
                  <span className={formData.password.length >= 8 ? 'text-emerald-500' : 'text-slate-400 dark:text-[#8e8a82]'}>
                    {formData.password.length >= 8 ? '✓' : '○'}
                  </span>
                  <span className={formData.password.length >= 8 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-[#b4b0a9]'}>
                    Minimum 8 characters
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-[10px] font-semibold transition-all">
                  <span className={/\d/.test(formData.password) ? 'text-emerald-500' : 'text-slate-400 dark:text-[#8e8a82]'}>
                    {/\d/.test(formData.password) ? '✓' : '○'}
                  </span>
                  <span className={/\d/.test(formData.password) ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-[#b4b0a9]'}>
                    At least one number
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-[10px] font-semibold transition-all">
                  <span className={/[A-Z]/.test(formData.password) ? 'text-emerald-500' : 'text-slate-400 dark:text-[#8e8a82]'}>
                    {/[A-Z]/.test(formData.password) ? '✓' : '○'}
                  </span>
                  <span className={/[A-Z]/.test(formData.password) ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-[#b4b0a9]'}>
                    At least one uppercase letter
                  </span>
                </div>
              </div>
            </div>

            {/* Confirm Password with Live Matching Feedback */}
            <div className="space-y-1">
              <AuthInput
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                error={
                  fieldErrors.confirmPassword ||
                  (formData.confirmPassword?.length > 0 && formData.password !== formData.confirmPassword
                    ? 'Passwords do not match'
                    : undefined)
                }
                {...register('confirmPassword')}
              />

              {/* Live Match Status Badge */}
              {formData.confirmPassword?.length > 0 && formData.password === formData.confirmPassword && !fieldErrors.confirmPassword && (
                <div className="flex items-center space-x-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 px-1 -mt-2 mb-1 animate-in fade-in">
                  <span>✓</span>
                  <span>Passwords match</span>
                </div>
              )}
            </div>

            {/* Terms of Service agreement checkbox */}
            <div className="flex items-center space-x-2.5 pt-1.5 pb-1 px-1">
              <input
                id="agreeTerms"
                type="checkbox"
                {...register('agreeTerms')}
                className="h-4 w-4 text-orange-600 border-slate-300 dark:border-slate-800 rounded focus:ring-orange-500/30 bg-white dark:bg-[#0c0c0e] cursor-pointer flex-shrink-0"
              />
              <label htmlFor="agreeTerms" className="text-[11px] font-medium text-slate-500 dark:text-[#b4b0a9] select-none cursor-pointer leading-none">
                I agree to the{' '}
                <Link href="/terms" target="_blank" className="font-bold text-orange-600 dark:text-orange-400 hover:text-orange-500 transition-colors">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" target="_blank" className="font-bold text-orange-600 dark:text-orange-400 hover:text-orange-500 transition-colors">
                  Privacy Policy
                </Link>.
              </label>
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Contact Number
              </label>
              <div className={`flex items-center rounded-xl border bg-white dark:bg-[#0c0c0e] overflow-hidden transition-all focus-within:ring-2 focus-within:ring-orange-500/20 ${
                fieldErrors.phone
                  ? 'border-red-500 ring-1 ring-red-500/30'
                  : 'border-slate-300 dark:border-slate-800 focus-within:border-orange-500'
              }`}>
                {/* Philippine Flag Badge with +63 */}
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100/90 dark:bg-[#1c1b18] border-r border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-[#f2efe9] text-xs font-bold select-none flex-shrink-0">
                  <PhilippineFlag className="w-5 h-3.5 rounded-[2px] shadow-xs" />
                  <span className="font-mono text-xs font-extrabold text-slate-800 dark:text-[#f2efe9] tracking-tight">+63</span>
                </div>

                {/* Formatted 10-digit Input */}
                <input
                  type="tel"
                  autoComplete="tel"
                  placeholder="917 123 4567"
                  value={formData.phone || ''}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    setValue('phone', formatted, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                  }}
                  onBlur={register('phone').onBlur}
                  name="phone"
                  className="w-full bg-transparent px-3.5 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none tracking-wide font-medium"
                />
              </div>

              {/* Helper or Error Message */}
              <div className="min-h-5 mt-1 flex items-center justify-between text-[11px]">
                {fieldErrors.phone ? (
                  <span className="text-red-500 font-semibold animate-in fade-in duration-100">
                    {fieldErrors.phone}
                  </span>
                ) : (
                  <span className="text-slate-400 dark:text-neutral-500 font-medium">
                    Philippine mobile number (e.g. 917 123 4567)
                  </span>
                )}
                {formData.phone && (
                  <span className={`text-[10px] font-mono font-bold ${
                    isPhoneValid ? 'text-emerald-500' : 'text-slate-400 dark:text-neutral-500'
                  }`}>
                    {formData.phone.replace(/\D/g, '').length}/10 digits
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-555 dark:text-slate-400 mb-1.5">
                Cordova Barangay / Location
              </label>
              <select
                {...register('location')}
                className="w-full bg-white dark:bg-[#0c0c0e] border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all cursor-pointer"
              >
                <option value="Alegria, Cordova">Alegria</option>
                <option value="Bangbang, Cordova">Bangbang</option>
                <option value="Buagsong, Cordova">Buagsong</option>
                <option value="Catarman, Cordova">Catarman</option>
                <option value="Cogon, Cordova">Cogon</option>
                <option value="Dapitan, Cordova">Dapitan</option>
                <option value="Day-as, Cordova">Day-as</option>
                <option value="Gabi, Cordova">Gabi</option>
                <option value="Gilutongan, Cordova">Gilutongan</option>
                <option value="Ibabao, Cordova">Ibabao</option>
                <option value="Pilipog, Cordova">Pilipog</option>
                <option value="Poblacion, Cordova">Poblacion (Downtown)</option>
                <option value="San Miguel, Cordova">San Miguel</option>
              </select>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 leading-relaxed font-semibold">
                Your selected barangay helps connect you with nearby community members. Your residency will be verified later through Identity Verification.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Profile Picture
              </label>

              {/* Avatar Preview & Upload Action */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-slate-50/70 dark:bg-[#151515] transition-all">
                <div className="relative group/avatar flex-shrink-0 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <img
                    src={formData.avatarUrl || avatars[0]}
                    alt="Selected Profile"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-orange-500 shadow-sm transition-transform duration-200 group-hover/avatar:scale-105"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity text-white">
                    <Camera size={18} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-200 hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-all shadow-sm active:scale-95"
                    >
                      {uploading ? (
                        <>
                          <Loader2 size={13} className="animate-spin text-orange-500" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={13} className="text-orange-500" />
                          <span>Upload Photo</span>
                        </>
                      )}
                    </button>

                    {formData.avatarUrl?.startsWith('data:image') && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/30 flex items-center gap-1">
                        <Check size={11} /> Custom
                      </span>
                    )}
                  </div>
                  <p className="text-[10.5px] text-slate-400 dark:text-neutral-500 mt-1 truncate">
                    JPG, PNG, or WebP (max 10MB)
                  </p>
                </div>
              </div>

              {uploadError && (
                <p className="text-xs text-rose-500 font-semibold mt-1.5 animate-fade-in">
                  {uploadError}
                </p>
              )}
            </div>

            {/* Animated Avatar Presets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600 dark:text-neutral-300 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-500" /> Or pick an animated avatar
                </span>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {avatars.map((url, idx) => {
                  const isSelected = formData.avatarUrl === url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAvatarSelect(url)}
                      className={`relative aspect-square rounded-2xl p-1 border-2 transition-all duration-200 hover:scale-105 cursor-pointer flex items-center justify-center ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 shadow-md ring-2 ring-orange-500/30 scale-105'
                          : 'border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900 opacity-75 hover:opacity-100 hover:border-slate-300'
                      }`}
                      title={`Animated Avatar #${idx + 1}`}
                    >
                      <img
                        src={url}
                        alt={`Animated Avatar ${idx + 1}`}
                        className="w-full h-full object-cover rounded-xl"
                      />
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-600 text-white flex items-center justify-center text-[9px] shadow-sm">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-555 dark:text-slate-400 mb-1.5">
                About You (Bio)
              </label>
              <textarea
                rows={3}
                placeholder="Tell the community a little about yourself, skills, or what you need..."
                {...register('bio')}
                className="w-full bg-white dark:bg-[#0c0c0e] border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 resize-none transition-all"
              />
            </div>
          </div>
        )}

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
