import React, { FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import AuthInput from './shared/AuthInput';

interface ResetPasswordFormProps {
  formData: any;
  handleInputChange: (e: any) => void;
  fieldErrors: Record<string, string>;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  accentText: string;
  accentBg: string;
  setMode: (mode: 'login' | 'signup' | 'forgot' | 'reset') => void;
}

export default function ResetPasswordForm({
  formData,
  handleInputChange,
  fieldErrors,
  showPassword,
  setShowPassword,
  handleSubmit,
  accentText,
  accentBg,
  setMode,
}: ResetPasswordFormProps) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Header Info */}
      <div>
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-[#f2efe9] tracking-tight">
          Reset Password
        </h3>
        <p className="text-slate-500 dark:text-[#b4b0a9] text-xs mt-1 leading-normal">
          Choose a new password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-0.5">
          <label className="block text-[10px] font-bold text-slate-500 dark:text-[#b4b0a9] uppercase tracking-wide">
            New Password
          </label>
          <AuthInput
            label=""
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your new password"
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

        <div className="pt-2">
          <button
            type="submit"
            className={`w-full ${accentBg} hover:opacity-95 text-white font-extrabold rounded-xl py-3 text-xs tracking-wider transition-all active:scale-[0.98] shadow-sm cursor-pointer`}
          >
            Reset Password
          </button>
        </div>
      </form>

      {/* Footer Back Link */}
      <div className="text-center text-xs pt-4 border-t border-slate-100 dark:border-neutral-800/40">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`font-bold ${accentText} hover:underline cursor-pointer focus:outline-none`}
        >
          Back to Log in
        </button>
      </div>

    </div>
  );
}
