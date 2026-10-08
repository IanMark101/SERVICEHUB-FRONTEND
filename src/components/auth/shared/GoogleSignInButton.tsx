import React, { useEffect } from 'react';
import { bindGoogleIdentity, type GoogleCredentialResponse } from '@/lib/googleIdentity';

interface GoogleSignInButtonProps {
  onSuccess: (idToken: string) => void;
  onError: (msg: string) => void;
  isDark: boolean;
  mode: string;
  step?: number;
  disabled?: boolean;
}

export default function GoogleSignInButton({
  onSuccess,
  onError,
  isDark,
  mode,
  disabled = false,
}: GoogleSignInButtonProps) {
  const container = React.useRef<HTMLDivElement>(null);
  const handlers = React.useRef({ onSuccess, onError, disabled });
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = React.useState(0);

  useEffect(() => {
    handlers.current = { onSuccess, onError, disabled };
  }, [onSuccess, onError, disabled]);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    let active = true;
    let initialized = false;
    let releaseIdentity: (() => void) | undefined;
    const failed = () => {
      if (!active) return;
      window.clearTimeout(timeout);
      setStatus('error');
      handlers.current.onError('Google sign-in could not load. Check your connection and retry, or sign in with email and password.');
      if (!window.google?.accounts?.id && script) script.dataset.servicehubFailed = 'true';
    };

    const initializeGoogle = () => {
      if (!active || initialized) return;
      const google = window.google?.accounts?.id;
      if (!google || !container.current) { failed(); return; }
      try {
        releaseIdentity = bindGoogleIdentity(google, {
          client_id: clientId,
          auto_select: false,
          cancel_on_tap_outside: true,
          // Let supported browsers mediate sign-in without popup postMessage.
          use_fedcm_for_button: true,
        }, (response: GoogleCredentialResponse) => {
          if (active && !handlers.current.disabled && response?.credential) {
            handlers.current.onSuccess(response.credential);
          }
        });
        initialized = true;
        window.clearTimeout(timeout);
        setStatus('ready');
      } catch { failed(); }
    };

    let script = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    ) as HTMLScriptElement | null;

    if (script?.dataset.servicehubFailed === 'true') {
      script.remove();
      script = null;
    }

    if (!script) {
      script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
    }
    script.addEventListener('load', initializeGoogle);
    script.addEventListener('error', failed);
    const timeout = window.setTimeout(() => { if (!initialized) failed(); }, 10_000);
    if (!script.isConnected) document.body.appendChild(script);
    if (window.google?.accounts?.id) queueMicrotask(initializeGoogle);

    return () => {
      active = false;
      releaseIdentity?.();
      window.clearTimeout(timeout);
      script.removeEventListener('load', initializeGoogle);
      script.removeEventListener('error', failed);
    };
  }, [attempt]);

  // Theme and label changes do not change the shared GSI configuration.
  useEffect(() => {
    const google = window.google?.accounts?.id;
    if (status !== 'ready' || !google || !container.current) return;
    let active = true;
    queueMicrotask(() => {
      if (!active || !container.current) return;
      try {
        container.current.replaceChildren();
        google.renderButton(container.current, {
          theme: isDark ? 'filled_black' : 'outline',
          size: 'large',
          shape: 'rectangular',
          width: 380,
        });
      } catch {
        setStatus('error');
        handlers.current.onError('Google sign-in could not load. Check your connection and retry, or sign in with email and password.');
      }
    });
    return () => { active = false; };
  }, [isDark, status, attempt]);

  const hasClientId = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <div className="w-full mb-3">
      <div className="relative w-full group overflow-hidden rounded-xl">
        {/* Visual Custom Button */}
        <div className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 dark:bg-charcoal hover:dark:bg-charcoal border border-slate-200 dark:border-slate-800 text-ink-secondary dark:text-white rounded-xl py-3 px-4 font-semibold text-sm transition-all duration-150 shadow-sm cursor-pointer select-none">
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.355 0 3.39 2.673 1.482 6.564l3.784 3.201z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.275c0-.818-.073-1.636-.218-2.433H12v4.613h6.448c-.278 1.472-1.11 2.718-2.355 3.554l3.664 2.84c2.146-1.98 3.382-4.89 3.382-8.574z"
            />
            <path
              fill="#FBBC05"
              d="M5.266 14.235A7.172 7.172 0 0 1 4.909 12c0-.78.127-1.536.357-2.235L1.482 6.564A11.954 11.954 0 0 0 0 12c0 1.942.463 3.774 1.282 5.418l3.984-3.183z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.973-1.08 7.964-2.924l-3.664-2.84c-1.018.682-2.318 1.082-4.3 1.082-3.3 0-6.1-2.236-7.1-5.236L1.118 17.265C3.018 21.164 6.982 24 12 24z"
            />
          </svg>
          <span className="tracking-wide">
            {disabled ? 'Signing in...' : hasClientId && status === 'loading' ? 'Loading Google...' : status === 'error' ? 'Retry Google sign-in' : mode === 'signup' ? 'Continue with Google' : 'Sign in with Google'}
          </span>
        </div>

        {/* Invisible Google Official GSI Target */}
        {hasClientId && (
          <div
            ref={container}
            id="google-signin-btn-hidden"
            inert={disabled || status !== 'ready'}
            className="absolute inset-0 w-full h-full opacity-[0.0001] cursor-pointer overflow-hidden z-10 flex items-center justify-center [&_iframe]:!w-full [&_iframe]:!h-full [&>div]:!w-full [&>div]:!h-full"
          />
        )}
        {(!hasClientId || status !== 'ready') && (
          <button
            type="button"
            disabled={disabled || (hasClientId && status === 'loading')}
            aria-label={hasClientId ? status === 'error' ? 'Retry Google sign-in' : 'Loading Google sign-in' : 'Sign in with Google'}
            onClick={() => {
              if (!hasClientId) { onError('Google sign-in is unavailable. Please sign in with email and password.'); return; }
              onError('');
              setStatus('loading');
              setAttempt(previous => previous + 1);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        )}
      </div>
    </div>
  );
}
