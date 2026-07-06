import React, { FormEvent } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AuthInput from './shared/AuthInput';
import GoogleSignInButton from './shared/GoogleSignInButton';
import { avatars } from './useAuthForm';

interface SignupFormProps {
  step: number;
  formData: any;
  handleInputChange: (e: any) => void;
  fieldErrors: Record<string, string>;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  handleGoogleSuccessResponse: (token: string) => void;
  setError: (msg: string) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  handleAvatarSelect: (url: string) => void;
  handlePrevStep: () => void;
  handleNextStep: () => void;
  isDark: boolean;
  accentText: string;
  accentBg: string;
  toggleMode: () => void;
}

export default function SignupForm({
  step,
  formData,
  handleInputChange,
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
}: SignupFormProps) {
  // Live Validation for Step 1 Enablement
  const isStep1Valid =
    formData.firstName.trim().length > 0 &&
    formData.lastName.trim().length > 0 &&
    formData.email.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(formData.email) &&
    formData.password.length >= 8 &&
    /\d/.test(formData.password) &&
    /[A-Z]/.test(formData.password) &&
    formData.password === formData.confirmPassword &&
    formData.agreeTerms === true;

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
          <span className="text-[#FF5A1F] font-extrabold">Step {step} of 3</span>
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
                  ? 'bg-white dark:bg-[#202022] border-[#FF5A1F]/50 dark:border-[#FF5A1F]/50 ring-1 ring-[#FF5A1F]/30 scale-[1.01]'
                  : 'bg-white/40 dark:bg-[#151517]/40 border-slate-200 dark:border-slate-800/80 opacity-75'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 border shadow-inner mx-auto ${
                  step === item.s
                    ? 'bg-[#FF5A1F] text-white border-[#FF5A1F]'
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
        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-[#f2efe9] tracking-tight">
          {step === 1 && 'Sign Up Account'}
          {step === 2 && 'Contact Info'}
          {step === 3 && 'Profile Setup'}
        </h3>
        <p className="text-slate-500 dark:text-[#b4b0a9] text-xs mt-0.5 leading-normal">
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
                name="firstName"
                placeholder="eg. John"
                value={formData.firstName}
                onChange={handleInputChange}
                error={fieldErrors.firstName}
              />
              <AuthInput
                label="Last Name"
                name="lastName"
                placeholder="eg. Francisco"
                value={formData.lastName}
                onChange={handleInputChange}
                error={fieldErrors.lastName}
              />
            </div>

            <AuthInput
              label="Email"
              name="email"
              type="email"
              placeholder="eg. johnfrans@gmail.com"
              value={formData.email}
              onChange={handleInputChange}
              error={fieldErrors.email}
            />

            {/* Password input and Live Checklist grouped for tighter margin */}
            <div className="space-y-2">
              <AuthInput
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                error={fieldErrors.password}
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

            <AuthInput
              label="Confirm Password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={fieldErrors.confirmPassword}
            />

            {/* Terms of Service agreement checkbox */}
            <div className="flex items-center space-x-2.5 pt-1.5 pb-1 px-1">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={handleInputChange}
                className="h-4 w-4 text-[#FF5A1F] border-slate-300 dark:border-slate-800 rounded focus:ring-[#FF5A1F]/30 bg-white dark:bg-[#0c0c0e] cursor-pointer flex-shrink-0"
              />
              <label htmlFor="agreeTerms" className="text-[11px] font-medium text-slate-500 dark:text-[#b4b0a9] select-none cursor-pointer leading-none">
                I agree to the{' '}
                <Link href="/terms" target="_blank" className="font-bold text-[#FF5A1F] hover:text-orange-400 transition-colors">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" target="_blank" className="font-bold text-[#FF5A1F] hover:text-orange-400 transition-colors">
                  Privacy Policy
                </Link>.
              </label>
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <AuthInput
              label="Contact Number"
              name="phone"
              type="tel"
              placeholder="eg. 0917 123 4567 or +63 917 123 4567"
              value={formData.phone}
              onChange={handleInputChange}
              error={fieldErrors.phone}
            />

            <div>
              <label className="block text-sm font-semibold text-slate-550 dark:text-slate-400 mb-1.5">
                Cordova Barangay / Location
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full bg-white dark:bg-[#0c0c0e] border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F]/30 transition-all cursor-pointer"
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
            <div>
              <label className="block text-sm font-semibold text-slate-550 dark:text-slate-400 mb-2.5">
                Select Profile Avatar
              </label>
              <div className="flex items-center space-x-4">
                <img
                  src={formData.avatarUrl}
                  alt="Selected Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-slate-300 dark:border-slate-800 shadow-sm"
                />
                <div className="flex space-x-2">
                  {avatars.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAvatarSelect(url)}
                      className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all hover:scale-105 cursor-pointer ${
                        formData.avatarUrl === url
                          ? 'border-[#FF5A1F] shadow-sm scale-105'
                          : 'border-slate-300 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      <img
                        src={url}
                        alt={`Option ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-550 dark:text-slate-400 mb-1.5">
                About You
              </label>
              <textarea
                name="bio"
                rows={3}
                placeholder="Tell the community a little about yourself..."
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full bg-white dark:bg-[#0c0c0e] border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F]/30 resize-none transition-all"
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
            disabled={step === 1 && !isStep1Valid}
            className={`flex-grow py-2.5 rounded-lg font-bold text-sm shadow-sm transition-all cursor-pointer ${
              (step === 1 && !isStep1Valid)
                ? 'bg-slate-200 dark:bg-slate-800/80 text-slate-450 dark:text-slate-500 cursor-not-allowed active:scale-100'
                : 'bg-[#FF5A1F] hover:bg-[#e04f1a] active:scale-[0.98] text-white'
            }`}
          >
            {step === 3 ? 'Sign Up' : 'Next Step'}
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
          className="font-bold text-[#FF5A1F] hover:text-orange-400 ml-1 cursor-pointer focus:outline-none transition-colors"
        >
          Log in
        </button>
      </div>

    </div>
  );
}
