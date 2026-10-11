'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiGetCaptchaPolicy, type CaptchaPolicy } from '@/api/auth.api';
import { getApiErrorBody } from '@/lib/api/errors';

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';
type PolicyState = { mode: AuthMode; status: 'loading' | 'ready' | 'error'; policy?: CaptchaPolicy };

export default function useAuthCaptcha(mode: AuthMode) {
  const [state, setState] = useState<PolicyState>({ mode, status: 'loading' });
  const [proof, setProof] = useState({ mode, token: '', resetKey: 0 });
  const request = useRef<AbortController | null>(null);
  // Ignore a pending form's callbacks after the user moves to another form.
  const scope = useMemo(() => Symbol(mode), [mode]);
  const activeScope = useRef<symbol | null>(scope);

  const reload = useCallback(async (forceLoginChallenge = false) => {
    if (activeScope.current !== scope || mode === 'reset') return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setState({ mode, status: 'loading' });
    setProof((current) => ({ mode, token: '', resetKey: current.resetKey + 1 }));
    try {
      const policy = await apiGetCaptchaPolicy(controller.signal);
      if (!controller.signal.aborted && activeScope.current === scope) setState({
        mode, status: 'ready', policy: forceLoginChallenge && policy.enabled
          ? { ...policy, loginRequired: true } : policy,
      });
    } catch {
      if (!controller.signal.aborted && activeScope.current === scope) setState({ mode, status: 'error' });
    }
  }, [mode, scope]);

  useEffect(() => {
    activeScope.current = scope;
    let active = true;
    queueMicrotask(() => { if (active && mode !== 'reset') void reload(); });
    return () => { active = false; activeScope.current = null; request.current?.abort(); };
  }, [mode, reload, scope]);

  const setToken = useCallback((token: string) => {
    if (activeScope.current !== scope) return;
    setProof((current) => ({ mode, token, resetKey: current.resetKey }));
  }, [mode, scope]);
  const reset = useCallback(() => {
    if (activeScope.current !== scope) return;
    setProof((current) => ({ mode, token: '', resetKey: current.resetKey + 1 }));
  }, [mode, scope]);
  const handleFailure = useCallback((error: unknown) => {
    if (activeScope.current !== scope || mode === 'reset') return;
    const code = getApiErrorBody(error)?.code;
    if (code === 'CAPTCHA_REQUIRED' || code === 'CAPTCHA_UNAVAILABLE') {
      // Refresh keys and enablement too: open signup/recovery forms may have
      // loaded their settings before a backend configuration change.
      void reload(mode === 'login');
    } else if (mode === 'login') {
      // The server owns the failed-login count. Re-read its policy after a failure.
      void reload();
    }
  }, [mode, reload, scope]);

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
