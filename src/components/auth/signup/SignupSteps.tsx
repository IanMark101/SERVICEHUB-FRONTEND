"use client";

import { Camera, Check, Eye, EyeOff, Loader2, Sparkles, Upload } from 'lucide-react';
import Image from 'next/image';
import AuthInput from '../shared/AuthInput';
import { avatars } from '../../../schema/auth/useAuthForm';
import Link from 'next/link';
import type { ChangeEvent, RefObject } from 'react';
import type { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import type { AuthFormValues } from '../../../schema/auth/useAuthForm';

interface SignupStepsModel {
  step: number;
  register: UseFormRegister<AuthFormValues>;
  fieldErrors: Record<string, string>;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  formData: AuthFormValues;
  isPhoneValid: boolean;
  formatPhoneNumber: (value: string) => string;
  setValue: UseFormSetValue<AuthFormValues>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleFileUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  uploadError: string | null;
  handleAvatarSelect: (url: string) => void;
  isDark: boolean;
  accentText: string;
  accentBg: string;
}

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

export default function SignupSteps({ model }: { model: SignupStepsModel }) {
  const {
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
    handleAvatarSelect
  } = model;

  return (
    <>
        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 animate-fade-in">
              <AuthInput
                label="First Name"
                placeholder="eg. John"
                autoComplete="given-name"
                error={fieldErrors.firstName}
                {...register('firstName')}
              />
              <AuthInput
                label="Last Name"
                placeholder="eg. Francisco"
                autoComplete="family-name"
                error={fieldErrors.lastName}
                {...register('lastName')}
              />
            </div>

            <AuthInput
              label="Email"
              type="email"
              placeholder="eg. johnfrans@gmail.com"
              autoComplete="email"
              inputMode="email"
              error={fieldErrors.email}
              {...register('email')}
            />

            {/* Password input and Live Checklist grouped for tighter margin */}
            <div className="space-y-2">
              <AuthInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="new-password"
                error={fieldErrors.password}
                {...register('password')}
              >
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 cursor-pointer focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </AuthInput>

              {/* Live Password Strength Indicators */}
              <div className="space-y-1 px-1 flex flex-col">
                <div className="flex items-center space-x-1.5 text-[10px] font-semibold transition-all">
                  <span className={formData.password.length >= 8 ? 'text-emerald-500' : 'text-neutral-400 dark:text-neutral-500'}>
                    {formData.password.length >= 8 ? '✓' : '○'}
                  </span>
                  <span className={formData.password.length >= 8 ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-600 dark:text-neutral-400'}>
                    Minimum 8 characters
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-[10px] font-semibold transition-all">
                  <span className={/\d/.test(formData.password) ? 'text-emerald-500' : 'text-neutral-400 dark:text-neutral-500'}>
                    {/\d/.test(formData.password) ? '✓' : '○'}
                  </span>
                  <span className={/\d/.test(formData.password) ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-600 dark:text-neutral-400'}>
                    At least one number
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-[10px] font-semibold transition-all">
                  <span className={/[A-Z]/.test(formData.password) ? 'text-emerald-500' : 'text-neutral-400 dark:text-neutral-500'}>
                    {/[A-Z]/.test(formData.password) ? '✓' : '○'}
                  </span>
                  <span className={/[A-Z]/.test(formData.password) ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-600 dark:text-neutral-400'}>
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
                autoComplete="new-password"
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
            <div className="space-y-1.5 pt-1.5 pb-1 px-1">
              <div className="flex items-center space-x-2.5">
                <input
                  id="agreeTerms"
                  type="checkbox"
                  aria-invalid={Boolean(fieldErrors.agreeTerms)}
                  aria-describedby="agreeTerms-help"
                  {...register('agreeTerms')}
                  className={`h-4 w-4 rounded-md text-[#c86544] focus:ring-[#c86544]/20 bg-slate-50 dark:bg-zinc-900 cursor-pointer flex-shrink-0 ${
                    fieldErrors.agreeTerms
                      ? 'border-rose-500 ring-1 ring-rose-500/30'
                      : 'border-black/[0.12] dark:border-white/20'
                  }`}
                />
                <label htmlFor="agreeTerms" className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 select-none cursor-pointer leading-none">
                  I agree to the{' '}
                  <Link href="/terms" target="_blank" rel="noopener noreferrer" className="font-bold text-[#c86544] hover:text-[#aa5032] dark:text-orange-400 dark:hover:text-orange-300 transition-colors">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="font-bold text-[#c86544] hover:text-[#aa5032] dark:text-orange-400 dark:hover:text-orange-300 transition-colors">
                    Privacy Policy
                  </Link>.
                </label>
              </div>
              <p
                id="agreeTerms-help"
                role={fieldErrors.agreeTerms ? 'alert' : undefined}
                className={`text-[11px] font-medium pl-6.5 ${
                  fieldErrors.agreeTerms
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {fieldErrors.agreeTerms || 'Required before continuing to the next step.'}
              </p>
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label htmlFor="registration-phone" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Contact Number
              </label>
              <div className={`flex items-center rounded-xl border bg-slate-50/70 dark:bg-zinc-900/60 overflow-hidden transition-all focus-within:bg-white dark:focus-within:bg-zinc-900 focus-within:ring-2 focus-within:ring-[#c86544]/15 ${
                fieldErrors.phone
                  ? 'border-rose-500 ring-1 ring-rose-500/30'
                  : 'border-black/[0.08] dark:border-white/10 focus-within:border-[#c86544] dark:focus-within:border-orange-500'
              }`}>
                {/* Philippine Flag Badge with +63 */}
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100/80 dark:bg-zinc-800/80 border-r border-black/[0.06] dark:border-white/10 text-slate-700 dark:text-zinc-200 text-xs font-bold select-none flex-shrink-0">
                  <PhilippineFlag className="w-5 h-3.5 rounded-[2px] shadow-xs" />
                  <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white tracking-tight">+63</span>
                </div>

                {/* Formatted 10-digit Input */}
                <input
                  id="registration-phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  aria-invalid={Boolean(fieldErrors.phone)}
                  aria-describedby="registration-phone-message"
                  placeholder="917 123 4567"
                  value={formData.phone || ''}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    setValue('phone', formatted, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                  }}
                  onBlur={register('phone').onBlur}
                  name="phone"
                  className="w-full bg-transparent px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none tracking-wide font-medium"
                />
              </div>

              {/* Helper or Error Message */}
              <div id="registration-phone-message" className="min-h-5 mt-1 flex items-center justify-between text-[11px]">
                {fieldErrors.phone ? (
                  <span className="text-rose-600 dark:text-rose-400 font-medium animate-in fade-in duration-100">
                    {fieldErrors.phone}
                  </span>
                ) : (
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">
                    Philippine mobile number (e.g. 917 123 4567)
                  </span>
                )}
                {formData.phone && (
                  <span className={`text-[10px] font-mono font-bold ${
                    isPhoneValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-zinc-500'
                  }`}>
                    {formData.phone.replace(/\D/g, '').length}/10 digits
                  </span>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="registration-location" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Cordova Barangay / Location
              </label>
              <select
                id="registration-location"
                autoComplete="address-level3"
                {...register('location')}
                className="w-full bg-slate-50/70 dark:bg-zinc-900/60 border border-black/[0.08] dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-[#c86544] focus:ring-2 focus:ring-[#c86544]/15 dark:focus:border-orange-500 dark:focus:ring-orange-500/20 transition-all cursor-pointer"
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
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2 leading-relaxed">
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">
                Profile Picture
              </label>

              {/* Avatar Preview & Upload Action */}
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/50 transition-all">
                <div className="relative group/avatar flex-shrink-0 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <Image unoptimized width={56} height={56}
                    src={formData.avatarUrl || avatars[0]}
                    alt="Selected Profile"
                    className="size-14 rounded-2xl object-cover border-2 border-[#c86544] shadow-sm transition-transform duration-200 group-hover/avatar:scale-105"
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/10 text-slate-800 dark:text-zinc-200 hover:border-[#c86544] hover:text-[#c86544] dark:hover:text-orange-400 transition-all shadow-xs active:scale-95 cursor-pointer"
                    >
                      {uploading ? (
                        <>
                          <Loader2 size={13} className="animate-spin text-[#c86544]" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={13} className="text-[#c86544]" />
                          <span>Upload Photo</span>
                        </>
                      )}
                    </button>

                    {formData.avatarUrl?.startsWith('data:image') && (
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/30 flex items-center gap-1">
                        <Check size={11} /> Custom
                      </span>
                    )}
                  </div>
                  <p className="text-[10.5px] text-slate-500 dark:text-zinc-400 mt-1 truncate">
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
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-[#c86544]" /> Or pick an avatar preset
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
                      className={`relative aspect-square rounded-xl p-1 border-2 transition-all duration-200 hover:scale-105 cursor-pointer flex items-center justify-center ${
                        isSelected
                          ? 'border-[#c86544] bg-orange-50/50 dark:bg-orange-950/20 shadow-sm ring-2 ring-[#c86544]/30 scale-105'
                          : 'border-black/[0.06] dark:border-white/10 bg-slate-50/50 dark:bg-zinc-900 opacity-80 hover:opacity-100 hover:border-black/[0.14]'
                      }`}
                      title={`Animated Avatar #${idx + 1}`}
                    >
                      <Image unoptimized width={56} height={56}
                        src={url}
                        alt={`Animated Avatar ${idx + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 size-4 rounded-full bg-[#c86544] text-white flex items-center justify-center text-[9px] shadow-sm">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                About You (Bio)
              </label>
              <textarea
                rows={3}
                placeholder="Tell the community a little about yourself, your services, or what you are looking for..."
                {...register('bio')}
                className="w-full bg-slate-50/70 dark:bg-zinc-900/60 border border-black/[0.08] dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-[#c86544] focus:ring-2 focus:ring-[#c86544]/15 resize-none transition-all"
              />
            </div>
          </div>
        )}
    </>
  );
}
