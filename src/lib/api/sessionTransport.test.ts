import axios, { AxiosHeaders, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, clearAccessToken, getAccessToken, refreshAccessTokenOnce, setAccessToken } from './axios';

function jwt(seconds: number) {
  return `header.${btoa(JSON.stringify({ sub: 'session-test-user', exp: Math.floor(Date.now() / 1000) + seconds }))}.signature`;
}
function ok(config: InternalAxiosRequestConfig) { return { config, status: 200, statusText: 'OK', headers: new AxiosHeaders(), data: { success: true, data: [] } }; }
function denied(config: InternalAxiosRequestConfig) {
  return new axios.AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, { ...ok(config), status: 401 });
}

describe('session recovery before workspace requests', () => {
  beforeEach(() => { clearAccessToken(); localStorage.clear(); });
  afterEach(() => { clearAccessToken(); vi.restoreAllMocks(); });

  it('refreshes an expired token once before concurrent feeds reach the transport', async () => {
    setAccessToken(jwt(-10));
    const fresh = jwt(900);
    const post = vi.spyOn(axios, 'post').mockResolvedValue({ data: { data: { accessToken: fresh } } });
    const adapter = vi.fn<AxiosAdapter>(async config => {
      expect(config.headers.Authorization).toBe(`Bearer ${fresh}`);
      return ok(config);
    });
    await Promise.all(['/offers/received', '/notifications', '/messages/conversations'].map(path => api.get(path, { adapter })));
    expect(post).toHaveBeenCalledTimes(1);
    expect(adapter).toHaveBeenCalledTimes(3);
  });

  it('never sends unauthenticated private feeds while public and recovery requests still work', async () => {
    const adapter = vi.fn<AxiosAdapter>(async config => ok(config));
    for (const path of ['/notifications', '/messages/conversations', '/offers/mine', '/bookings/my-engagements', '/transactions', '/auth/me']) {
      await expect(api.get(path, { adapter })).rejects.toSatisfy(axios.isCancel);
    }
    expect(adapter).not.toHaveBeenCalled();
    await api.get('/services', { adapter });
    await api.post('/auth/session', {}, { adapter });
    await api.post('/auth/login', {}, { adapter });
    expect(adapter).toHaveBeenCalledTimes(3);
  });

  it('clears a session refused after recovery and stops subsequent polling without another network request', async () => {
    setAccessToken(jwt(900));
    const dispatch = vi.spyOn(window, 'dispatchEvent');
    const post = vi.spyOn(axios, 'post').mockResolvedValue({ data: { data: { accessToken: jwt(901) } } });
    const adapter = vi.fn<AxiosAdapter>(async config => { throw denied(config); });
    await expect(api.get('/notifications', { adapter })).rejects.toThrow('Unauthorized');
    expect(adapter).toHaveBeenCalledTimes(2);
    expect(post).toHaveBeenCalledTimes(1);
    expect(getAccessToken()).toBeNull();
    expect(dispatch.mock.calls.filter(([event]) => event.type === 'auth_session_expired')).toHaveLength(1);
    await expect(api.get('/messages/conversations', { adapter })).rejects.toSatisfy(axios.isCancel);
    expect(adapter).toHaveBeenCalledTimes(2);
  });

  it('reuses a concurrent recovery for a late 401 instead of rotating again', async () => {
    setAccessToken(jwt(900));
    let refuse!: () => void;
    const adapter = vi.fn<AxiosAdapter>(config => new Promise((resolve, reject) => {
      if (adapter.mock.calls.length === 1) refuse = () => reject(denied(config));
      else resolve(ok(config));
    }));
    const pending = api.get('/notifications', { adapter });
    await vi.waitFor(() => expect(refuse).toBeTypeOf('function'));
    const post = vi.spyOn(axios, 'post').mockResolvedValue({ data: { data: { accessToken: jwt(950) } } });
    await refreshAccessTokenOnce();
    refuse(); await pending;
    expect(post).toHaveBeenCalledTimes(1);
    expect(adapter).toHaveBeenCalledTimes(2);
  });

  it('cancels recovery after logout before dispatching the pending feed', async () => {
    setAccessToken(jwt(-10));
    let finish!: (response: unknown) => void;
    const post = vi.spyOn(axios, 'post').mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    const adapter = vi.fn<AxiosAdapter>(async config => ok(config));
    const pending = api.get('/notifications', { adapter });
    const settled = Promise.allSettled([pending]);
    await vi.waitFor(() => expect(post).toHaveBeenCalledOnce());
    clearAccessToken();
    finish({ data: { data: { accessToken: jwt(900) } } });
    const result = (await settled)[0];
    expect(result.status).toBe('rejected');
    if (result.status === 'rejected') expect(axios.isCancel(result.reason)).toBe(true);
    expect(adapter).not.toHaveBeenCalled();
    expect(getAccessToken()).toBeNull();
  });

  it('keeps the session during a temporary recovery outage without sending the expired feed', async () => {
    const token = jwt(-10); setAccessToken(token);
    const error = new axios.AxiosError('Backend unavailable');
    error.response = { status: 503 } as typeof error.response;
    vi.spyOn(axios, 'post').mockRejectedValue(error);
    const adapter = vi.fn<AxiosAdapter>(async config => ok(config));
    const dispatch = vi.spyOn(window, 'dispatchEvent');
    await expect(api.get('/notifications', { adapter })).rejects.toThrow('Backend unavailable');
    expect(adapter).not.toHaveBeenCalled();
    expect(getAccessToken()).toBe(token);
    expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'auth_session_expired' }));
  });

  it('rotates through the website cookie before rejecting a verification, then preserves admin access', async () => {
    setAccessToken(jwt(-10));
    const fresh = jwt(900);
    const post = vi.spyOn(axios, 'post').mockResolvedValue({ data: { data: { accessToken: fresh } } });
    const dispatch = vi.spyOn(window, 'dispatchEvent');
    const adapter = vi.fn<AxiosAdapter>(async config => {
      expect(config.headers.Authorization).toBe(`Bearer ${fresh}`);
      expect(config.baseURL).not.toBe('/api');
      return ok(config);
    });
    await api.patch('/admin/verifications/submission', { approve: false, adminNotes: 'Please resubmit a clear document.' }, { adapter });
    await api.get('/admin/verifications', { adapter, apiCache: 'no-store' });
    expect(post).toHaveBeenCalledOnce();
    expect(post).toHaveBeenCalledWith('/api/auth/refresh', {}, expect.objectContaining({ withCredentials: true, timeout: 15_000 }));
    expect(getAccessToken()).toBe(fresh);
    expect(dispatch.mock.calls.filter(([event]) => event.type === 'auth_session_expired')).toHaveLength(0);
  });

  it('sends sign-in, reload recovery and explicit sign-out to the same first-party cookie scope', async () => {
    const adapter = vi.fn<AxiosAdapter>(async config => {
      expect(config.baseURL).toBe('/api');
      expect(config.withCredentials).toBe(true);
      return ok(config);
    });
    await api.post('/auth/login', {}, { adapter });
    await api.post('/auth/session', {}, { adapter });
    await api.post('/auth/logout', {}, { adapter });
    expect(adapter).toHaveBeenCalledTimes(3);
  });
});
