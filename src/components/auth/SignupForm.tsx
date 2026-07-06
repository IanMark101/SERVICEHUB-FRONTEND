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
    <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Header Info */}
      <div>
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-[#f2efe9] tracking-tight">
          {step === 1 && 'Sign Up Account'}
          {step === 2 && 'Contact Info'}
          {step === 3 && 'Profile Setup'}
        </h3>
        <p className="text-slate-500 dark:text-[#b4b0a9] text-xs mt-0.5 leading-normal">
          {step === 1 && 'Enter your personal data to create your account.'}
          {step === 2 && 'Provide contact details for hyper-local booking verification.'}
          {step === 3 && 'Finalize your public profile details.'}
        </p>
      </div>

      {/* Main Multi-Step Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
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

            <AuthInput
              label="Password"
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
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 cursor-pointer focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </AuthInput>
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
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Cordova Barangay / Location
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full bg-white dark:bg-[#0c0c0e] border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F]/30 transition-all cursor-pointer"
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
              <div className="h-4 mt-1" />
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
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
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Short Bio
              </label>
              <textarea
                name="bio"
                rows={3}
                placeholder="Tell the community about yourself..."
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full bg-white dark:bg-[#0c0c0e] border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F]/30 resize-none transition-all"
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
            className="flex-grow py-2.5 bg-[#FF5A1F] hover:bg-[#e04f1a] active:scale-[0.98] text-white rounded-lg font-bold text-sm shadow-sm transition-all cursor-pointer"
          >
            {step === 3 ? 'Sign Up' : 'Next Step'}
          </button>
        </div>
      </form>

      {/* Google Login Component for Easy Registration */}
      {step === 1 && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#faf8f5] dark:bg-[#0a0a0a] px-3 text-slate-400 dark:text-slate-500 font-bold tracking-widest uppercase">
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
        </>
      )}

      {/* Footer Switcher */}
      <div className="text-center text-sm pt-3 border-t border-slate-200 dark:border-slate-800">
        <span className="text-slate-500 dark:text-slate-400">
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
