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
      <div className="text-center lg:text-left">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
          Sign In Account
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs">
          Enter your credentials to access the Cordova local service network.
        </p>
      </div>

      {/* Main Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <AuthInput
          label="Email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange}
          error={fieldErrors.email}
        />

        <div className="space-y-0.5">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
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
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 cursor-pointer focus:outline-none"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </AuthInput>
        </div>

        {/* Submit button */}
        <div className="pt-1.5">
          <button
            type="submit"
            className="w-full py-2.5 bg-[#FF5A1F] hover:bg-[#e04f1a] active:scale-[0.98] text-white rounded-lg font-bold text-sm shadow-sm transition-all cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </form>

      {/* Divider OR */}
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

      {/* Google Login Component */}
      <GoogleSignInButton
        onSuccess={handleGoogleSuccessResponse}
        onError={setError}
        isDark={isDark}
        mode="login"
      />

      {/* Footer Switcher */}
      <div className="text-center text-sm pt-3 border-t border-slate-200 dark:border-slate-800">
        <span className="text-slate-500 dark:text-slate-400">
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
