'use client';

import { useEffect, useRef, useState } from 'react';

interface RecaptchaApi {
  render(container: HTMLElement, options: {
    sitekey: string; theme: 'light' | 'dark'; size: 'normal' | 'compact';
    callback: (token: string) => void;
    'expired-callback': () => void;
    'error-callback': () => void;
  }): number;
  reset(widgetId: number): void;
}
declare global {
  interface Window {
    grecaptcha?: RecaptchaApi;
    serviceHubRecaptchaReady?: () => void;
  }
}

let sdkRequest: Promise<RecaptchaApi> | undefined;
function loadRecaptcha(): Promise<RecaptchaApi> {
  if (window.grecaptcha?.render) return Promise.resolve(window.grecaptcha);
  if (sdkRequest) return sdkRequest;
  sdkRequest = new Promise<RecaptchaApi>((resolve, reject) => {
    const script = document.createElement('script');
    const failed = () => {
      window.clearTimeout(timeout);
      script.remove();
      sdkRequest = undefined;
      reject(new Error('Security check could not load.'));
    };
    const timeout = window.setTimeout(failed, 10_000);
    // Google requires the named onload callback to exist before its script loads.
    window.serviceHubRecaptchaReady = () => {
      if (!window.grecaptcha?.render) { failed(); return; }
      window.clearTimeout(timeout);
      resolve(window.grecaptcha);
    };
    script.src = 'https://www.google.com/recaptcha/api.js?onload=serviceHubRecaptchaReady&render=explicit';
    script.async = true;
    script.defer = true;
    script.onerror = failed;
    document.head.appendChild(script);
  });
  return sdkRequest;
}

export default function RecaptchaCheckbox({ siteKey, isDark, resetKey, onToken }: {
  siteKey: string; isDark: boolean; resetKey: number; onToken: (token: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const widget = useRef<{ api: RecaptchaApi; id: number } | null>(null);
  const callback = useRef(onToken);
  const [status, setStatus] = useState<'loading' | 'ready' | 'expired' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [size, setSize] = useState<'normal' | 'compact' | null>(null);

  useEffect(() => { callback.current = onToken; }, [onToken]);
  useEffect(() => {
    let active = true;
    const measure = () => { if (active && container.current) setSize(container.current.clientWidth < 304 ? 'compact' : 'normal'); };
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    if (container.current) observer?.observe(container.current);
    window.addEventListener('resize', measure);
    queueMicrotask(measure);
    return () => { active = false; observer?.disconnect(); window.removeEventListener('resize', measure); };
  }, []);
  useEffect(() => {
    if (!size) return;
    let active = true;
    const host = container.current;
    // A fresh child isolates Google's iframe from React and development effect replay.
    const element = document.createElement('div');
    host?.appendChild(element);
    queueMicrotask(() => { if (active) { setStatus('loading'); callback.current(''); } });
    void loadRecaptcha().then((api) => {
      if (!active || !host) return;
      try {
        const id = api.render(element, {
          sitekey: siteKey, theme: isDark ? 'dark' : 'light',
          size,
          callback: (token) => { if (active) { callback.current(token); setStatus('ready'); } },
          'expired-callback': () => { if (active) { callback.current(''); setStatus('expired'); } },
          'error-callback': () => { if (active) { callback.current(''); setStatus('error'); } },
        });
        widget.current = { api, id };
        setStatus('ready');
      } catch { callback.current(''); setStatus('error'); }
    }).catch(() => { if (active) { callback.current(''); setStatus('error'); } });
    return () => {
      active = false;
      if (widget.current) {
        try { widget.current.api.reset(widget.current.id); } catch { /* Google may have removed an expired frame. */ }
        widget.current = null;
      }
      element.remove();
    };
  }, [siteKey, isDark, attempt, size]);

  useEffect(() => {
    if (widget.current) {
      try { widget.current.api.reset(widget.current.id); }
      catch { callback.current(''); queueMicrotask(() => setStatus('error')); }
    }
  }, [resetKey]);

  return (
    <div className="space-y-2">
      <div ref={container} className="min-h-[78px] w-full" aria-label="Google security verification" />
      {status === 'loading' && <p role="status" className="text-sm text-ink-muted">Loading security check…</p>}
      {status === 'expired' && <p role="status" className="text-sm text-ink-muted">The check expired. Complete it again to continue.</p>}
      {status === 'error' && (
        <div role="alert" className="space-y-2 text-sm text-rose-700 dark:text-rose-300">
          <p>The security check could not load. Check your connection or browser settings, then retry.</p>
          <button type="button" onClick={() => setAttempt((current) => current + 1)} className="rounded-lg border border-current px-3 py-2 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2">Retry security check</button>
        </div>
      )}
    </div>
  );
}
