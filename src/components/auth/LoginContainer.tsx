import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, CircleAlert, Moon, Sun } from 'lucide-react';
import useAuthForm from '../../schema/auth/useAuthForm';
import AuthLeftPanel from './AuthLeftPanel';
import LoginForm from './LoginForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import ResetPasswordForm from './ResetPasswordForm';
import { useApp } from '../../context/AppContext';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';

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
  moderationStatus?: string;
}

interface LoginContainerProps {
  onLoginSuccess: (userData: UserSession) => void;
  onBackToHome?: () => void;
}

export default function LoginContainer({
  onLoginSuccess,
  onBackToHome,
}: LoginContainerProps) {
  const { isDark, toggleTheme, authLoading } = useApp();
  const router = useRouter();
  const [theme] = useState<'orange'>('orange');
  const [initialResetToken, setInitialResetToken] = useState('');
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');
  const [sessionNotice, setSessionNotice] = useState(false);
  const [deletionNotice, setDeletionNotice] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- Browser URL/storage hints must initialize after hydration to match the server form. */
  React.useEffect(() => {
    // The server and first client render show the same public form. Browser-only
    // recovery links and notices initialize after hydration, independently of auth.
    const url = new URL(window.location.href);
    const token = url.searchParams.get('resetToken') || '';
    if (token) {
      setInitialResetToken(token);
      setMode('reset');
    } else if (url.searchParams.get('mode') === 'forgot') setMode('forgot');
  }, []);

  React.useEffect(() => {
    const url = new URL(window.location.href);
    const storedNotice = window.sessionStorage.getItem('servicehub:auth-notice');
    const hasNotice = (reason: string) => url.searchParams.get('reason') === reason || storedNotice === reason;
    if (hasNotice('session-expired')) setSessionNotice(true);
    if (hasNotice('account-deleted')) setDeletionNotice(true);
    if (hasNotice('password-changed')) setPasswordNotice(true);
  }, [authLoading]);
  /* eslint-enable react-hooks/set-state-in-effect */

  React.useEffect(() => {
    if (!sessionNotice && !deletionNotice && !passwordNotice) return;
    const url = new URL(window.location.href);
    window.sessionStorage.removeItem('servicehub:auth-notice');
    if (['session-expired', 'account-deleted', 'password-changed'].includes(url.searchParams.get('reason') || '')) {
      url.searchParams.delete('reason');
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }
  }, [sessionNotice, deletionNotice, passwordNotice]);

  const {
    captcha,
    formData,
    step,
    showPassword,
    setShowPassword,
    error,
    setError,
    successMsg,
    fieldErrors,
    register,
    handleGoogleSuccessResponse,
    handleSubmit,
    isLoading,
  } = useAuthForm({
    onLoginSuccess,
    mode,
    setMode,
    initialResetToken,
  });

  const toggleMode = () => {
    router.push('/register');
  };

  const accentText = 'text-brand-text dark:text-orange-400';
  const accentBg = 'bg-brand-action hover:bg-brand-action-hover';

  return (
    <AuthLayout theme={theme}>
      {/* Left Panel: Redesigned Branding/Intro Visuals */}
      <AuthLeftPanel
        mode={mode}
        step={step}
        accentBg={accentBg}
        onBackToHome={onBackToHome}
      />

      {/* Right Panel: the panel itself is the form surface */}
      <main className="auth-form-panel relative z-10 min-h-[100dvh] w-full border-black/[0.06] bg-[#fffdfa] transition-colors duration-300 dark:border-white/10 dark:bg-charcoal lg:w-1/2 lg:border-l">
        <div className="auth-form-panel__inner mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col px-5 py-5 sm:px-8 sm:py-7 lg:px-14 xl:px-20">
        {/* Mobile-Only Header Bar */}
        <div className="mb-8 flex w-full items-center justify-between lg:hidden">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted dark:text-ink-secondary hover:text-ink dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg?v=7"
              alt="ServiceHub Logo"
              width={26}
              height={26}
              className="size-6.5 rounded-lg"
            />
            <span className="text-xs font-semibold tracking-tight text-ink dark:text-white">
              ServiceHub
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              className="ml-1 grid size-9 place-items-center rounded-xl border border-black/[0.08] bg-white text-ink-muted transition-colors hover:text-ink dark:border-white/10 dark:bg-charcoal dark:text-ink-secondary dark:hover:text-white"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        <div className="auth-form-panel__content flex flex-1 items-center py-6 lg:py-10">
        <div className="mx-auto w-full max-w-[27rem]">

          {deletionNotice && mode === 'login' && <div role="status" className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-ink dark:border-neutral-700 dark:bg-charcoal dark:text-ink"><p className="font-semibold">Your account has been deleted</p><p className="mt-1 text-sm leading-relaxed">Your account and its associated database records were permanently deleted. Every device was signed out.</p></div>}
          {sessionNotice && !deletionNotice && mode === 'login' && (
            <div role="status" className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-200">
              <CircleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs font-bold">Your session ended</p>
                <p className="mt-0.5 text-xs leading-relaxed opacity-85">Sign in again to continue. Your account and saved marketplace activity are unchanged.</p>
              </div>
            </div>
          )}
          
          {passwordNotice && <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"><p className="font-semibold">Password changed successfully</p><p className="mt-1">Every device was signed out for security. Sign in with your new password or your connected Google account.</p></div>}
          {/* Error Message Banner */}
          {error && (
            <div role="alert" className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-medium animate-in fade-in duration-150">
              {error}
            </div>
          )}

          {/* Success Message Banner */}
          {successMsg && (
            <div role="status" className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-medium animate-in fade-in duration-150">
              {successMsg}
            </div>
          )}

          {/* Dynamic Form Render based on Active mode */}
          {mode === 'login' && (
            <LoginForm
              captcha={captcha}
              formData={formData}
              fieldErrors={fieldErrors}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              handleGoogleSuccessResponse={handleGoogleSuccessResponse}
              setError={setError}
              handleSubmit={handleSubmit}
              isDark={isDark}
              accentText={accentText}
              setMode={setMode}
              toggleMode={toggleMode}
              register={register}
              isLoading={isLoading}
            />
          )}

          {mode === 'forgot' && (
            <ForgotPasswordForm
              captcha={captcha}
              isDark={isDark}
              isLoading={isLoading}
              formData={formData}
              fieldErrors={fieldErrors}
              handleSubmit={handleSubmit}
              accentText={accentText}
              accentBg={accentBg}
              setMode={setMode}
              register={register}
            />
          )}

          {mode === 'reset' && (
            <ResetPasswordForm
              isLoading={isLoading}
              formData={formData}
              fieldErrors={fieldErrors}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              handleSubmit={handleSubmit}
              accentText={accentText}
              accentBg={accentBg}
              setMode={setMode}
              register={register}
            />
          )}
        </div>
        </div>
        </div>
      </main>
    </AuthLayout>
  );
}
