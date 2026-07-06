import React, { useEffect } from 'react';

interface GoogleSignInButtonProps {
  onSuccess: (idToken: string) => void;
  onError: (msg: string) => void;
  isDark: boolean;
  mode: string;
  step?: number;
}

export default function GoogleSignInButton({
  onSuccess,
  onError,
  isDark,
  mode,
  step,
}: GoogleSignInButtonProps) {
  useEffect(() => {
    let script = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    ) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    const initAndRenderBtn = () => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (clientId && (window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            onSuccess(response.credential);
          },
        });

        const btnContainer = document.getElementById('google-signin-btn');
        if (btnContainer) {
          (window as any).google.accounts.id.renderButton(btnContainer, {
            theme: isDark ? 'filled_black' : 'outline',
            size: 'large',
            shape: 'pill',
            width: btnContainer.offsetWidth || 300,
          });
        }
      }
    };

    if ((window as any).google) {
      initAndRenderBtn();
    } else {
      script.onload = initAndRenderBtn;
    }

    return () => {
      const btnContainer = document.getElementById('google-signin-btn');
      if (btnContainer) {
        btnContainer.innerHTML = '';
      }
    };
  }, [mode, step, isDark, onSuccess]);

  const hasClientId = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (hasClientId) {
    return (
      <div className="w-full mb-3 flex flex-col items-center">
        <div id="google-signin-btn" className="w-full flex justify-center min-h-[40px]"></div>
      </div>
    );
  }

  return (
    <div className="w-full mb-3 flex flex-col items-center">
      <button
        type="button"
        onClick={() =>
          onError(
            'Google Sign-In is not configured yet. Please define NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment variables.'
          )
        }
        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 dark:bg-slate-900/40 hover:dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-white rounded-xl py-3.5 font-semibold text-sm transition-all shadow-sm hover:scale-[1.005] active:scale-[0.995] cursor-pointer"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
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
        <span>{mode === 'signup' ? 'Continue with Google' : 'Sign In via Google'}</span>
      </button>
    </div>
  );
}
