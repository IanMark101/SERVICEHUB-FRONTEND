import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, setAccessToken } from '../lib/api/axios';
import { apiRecoverSession } from './auth.api';

vi.mock('../lib/api/axios', () => ({
  api: { post: vi.fn(), get: vi.fn() },
  setAccessToken: vi.fn(),
  getSessionGeneration: () => 0,
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}

const signedIn = { data: { success: true, data: { authenticated: true, accessToken: 'verified-token' } } };
const profile = { data: { success: true, data: { user: { id: 'account', role: 'user' } } } };
const guest = { data: { success: true, data: { authenticated: false } } };

describe('bounded initial session recovery', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetAllMocks();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('deduplicates concurrent recovery and verifies the profile after restoring the cookie session', async () => {
    vi.mocked(api.post).mockResolvedValue(signedIn);
    vi.mocked(api.get).mockResolvedValue(profile);
    const first = apiRecoverSession();
    expect(apiRecoverSession()).toBe(first);
    expect(await first).toEqual(profile.data);
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith('/auth/session', {}, expect.objectContaining({ timeout: 15_000, signal: expect.any(AbortSignal) }));
    expect(setAccessToken).toHaveBeenCalledWith('verified-token');
    expect(api.get).toHaveBeenCalledWith('/auth/me', expect.objectContaining({ timeout: 15_000 }));
    expect(vi.getTimerCount()).toBe(0);
  });

  it('returns an unauthenticated result without requesting a private profile', async () => {
    vi.mocked(api.post).mockResolvedValue(guest);
    expect(await apiRecoverSession()).toEqual({ success: false, data: { user: null } });
    expect(api.get).not.toHaveBeenCalled();
    expect(setAccessToken).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('uses the profile verified by the session response without a second /me round trip', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { ...signedIn.data, data: { ...signedIn.data.data, user: profile.data.data.user } } });
    expect(await apiRecoverSession()).toEqual(profile.data);
    expect(api.get).not.toHaveBeenCalled();
  });

  it('rejects server failures and allows a later recovery attempt', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(new Error('Network unavailable')).mockResolvedValueOnce(guest);
    await expect(apiRecoverSession()).rejects.toThrow('Network unavailable');
    expect(await apiRecoverSession()).toEqual({ success: false, data: { user: null } });
    expect(api.post).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('aborts a stalled session request after 15 seconds and ignores a response arriving after the deadline', async () => {
    const session = deferred<typeof signedIn>();
    vi.mocked(api.post).mockReturnValueOnce(session.promise).mockResolvedValueOnce(guest);
    const recovery = apiRecoverSession();
    const rejected = expect(recovery).rejects.toThrow('Session recovery timed out');
    const signal = vi.mocked(api.post).mock.calls[0][2]?.signal;
    await vi.advanceTimersByTimeAsync(15_000);
    await rejected;
    expect(signal?.aborted).toBe(true);
    session.resolve(signedIn);
    await vi.advanceTimersByTimeAsync(0);
    expect(setAccessToken).not.toHaveBeenCalled();
    expect(api.get).not.toHaveBeenCalled();
    expect(await apiRecoverSession()).toEqual({ success: false, data: { user: null } });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('bounds the entire recovery when the profile request or its interceptor stalls', async () => {
    const session = deferred<typeof signedIn>();
    const me = deferred<typeof profile>();
    vi.mocked(api.post).mockReturnValueOnce(session.promise);
    vi.mocked(api.get).mockReturnValueOnce(me.promise);
    const recovery = apiRecoverSession();
    const rejected = expect(recovery).rejects.toThrow('Session recovery timed out');
    await vi.advanceTimersByTimeAsync(10_000);
    session.resolve(signedIn);
    await vi.advanceTimersByTimeAsync(0);
    expect(api.get).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(5_000);
    await rejected;
    expect(vi.mocked(api.get).mock.calls[0][1]?.signal?.aborted).toBe(true);
    me.resolve(profile);
    await vi.advanceTimersByTimeAsync(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('rejects a claimed session without an access token', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { success: true, data: { authenticated: true } } });
    await expect(apiRecoverSession()).rejects.toThrow('No access token returned');
    expect(api.get).not.toHaveBeenCalled();
    expect(setAccessToken).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
