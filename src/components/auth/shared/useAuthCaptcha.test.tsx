import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiGetCaptchaPolicy } from '@/api/auth.api';
import useAuthCaptcha from './useAuthCaptcha';

vi.mock('@/api/auth.api', () => ({ apiGetCaptchaPolicy: vi.fn() }));
vi.mock('@/lib/api/errors', () => ({ getApiErrorBody: (error: unknown) => error }));
const enabled = { enabled: true, siteKey: 'public-key', loginRequired: false };

describe('server-controlled CAPTCHA policy', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.mocked(apiGetCaptchaPolicy).mockResolvedValue(enabled); });

  it('requires a proof for registration and clears consumed tokens', async () => {
    const { result } = renderHook(() => useAuthCaptcha('signup'));
    expect(result.current.blocked).toBe(true);
    await waitFor(() => expect(result.current.required).toBe(true));
    act(() => result.current.setToken('one-use-proof'));
    expect(result.current.blocked).toBe(false);
    act(() => result.current.reset());
    expect(result.current.token).toBe('');
    expect(result.current.blocked).toBe(true);
  });

  it('refreshes login risk after failures and honors a server-required challenge', async () => {
    const { result } = renderHook(() => useAuthCaptcha('login'));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.required).toBe(false);
    expect(result.current.blocked).toBe(false);
    vi.mocked(apiGetCaptchaPolicy).mockResolvedValue({ ...enabled, loginRequired: true });
    act(() => result.current.handleFailure({ code: 'INVALID_CREDENTIALS' }));
    await waitFor(() => expect(result.current.required).toBe(true));
    act(() => result.current.setToken('answer'));
    expect(result.current.blocked).toBe(false);
    act(() => { result.current.handleFailure({ code: 'CAPTCHA_REQUIRED' }); result.current.reset(); });
    expect(result.current.required).toBe(true);
    expect(result.current.blocked).toBe(true);
  });

  it('blocks reset email requests when policy cannot load and supports retry', async () => {
    vi.mocked(apiGetCaptchaPolicy).mockRejectedValueOnce(new Error('Offline'));
    const { result } = renderHook(() => useAuthCaptcha('forgot'));
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.blocked).toBe(true);
    await act(() => result.current.reload());
    expect(result.current.required).toBe(true);
    expect(result.current.status).toBe('ready');
  });

  it('does not request CAPTCHA for a token-based password reset', () => {
    const { result } = renderHook(() => useAuthCaptcha('reset'));
    expect(result.current.blocked).toBe(false);
    expect(result.current.required).toBe(false);
    expect(apiGetCaptchaPolicy).not.toHaveBeenCalled();
  });

  it('preserves existing forms when the backend feature is disabled', async () => {
    vi.mocked(apiGetCaptchaPolicy).mockResolvedValue({ enabled: false, siteKey: '', loginRequired: false });
    const { result } = renderHook(() => useAuthCaptcha('forgot'));
    await waitFor(() => expect(result.current.blocked).toBe(false));
    expect(result.current.required).toBe(false);
  });

  it('does not carry a solved check between authentication modes', async () => {
    const { result, rerender } = renderHook(({ mode }) => useAuthCaptcha(mode), { initialProps: { mode: 'forgot' as 'login' | 'forgot' } });
    await waitFor(() => expect(result.current.required).toBe(true));
    act(() => result.current.setToken('forgot-proof'));
    rerender({ mode: 'login' });
    expect(result.current.token).toBe('');
    await waitFor(() => expect(result.current.status).toBe('ready'));
    rerender({ mode: 'forgot' });
    await waitFor(() => expect(result.current.required).toBe(true));
    expect(result.current.token).toBe('');
  });
});
