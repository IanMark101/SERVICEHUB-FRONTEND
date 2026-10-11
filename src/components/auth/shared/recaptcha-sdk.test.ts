import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RecaptchaApi } from './recaptcha-sdk';

const sdk: RecaptchaApi = { render: vi.fn(() => 1), reset: vi.fn() };
const scripts = () => document.querySelectorAll<HTMLScriptElement>('script[src^="https://www.google.com/recaptcha/api.js"]');

describe('Google checkbox SDK loading and recovery', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    delete window.grecaptcha;
    delete window.serviceHubRecaptchaReady;
  });
  afterEach(() => {
    scripts().forEach(script => script.remove());
    delete window.grecaptcha;
    delete window.serviceHubRecaptchaReady;
    vi.useRealTimers();
  });

  it('deduplicates concurrent loads and waits for the explicit Google onload callback', async () => {
    const { loadRecaptcha } = await import('./recaptcha-sdk');
    const first = loadRecaptcha();
    expect(loadRecaptcha()).toBe(first);
    expect(scripts()).toHaveLength(1);
    const script = scripts()[0];
    expect(script.async).toBe(true);
    expect(script.defer).toBe(true);
    expect(script.src).toContain('render=explicit');
    expect(window.serviceHubRecaptchaReady).toBeTypeOf('function');
    window.grecaptcha = sdk;
    window.serviceHubRecaptchaReady?.();
    expect(await first).toBe(sdk);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('allows retry after a network failure and ignores callbacks from the failed attempt', async () => {
    const { loadRecaptcha } = await import('./recaptcha-sdk');
    const first = loadRecaptcha();
    const failedScript = scripts()[0];
    const lateError = failedScript.onerror as (event: Event) => void;
    const lateReady = window.serviceHubRecaptchaReady;
    failedScript.dispatchEvent(new Event('error'));
    await expect(first).rejects.toThrow('could not load');
    expect(scripts()).toHaveLength(0);
    const retry = loadRecaptcha();
    lateError(new Event('error'));
    lateReady?.();
    expect(loadRecaptcha()).toBe(retry);
    expect(scripts()).toHaveLength(1);
    window.grecaptcha = sdk;
    window.serviceHubRecaptchaReady?.();
    expect(await retry).toBe(sdk);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('bounds a stalled load to ten seconds and releases it for retry', async () => {
    const { loadRecaptcha } = await import('./recaptcha-sdk');
    const first = loadRecaptcha();
    const rejected = expect(first).rejects.toThrow('could not load');
    await vi.advanceTimersByTimeAsync(10_000);
    await rejected;
    expect(scripts()).toHaveLength(0);
    const retry = loadRecaptcha();
    window.grecaptcha = sdk;
    window.serviceHubRecaptchaReady?.();
    expect(await retry).toBe(sdk);
  });

  it('fails closed when Google calls onload without a usable widget API', async () => {
    const { loadRecaptcha } = await import('./recaptcha-sdk');
    const request = loadRecaptcha();
    window.serviceHubRecaptchaReady?.();
    await expect(request).rejects.toThrow('could not load');
    expect(scripts()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('uses an already loaded API without injecting another script', async () => {
    const { loadRecaptcha } = await import('./recaptcha-sdk');
    window.grecaptcha = sdk;
    expect(await loadRecaptcha()).toBe(sdk);
    expect(scripts()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });
});
