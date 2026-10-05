'use client';

import { useEffect, useRef } from 'react';
import type {} from '../../auth/shared/GoogleSignInButton';

interface Props { nonce: string; isDark: boolean; disabled: boolean; onSuccess: (credential: string) => void; onError: (message: string) => void }

export default function GoogleDeletionVerification({ nonce, isDark, disabled, onSuccess, onError }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const success = useRef(onSuccess);
  const failure = useRef(onError);
  const blocked = useRef(disabled);
  useEffect(() => { success.current = onSuccess; failure.current = onError; blocked.current = disabled; }, [onSuccess, onError, disabled]);
  useEffect(() => {
    let active = true;
    let initialized = false;
    const initialize = () => {
      if (!active || !container.current || !window.google?.accounts?.id) return;
      try {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!, nonce,
          auto_select: false, cancel_on_tap_outside: false, use_fedcm_for_button: true,
          callback: response => { if (active && !blocked.current && response.credential) success.current(response.credential); },
        });
        initialized = true;
        container.current.replaceChildren();
        window.google.accounts.id.renderButton(container.current, { theme: isDark ? 'filled_black' : 'outline', size: 'large', shape: 'rectangular', width: Math.max(200, Math.min(container.current.clientWidth, 380)) });
      } catch { failure.current('Google verification could not load. Start verification again.'); }
    };
    let script = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    if (!script) { script = document.createElement('script'); script.src = 'https://accounts.google.com/gsi/client'; script.async = true; document.body.appendChild(script); }
    const failed = () => { if (active) failure.current('Google verification could not load. Check your connection and try again.'); };
    script.addEventListener('load', initialize); script.addEventListener('error', failed);
    initialize();
    const timeout = window.setTimeout(() => { if (active && !initialized) failed(); }, 10_000);
    return () => { active = false; clearTimeout(timeout); script?.removeEventListener('load', initialize); script?.removeEventListener('error', failed); };
  }, [nonce, isDark]);
  return <div ref={container} className="account-deletion__google" inert={disabled} aria-label="Verify account with Google" />;
}
