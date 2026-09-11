import React, { FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import AuthInput from './shared/AuthInput';
import type { UseFormRegister } from 'react-hook-form';
import type { AuthFormValues } from '../../schema/auth/useAuthForm';

interface ResetPasswordFormProps {
  formData: AuthFormValues;
  fieldErrors: Record<string, string>;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  accentText: string;
  accentBg: string;
  setMode: (mode: 'login' | 'signup' | 'forgot' | 'reset') => void;
  register: UseFormRegister<AuthFormValues>;
}

export default function ResetPasswordForm({
  fieldErrors,
  showPassword,
  setShowPassword,
  handleSubmit,
  setMode,
  register,
}: ResetPasswordFormProps) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Header Info */}
      <div className="text-left">
        <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-[#c86544]/30 bg-[#c86544]/[0.08] px-3 py-0.5 text-[11px] font-semibold text-[#aa5032] dark:border-orange-500/30 dark:bg-orange-950/40 dark:text-orange-300">
          <span>Security</span>
        </div>
        <h2 className="font-sans text-2xl font-semibold text-[#0a0a0a] dark:text-white tracking-tight leading-tight">
          Reset Password
        </h2>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm leading-relaxed">
          Choose a new secure password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
        <div className="space-y-0.5">
          <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
            New Password
          </label>
          <AuthInput
            label=""
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your new password"
            error={fieldErrors.password}
            {...register('password')}
          >
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 cursor-pointer focus:outline-none"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </AuthInput>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-2.5 bg-[#c86544] hover:bg-[#aa5032] active:scale-[0.98] text-white rounded-xl font-bold text-sm shadow-md shadow-orange-950/15 transition-all cursor-pointer"
          >
            Reset Password
          </button>
        </div>
      </form>

      {/* Footer Back Link */}
      <div className="text-center text-sm pt-3 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setMode('login')}
          className="font-bold text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400 cursor-pointer focus:outline-none transition-colors"
        >
          Back to Log in
        </button>
      </div>

    </div>
  );
}
