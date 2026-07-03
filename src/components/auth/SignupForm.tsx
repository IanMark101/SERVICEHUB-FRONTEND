import React, { FormEvent } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
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
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Header Info */}
      <div>
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-[#f2efe9] tracking-tight">
          Sign Up Account
        </h3>
        <p className="text-slate-500 dark:text-[#b4b0a9] text-xs mt-1 leading-normal">
          {step === 1 && 'Enter your personal data to create your account.'}
          {step === 2 && 'Provide contact details for hyper-local booking verification.'}
          {step === 3 && 'Finalize your public profile details.'}
        </p>
      </div>

      {step === 1 && (
        <>
          {/* Google Login Component for Easy Registration */}
          <GoogleSignInButton
            onSuccess={handleGoogleSuccessResponse}
            onError={setError}
            isDark={isDark}
            mode="signup"
            step={step}
          />

          <div className="relative flex py-1 items-center mb-1">
            <div className="flex-grow border-t border-slate-200 dark:border-neutral-800/80"></div>
            <span className="flex-shrink mx-3 text-slate-450 dark:text-[#b4b0a9] text-[10px] font-bold tracking-widest uppercase">
              Or
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-neutral-800/80"></div>
          </div>
        </>
      )}

      {/* Main Multi-Step Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div className="grid grid-cols-2 gap-3">
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

            <div className="space-y-0.5">
              <label className="block text-[10px] font-bold text-slate-500 dark:text-[#b4b0a9] uppercase tracking-wide">
                Password
              </label>
              <AuthInput
                label=""
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                error={fieldErrors.password}
                helperText="Must be at least 8 characters."
              >
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-[#b4b0a9] hover:text-slate-900 dark:hover:text-[#f2efe9] cursor-pointer focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </AuthInput>
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <AuthInput
              label="Contact Number"
              name="phone"
              type="tel"
              placeholder="eg. +63 917 123 4567"
              value={formData.phone}
              onChange={handleInputChange}
              error={fieldErrors.phone}
            />

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-[#b4b0a9] uppercase tracking-wide mb-1.5">
                Cordova Barangay / Location
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full bg-white dark:bg-[#22211e] border border-slate-300 dark:border-neutral-800/80 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-[#f2efe9] focus:bg-slate-50/50 dark:focus:bg-[#2b2a26] focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all cursor-pointer"
              >
                <option value="Poblacion, Cordova">Poblacion (Downtown)</option>
                <option value="San Miguel, Cordova">San Miguel</option>
                <option value="Bangbang, Cordova">Bangbang</option>
                <option value="Gabi, Cordova">Gabi</option>
                <option value="Ibabao, Cordova">Ibabao</option>
                <option value="Pilipog, Cordova">Pilipog</option>
                <option value="Catarman, Cordova">Catarman</option>
                <option value="Alegria, Cordova">Alegria</option>
                <option value="Buagsong, Cordova">Buagsong</option>
                <option value="Dapitan, Cordova">Dapitan</option>
                <option value="Day-as, Cordova">Day-as</option>
              </select>
              <div className="h-4 mt-1" />
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-[#b4b0a9] uppercase tracking-wide mb-2">
                Select Profile Avatar
              </label>
              <div className="flex items-center space-x-4">
                <img
                  src={formData.avatarUrl}
                  alt="Selected Profile"
                  className="w-12 h-12 rounded-full object-cover border-2 border-slate-300 dark:border-neutral-700/60 shadow-sm"
                />
                <div className="flex space-x-2">
                  {avatars.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAvatarSelect(url)}
                      className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all hover:scale-105 cursor-pointer ${
                        formData.avatarUrl === url
                          ? 'border-orange-500 shadow-sm scale-105'
                          : 'border-slate-300 dark:border-neutral-800 opacity-60'
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
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase mb-1.5">
                Short Bio
              </label>
              <textarea
                name="bio"
                rows={3}
                placeholder="Tell the community about yourself..."
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full bg-white dark:bg-[#0f1115] border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm text-slate-800 dark:text-white placeholder-slate-455 dark:placeholder-slate-600 focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F]/50 resize-none transition-all shadow-sm"
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
              className="w-1/3 flex items-center justify-center space-x-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#22211e] text-slate-500 dark:text-[#b4b0a9] rounded-xl py-3.5 text-xs font-bold transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          <button
            type="submit"
            onClick={step < 3 ? (e) => { e.preventDefault(); handleNextStep(); } : undefined}
            className="flex-grow py-4 bg-[#FF5A1F] hover:bg-[#e04f1a] active:scale-[0.98] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#FF5A1F]/25 transition-all cursor-pointer"
          >
            {step === 3 ? 'Sign Up' : 'Next Step'}
          </button>
        </div>
      </form>

      {/* Footer Switcher */}
      <div className="text-center text-sm mt-8 pt-4 border-t border-slate-100 dark:border-neutral-800/40">
        <span className="text-slate-555 dark:text-[#b4b0a9] font-medium">
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
