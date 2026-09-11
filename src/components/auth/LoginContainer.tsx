import Image from 'next/image';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthForm from '../../schema/auth/useAuthForm';
import { useApp } from '../../context/AppContext';
import AuthLeftPanel from './AuthLeftPanel';
import LoginForm from './LoginForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import ResetPasswordForm from './ResetPasswordForm';
import { AuthLayout } from './AuthLayout';

export interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'seeker' | 'provider' | 'admin';
  avatarUrl: string;
  bio: string;
  phone: string;
  location?: string;
  trustScore?: number;
  verificationStatus?: string;
  emailVerified?: boolean;
  onboardingStatus?: 'PENDING' | 'COMPLETED' | 'SKIPPED';
  isActive?: boolean;
}

interface LoginContainerProps {
  onLoginSuccess: (userData: UserSession) => void;
  onBackToHome?: () => void;
}

export default function LoginContainer({ onLoginSuccess, onBackToHome }: LoginContainerProps) {
  const { isDark, toggleTheme } = useApp();
  const router = useRouter();
  const [initialResetToken] = useState(() => typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('resetToken') || '');
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>(() => initialResetToken ? 'reset' : 'login');
  const {
    formData, step, showPassword, setShowPassword, error, setError, successMsg,
    fieldErrors, register, handleGoogleSuccessResponse, handleSubmit, isLoading,
  } = useAuthForm({ onLoginSuccess, mode, setMode, initialResetToken });

  return (
    <AuthLayout theme="orange">
      <AuthLeftPanel mode={mode} step={step} accentBg="bg-orange-600 hover:bg-orange-500" onBackToHome={onBackToHome} />

      <section className="flex min-h-[100dvh] flex-col bg-[#fbfaf7] px-5 py-5 dark:bg-[#171715] sm:px-8 md:px-12 lg:px-16">
        <div className="flex items-center justify-between md:hidden">
          <button type="button" onClick={onBackToHome} className="grid size-10 place-items-center rounded-xl border border-stone-200 bg-white text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-200" aria-label="Back to landing page"><ArrowLeft size={17} /></button>
          <div className="flex items-center gap-2.5"><Image src="/logo.svg" alt="" width={34} height={34} className="size-8 rounded-lg" /><span className="text-sm font-extrabold">ServiceHub Cordova</span></div>
          <button type="button" onClick={toggleTheme} className="grid size-10 place-items-center rounded-xl border border-stone-200 bg-white text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-200" aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>{isDark ? <Sun size={17} /> : <Moon size={17} />}</button>
        </div>

        <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-center py-10 md:py-14">
          {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
          {successMsg && <div role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">{successMsg}</div>}

          <div className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-[0_20px_60px_rgba(28,25,23,0.08)] dark:border-white/10 dark:bg-[#1d1d1a] dark:shadow-none sm:p-8">
            {mode === 'login' && <LoginForm formData={formData} fieldErrors={fieldErrors} showPassword={showPassword} setShowPassword={setShowPassword} handleGoogleSuccessResponse={handleGoogleSuccessResponse} setError={setError} handleSubmit={handleSubmit} isDark={isDark} accentText="text-orange-600 dark:text-orange-400" setMode={setMode} toggleMode={() => router.push('/register')} register={register} isLoading={isLoading} />}
            {mode === 'forgot' && <ForgotPasswordForm formData={formData} fieldErrors={fieldErrors} handleSubmit={handleSubmit} accentText="text-orange-600 dark:text-orange-400" accentBg="bg-orange-600 hover:bg-orange-700" setMode={setMode} register={register} />}
            {mode === 'reset' && <ResetPasswordForm formData={formData} fieldErrors={fieldErrors} showPassword={showPassword} setShowPassword={setShowPassword} handleSubmit={handleSubmit} accentText="text-orange-600 dark:text-orange-400" accentBg="bg-orange-600 hover:bg-orange-700" setMode={setMode} register={register} />}
          </div>
          <p className="mt-6 text-center text-[11px] leading-5 text-slate-500 dark:text-stone-400">Protected by account security controls. Verification limits marketplace actions, not access to your account.</p>
        </div>
      </section>
    </AuthLayout>
  );
}
