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
            className={`w-full ${accentBg} hover:opacity-95 text-white font-extrabold rounded-xl py-3 text-xs tracking-wider transition-all active:scale-[0.98] shadow-sm cursor-pointer`}
          >
            Send Reset Link
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
