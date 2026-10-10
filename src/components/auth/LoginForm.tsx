import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import AuthInput from './shared/AuthInput';
import GoogleSignInButton from './shared/GoogleSignInButton';
import type { FormEvent } from 'react';
import type { UseFormRegister } from 'react-hook-form';
import type { AuthFormValues } from '../../schema/auth/useAuthForm';
import AuthCaptcha from './shared/AuthCaptcha';
import type { AuthCaptchaModel } from './shared/useAuthCaptcha';

interface LoginFormProps {
  captcha: AuthCaptchaModel;
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
  captcha,
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
        <h2 className="font-sans text-3xl font-semibold leading-tight tracking-tight text-ink dark:text-white">
          Sign In
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted dark:text-ink-muted">
          Sign in to find nearby services, offer your skills, and manage your bookings.
        </p>
      </div>

      {/* Main Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-2" aria-busy={isLoading}>
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
            <label htmlFor="auth-password" className="block text-xs font-semibold text-ink-secondary dark:text-ink-secondary">
              Password
            </label>
            <button
              type="button"
              onClick={() => setMode('forgot')}
              className="text-xs font-bold text-brand-text hover:text-brand-action-hover dark:text-orange-400 dark:hover:text-orange-300 transition-colors focus:outline-none cursor-pointer"
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
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-subtle dark:text-ink-subtle hover:text-ink-secondary dark:hover:text-ink-secondary cursor-pointer focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </AuthInput>
        </div>

        {/* Submit button with Tactile Physics */}
        <AuthCaptcha model={captcha} isDark={isDark} />
        <div className="pt-3">
          <button
            type="submit"
            disabled={isLoading || captcha.blocked}
            className="servicehub-dark-cta flex w-full items-center justify-center gap-2 rounded-xl bg-charcoal py-3 text-sm font-bold text-white transition-all hover:bg-charcoal active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand-on-dark dark:text-charcoal dark:hover:bg-orange-400"
          >
            {isLoading ? (
              <span className="relative z-10">Signing in...</span>
            ) : (
              <span className="relative z-10">Sign In</span>
            )}
          </button>
          {isLoading && <div className="brand-loading__track mt-2" role="status" aria-label="Signing in"><span /></div>}
        </div>
      </form>

      {/* Divider OR */}
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-black/[0.08] dark:border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-[10px]">
          <span className="bg-[#fffdfa] px-3 font-bold uppercase tracking-widest text-ink-muted dark:bg-charcoal dark:text-ink-muted">
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
        disabled={isLoading}
      />

      {/* Footer Switcher */}
      <div className="text-center text-xs pt-3.5 border-t border-black/[0.06] dark:border-white/10">
        <span className="text-ink-muted dark:text-ink-muted">
          Don&apos;t have an account?
        </span>
        <button
          type="button"
          onClick={toggleMode}
          className="font-bold text-brand-text hover:text-brand-action-hover dark:text-orange-400 dark:hover:text-orange-300 ml-1.5 cursor-pointer focus:outline-none transition-colors"
        >
          Register here
        </button>
      </div>
    </div>
  );
}
