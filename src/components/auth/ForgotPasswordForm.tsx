import React, { FormEvent } from 'react';
import AuthInput from './shared/AuthInput';

interface ForgotPasswordFormProps {
  formData: any;
  handleInputChange: (e: any) => void;
  fieldErrors: Record<string, string>;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  accentText: string;
  accentBg: string;
  setMode: (mode: 'login' | 'signup' | 'forgot' | 'reset') => void;
}

export default function ForgotPasswordForm({
  formData,
  handleInputChange,
  fieldErrors,
  handleSubmit,
  accentText,
  accentBg,
  setMode,
}: ForgotPasswordFormProps) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Header Info */}
      <div className="text-center lg:text-left">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
          Forgot Password
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs">
          Enter your email address to receive a secure password reset link.
        </p>
      </div>

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

        <div className="pt-1.5">
          <button
            type="submit"
            className="w-full py-2.5 bg-[#FF5A1F] hover:bg-[#e04f1a] active:scale-[0.98] text-white rounded-lg font-bold text-sm shadow-sm transition-all cursor-pointer"
          >
            Send Reset Link
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
