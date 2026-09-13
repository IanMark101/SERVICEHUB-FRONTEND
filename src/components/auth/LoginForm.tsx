import React from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import AuthInput from './shared/AuthInput';
import GoogleSignInButton from './shared/GoogleSignInButton';
import type { FormEvent } from 'react';
import type { UseFormRegister } from 'react-hook-form';
import type { AuthFormValues } from '../../schema/auth/useAuthForm';

interface LoginFormProps {
  formData: AuthFormValues;
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
  register: UseFormRegister<AuthFormValues>;
  isLoading?: boolean;
}

export default function LoginForm({
  fieldErrors,
  showPassword,
  setShowPassword,
  handleGoogleSuccessResponse,
  setError,
  handleSubmit,
  isDark,
  setMode,
  toggleMode,
  register,
  isLoading = false,
}: LoginFormProps) {
  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="text-left">
        <h2 className="font-sans text-3xl font-semibold leading-tight tracking-tight text-[#0a0a0a] dark:text-white">
          Sign In
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          Enter your credentials to access the Cordova local service network.
        </p>
      </div>

      {/* Main Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Email"
          type="email"
          placeholder="your.name@example.com"
          autoComplete="email"
          inputMode="email"
          error={fieldErrors.email}
          {...register('email')}
        />

        <div className="space-y-0.5">
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="auth-password" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Password
            </label>
            <button
              type="button"
              onClick={() => setMode('forgot')}
              className="text-xs font-bold text-[#c86544] hover:text-[#aa5032] dark:text-orange-400 dark:hover:text-orange-300 transition-colors focus:outline-none cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <AuthInput
            label=""
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            autoComplete="current-password"
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
        </div>

        {/* Submit button with Tactile Physics */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isLoading}
            className={`flex w-full items-center justify-center space-x-2 rounded-xl py-3 text-sm font-bold shadow-md transition-all ${
              isLoading
                ? 'bg-slate-300 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed shadow-none'
                : 'bg-[#c86544] hover:bg-[#aa5032] active:scale-[0.98] text-white shadow-orange-950/15 cursor-pointer'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </div>
      </form>

      {/* Divider OR */}
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-black/[0.08] dark:border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-[10px]">
          <span className="bg-white dark:bg-[#181716] px-3 text-slate-400 dark:text-zinc-500 font-bold tracking-widest uppercase">
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
      <div className="text-center text-xs pt-3.5 border-t border-black/[0.06] dark:border-white/10">
        <span className="text-slate-500 dark:text-zinc-400">
          Don&apos;t have an account?
        </span>
        <button
          type="button"
          onClick={toggleMode}
          className="font-bold text-[#c86544] hover:text-[#aa5032] dark:text-orange-400 dark:hover:text-orange-300 ml-1.5 cursor-pointer focus:outline-none transition-colors"
        >
          Register here
        </button>
      </div>
    </div>
  );
}
