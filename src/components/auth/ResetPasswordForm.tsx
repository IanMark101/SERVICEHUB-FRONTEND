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
      <div className="text-center lg:text-left">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
          Reset Password
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs">
          Choose a new password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-0.5">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
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
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 cursor-pointer focus:outline-none"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </AuthInput>
        </div>

        <div className="pt-1.5">
          <button
            type="submit"
            className="w-full py-2.5 bg-[#FF5A1F] hover:bg-[#e04f1a] active:scale-[0.98] text-white rounded-lg font-bold text-sm shadow-sm transition-all cursor-pointer"
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
          className="font-bold text-[#FF5A1F] hover:text-orange-400 cursor-pointer focus:outline-none transition-colors"
        >
          Back to Log in
        </button>
      </div>

    </div>
  );
}
