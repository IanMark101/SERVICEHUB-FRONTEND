import React, { FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import AuthInput from './shared/AuthInput';
import GoogleSignInButton from './shared/GoogleSignInButton';

interface LoginFormProps {
  formData: any;
  handleInputChange: (e: any) => void;
  fieldErrors: Record<string, string>;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  handleGoogleSuccessResponse: (token: string) => void;
  setError: (msg: string) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isDark: boolean;
  accentText: string;
  setMode: (mode: 'login' | 'signup' | 'forgot' | 'reset') => void;
  toggleMode: () => void;
}

export default function LoginForm({
  formData,
  handleInputChange,
  fieldErrors,
  showPassword,
  setShowPassword,
  handleGoogleSuccessResponse,
  setError,
  handleSubmit,
  isDark,
  accentText,
  setMode,
  toggleMode,
}: LoginFormProps) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Header Info */}
      <div>
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-[#f2efe9] tracking-tight">
          Sign In Account
        </h3>
        <p className="text-slate-500 dark:text-[#b4b0a9] text-xs mt-1 leading-normal">
          Enter your credentials to access the Cordova local service network.
        </p>
      </div>

      {/* Google Login Component */}
      <GoogleSignInButton
        onSuccess={handleGoogleSuccessResponse}
        onError={setError}
        isDark={isDark}
        mode="login"
      />

      <div className="relative flex py-1 items-center mb-1">
        <div className="flex-grow border-t border-slate-200 dark:border-neutral-800/80"></div>
        <span className="flex-shrink mx-3 text-slate-450 dark:text-[#b4b0a9] text-[10px] font-bold tracking-widest uppercase">
          Or
        </span>
        <div className="flex-grow border-t border-slate-200 dark:border-neutral-800/80"></div>
      </div>

      {/* Main Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <AuthInput
          label="Email"
          name="email"
          type="email"
          placeholder="eg. alexmercer@gmail.com"
          value={formData.email}
          onChange={handleInputChange}
          error={fieldErrors.email}
        />

        <div className="space-y-0.5">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-[10px] font-bold text-slate-500 dark:text-[#b4b0a9] uppercase tracking-wide">
              Password
            </label>
            <button
              type="button"
              onClick={() => setMode('forgot')}
              className="text-xs font-bold text-[#FF5A1F] hover:text-orange-400 transition-colors focus:outline-none cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <AuthInput
            label=""
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
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-[#b4b0a9] hover:text-slate-900 dark:hover:text-[#f2efe9] cursor-pointer focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </AuthInput>
        </div>

        {/* Submit button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-4 bg-[#FF5A1F] hover:bg-[#e04f1a] active:scale-[0.98] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#FF5A1F]/25 transition-all mt-4 cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </form>

      {/* Footer Switcher */}
      <div className="text-center text-sm mt-8 pt-4 border-t border-slate-100 dark:border-neutral-800/40">
        <span className="text-slate-550 dark:text-[#b4b0a9] font-medium">
          Don't have an account?
        </span>
        <button
          type="button"
          onClick={toggleMode}
          className="font-bold text-[#FF5A1F] hover:text-orange-400 ml-1 cursor-pointer focus:outline-none transition-colors"
        >
          Register here
        </button>
      </div>

    </div>
  );
}
