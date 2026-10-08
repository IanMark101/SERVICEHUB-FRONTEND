import React, { FormEvent } from 'react';
import AuthInput from './shared/AuthInput';
import type { UseFormRegister } from 'react-hook-form';
import type { AuthFormValues } from '../../schema/auth/useAuthForm';
import AuthCaptcha from './shared/AuthCaptcha';
import type { AuthCaptchaModel } from './shared/useAuthCaptcha';

interface ForgotPasswordFormProps {
  captcha: AuthCaptchaModel;
  isDark: boolean;
  formData: AuthFormValues;
  fieldErrors: Record<string, string>;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  accentText: string;
  accentBg: string;
  setMode: (mode: 'login' | 'signup' | 'forgot' | 'reset') => void;
  register: UseFormRegister<AuthFormValues>;
  isLoading?: boolean;
}

export default function ForgotPasswordForm({
  captcha,
  isDark,
  fieldErrors,
  handleSubmit,
  setMode,
  register,
  isLoading = false,
}: ForgotPasswordFormProps) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header Info */}
      <div className="text-left">
        <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-[#c86544]/30 bg-[#c86544]/[0.08] px-3 py-0.5 text-[11px] font-semibold text-[#aa5032] dark:border-orange-500/30 dark:bg-orange-950/40 dark:text-orange-300">
          <span>Account Recovery</span>
        </div>
        <h2 className="font-sans text-2xl font-semibold text-ink dark:text-white tracking-tight leading-tight">
          Forgot Password
        </h2>
        <p className="mt-1 text-ink-muted dark:text-ink-muted text-xs sm:text-sm leading-relaxed">
          Enter your registered email address to receive a secure password reset link.
        </p>
        <p className="mt-2 text-ink-muted dark:text-ink-muted text-xs sm:text-sm leading-relaxed">If you only sign in with Google, continue with Google, then use Set Password in Settings to create a ServiceHub password.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
        <AuthInput
          label="Email"
          type="email"
          placeholder="your.name@example.com"
          error={fieldErrors.email}
          {...register('email')}
        />

        <AuthCaptcha model={captcha} isDark={isDark} />
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || captcha.blocked}
            className="w-full py-2.5 bg-[#c86544] hover:bg-[#aa5032] active:scale-[0.98] text-white rounded-xl font-bold text-sm shadow-md shadow-orange-950/15 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </div>
      </form>

      {/* Footer Back Link */}
      <div className="text-center text-xs pt-3.5 border-t border-black/[0.06] dark:border-white/10">
        <button
          type="button"
          onClick={() => setMode('login')}
          className="font-bold text-[#c86544] hover:text-[#aa5032] dark:text-orange-400 dark:hover:text-orange-300 cursor-pointer focus:outline-none transition-colors"
        >
          Back to Log In
        </button>
      </div>
    </div>
  );
}
