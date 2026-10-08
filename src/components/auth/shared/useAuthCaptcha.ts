'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiGetCaptchaPolicy, type CaptchaPolicy } from '@/api/auth.api';
import { getApiErrorBody } from '@/lib/api/errors';

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';
type PolicyState = { mode: AuthMode; status: 'loading' | 'ready' | 'error'; policy?: CaptchaPolicy };

export default function useAuthCaptcha(mode: AuthMode) {
  const [state, setState] = useState<PolicyState>({ mode, status: 'loading' });
  const [proof, setProof] = useState({ mode, token: '', resetKey: 0 });
  const request = useRef<AbortController | null>(null);

  const reload = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setState({ mode, status: 'loading' });
    setProof((current) => ({ mode, token: '', resetKey: current.resetKey + 1 }));
    try {
      const policy = await apiGetCaptchaPolicy(controller.signal);
      if (!controller.signal.aborted) setState({ mode, status: 'ready', policy });
    } catch {
      if (!controller.signal.aborted) setState({ mode, status: 'error' });
    }
  }, [mode]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => { if (active && mode !== 'reset') void reload(); });
    return () => { active = false; request.current?.abort(); };
  }, [mode, reload]);

  const setToken = useCallback((token: string) => {
    setProof((current) => ({ mode, token, resetKey: current.resetKey }));
  }, [mode]);
  const reset = useCallback(() => {
    setProof((current) => ({ mode, token: '', resetKey: current.resetKey + 1 }));
  }, [mode]);
  const handleFailure = useCallback((error: unknown) => {
    const code = getApiErrorBody(error)?.code;
    if (mode === 'login') {
      if (code === 'CAPTCHA_REQUIRED' || code === 'CAPTCHA_UNAVAILABLE') {
        setState((current) => current.policy
          ? { mode, status: 'ready', policy: { ...current.policy, enabled: true, loginRequired: true } }
          : { mode, status: 'error' });
      } else {
        // The server owns the failed-login count. Re-read its policy after a failure.
        void reload();
      }
    }
  }, [mode, reload]);

  const status = mode === 'reset' ? 'ready' : state.mode === mode ? state.status : 'loading';
  const policy = state.mode === mode ? state.policy : undefined;
  const required = mode !== 'reset' && Boolean(policy?.enabled && (mode !== 'login' || policy.loginRequired));
  const token = proof.mode === mode ? proof.token : '';

  return {
    status, required, siteKey: policy?.siteKey || '', token, resetKey: proof.resetKey,
    blocked: status !== 'ready' || (required && !token),
    setToken, reset, reload, handleFailure,
  };
}

export type AuthCaptchaModel = ReturnType<typeof useAuthCaptcha>;
