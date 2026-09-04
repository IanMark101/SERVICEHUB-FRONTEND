"use client";

import { Camera, Check, Eye, EyeOff, Image as ImageIcon, Loader2, Sparkles, Upload } from 'lucide-react';
import AuthInput from '../shared/AuthInput';
import { avatars } from '../../../schema/auth/useAuthForm';
import Link from 'next/link';

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

export default function SignupSteps({ model }: { model: any }) {
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
    handleAvatarSelect,
    isDark,
    accentText,
    accentBg
  } = model;

  return (
    <>
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
    </>
  );
}
