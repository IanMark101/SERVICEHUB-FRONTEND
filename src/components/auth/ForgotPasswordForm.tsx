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
      <div>
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-[#f2efe9] tracking-tight">
          Forgot Password
        </h3>
        <p className="text-slate-500 dark:text-[#b4b0a9] text-xs mt-1 leading-normal">
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

        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-4 bg-[#FF5A1F] hover:bg-[#e04f1a] active:scale-[0.98] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#FF5A1F]/25 transition-all cursor-pointer"
          >
            Send Reset Link
          </button>
        </div>
      </form>

      {/* Footer Back Link */}
      <div className="text-center text-sm mt-8 pt-4 border-t border-slate-100 dark:border-neutral-800/40">
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
