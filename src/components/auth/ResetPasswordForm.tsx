import React, { FormEvent, useState } from 'react';
import { Check, Circle, Eye, EyeOff } from 'lucide-react';
import { passwordRequirements, strongPasswordSchema } from '../../schema/auth/passwordValidation';
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
  isLoading?: boolean;
}

export default function ResetPasswordForm({
  formData,
  fieldErrors,
  showPassword,
  setShowPassword,
  handleSubmit,
  setMode,
  register,
  isLoading = false,
}: ResetPasswordFormProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const validation = strongPasswordSchema.safeParse(formData.password);
  const mismatch = Boolean(formData.confirmPassword && formData.password !== formData.confirmPassword);
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Header Info */}
      <div className="text-left">
        <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-[#c86544]/30 bg-[#c86544]/[0.08] px-3 py-0.5 text-[11px] font-semibold text-[#aa5032] dark:border-orange-500/30 dark:bg-orange-950/40 dark:text-orange-300">
          <span>Security</span>
        </div>
        <h2 className="font-sans text-2xl font-semibold text-ink dark:text-white tracking-tight leading-tight">
          Reset Password
        </h2>
        <p className="mt-1 text-ink-muted dark:text-ink-muted text-xs sm:text-sm leading-relaxed">
          Choose a new secure password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5 pt-1" aria-busy={isLoading}>
        <div className="space-y-0.5">
          <label htmlFor="auth-password" className="block text-xs font-semibold text-ink dark:text-ink mb-1">
            New Password
          </label>
          <AuthInput
            label=""
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your new password"
            autoComplete="new-password"
            error={formData.password && !validation.success ? validation.error.issues[0].message : fieldErrors.password}
            {...register('password')}
          >
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide new password' : 'Show new password'}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 w-11 flex items-center justify-center text-ink-muted dark:text-ink-secondary cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </AuthInput>
        </div>
        <ul className="grid gap-1 text-xs" aria-label="Password requirements">{passwordRequirements.map(rule => <li key={rule.label} className={`flex items-center gap-2 ${rule.test(formData.password) ? 'text-emerald-700 dark:text-emerald-300' : 'text-ink-muted dark:text-ink-muted'}`}>{rule.test(formData.password) ? <Check size={14} /> : <Circle size={12} />}{rule.label}</li>)}</ul>
        <AuthInput label="Confirm New Password" type={showConfirm ? 'text' : 'password'} autoComplete="new-password" error={mismatch ? 'Passwords do not match.' : fieldErrors.confirmPassword} {...register('confirmPassword')}>
          <button type="button" aria-label={showConfirm ? 'Hide confirmation password' : 'Show confirmation password'} aria-pressed={showConfirm} onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 w-11 flex items-center justify-center text-ink-muted dark:text-ink-secondary cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2">{showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}</button>
        </AuthInput>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || !validation.success || !formData.confirmPassword || mismatch}
            className="w-full min-h-11 py-2.5 bg-[#c86544] hover:bg-[#aa5032] text-white rounded-xl font-bold text-sm shadow-md shadow-orange-950/15 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Resetting password…' : 'Reset Password'}
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
