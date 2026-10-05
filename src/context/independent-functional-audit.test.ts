import { afterEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import { api, clearAccessToken, getAccessToken, refreshAccessTokenOnce, setAccessToken } from '../lib/api/axios';
import { mapBookingToEngagement } from './mappers';

describe('independent H6 and H10 regressions', () => {
  afterEach(() => { clearAccessToken(); vi.restoreAllMocks(); });

  it('H6: an email-verification permission denial preserves a valid session', async () => {
    setAccessToken('audit-only-valid-session');
    const dispatch = vi.spyOn(window, 'dispatchEvent');
    await expect(api.get('/audit-permission-denial', {
      adapter: async config => {
        throw Object.assign(new Error('Verify your email first'), {
          config, response: { status: 403, data: { code: 'EMAIL_NOT_VERIFIED' } },
        });
      },
    })).rejects.toThrow('Verify your email first');
    expect(getAccessToken()).toBe('audit-only-valid-session');
    expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'auth_session_expired' }));
  });

  it('H10: a booked amount of 350 remains stable after listing price changes to 900', () => {
    const payload = { id: 'audit-booking', seekerId: 's', providerId: 'p', status: 'ACCEPTED', paymentMethod: 'GCash', agreedAmount: 350, service: { title: 'Repair', price: 900 } };
    expect(mapBookingToEngagement(payload).price).toBe(350);
  });

  it('H6: concurrent HTTP/socket refresh requests share one token rotation', async () => {
    const post = vi.spyOn(axios, 'post').mockResolvedValue({ data: { data: { accessToken: 'replacement-access' } } });
    const [first, second] = await Promise.all([refreshAccessTokenOnce(), refreshAccessTokenOnce()]);
    expect(first).toBe('replacement-access');
    expect(second).toBe('replacement-access');
    expect(post).toHaveBeenCalledTimes(1);
    expect(getAccessToken()).toBe('replacement-access');
  });

  it('H7: a revoked session discovered after another tab rotates clears local auth', async () => {
    setAccessToken('stale-access');
    const priorLocks = Object.getOwnPropertyDescriptor(navigator, 'locks');
    Object.defineProperty(navigator, 'locks', { configurable: true, value: {
      request: async (_name: string, callback: () => Promise<string>) => {
        localStorage.setItem('servicehub-refresh-generation', 'another-tab-rotated');
        return callback();
      },
    } });
    const post = vi.spyOn(axios, 'post').mockResolvedValue({ data: { data: { authenticated: false } } });
    const dispatch = vi.spyOn(window, 'dispatchEvent');
    try {
      await expect(refreshAccessTokenOnce()).rejects.toThrow('Browser session is no longer active');
      expect(post.mock.calls[0][0]).toContain('/auth/session');
      expect(getAccessToken()).toBeNull();
      expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'auth_session_expired' }));
    } finally {
      if (priorLocks) Object.defineProperty(navigator, 'locks', priorLocks);
      else Reflect.deleteProperty(navigator, 'locks');
    }
  });

  it('H7: a rejected socket-triggered refresh revokes local auth on 401', async () => {
    setAccessToken('expired-access');
    const denied = Object.assign(new axios.AxiosError('Refresh revoked'), { response: { status: 401 } });
    vi.spyOn(axios, 'post').mockRejectedValue(denied);
    const dispatch = vi.spyOn(window, 'dispatchEvent');
    await expect(refreshAccessTokenOnce()).rejects.toThrow('Refresh revoked');
    expect(getAccessToken()).toBeNull();
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'auth_session_expired' }));
  });

  it('H6: both concurrent unauthorized requests replay at most once', async () => {
    setAccessToken('expired-access');
    const post = vi.spyOn(axios, 'post').mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
      return { data: { data: { accessToken: 'replacement' } } };
    });
    let calls = 0;
    const adapter: NonNullable<Parameters<typeof api.get>[1]>['adapter'] = async config => {
      calls += 1;
      throw Object.assign(new Error('Still unauthorized'), { config, response: { status: 401 } });
    };
    const results = await Promise.allSettled([
      api.get('/independent-first', { adapter }), api.get('/independent-second', { adapter }),
    ]);
    expect(results.every(result => result.status === 'rejected')).toBe(true);
    expect(calls).toBe(4);
    expect(post).toHaveBeenCalledTimes(1);
  });

  it('H6: refresh infrastructure failure does not log out the browser', async () => {
    setAccessToken('existing-access');
    const unavailable = Object.assign(new axios.AxiosError('Temporary outage'), { response: { status: 503 } });
    vi.spyOn(axios, 'post').mockRejectedValue(unavailable);
    const dispatch = vi.spyOn(window, 'dispatchEvent');
    await expect(refreshAccessTokenOnce()).rejects.toThrow('Temporary outage');
    expect(getAccessToken()).toBe('existing-access');
    expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'auth_session_expired' }));
  });

  it('H10: zero snapshots and legacy direct/offer amounts use null-aware precedence', () => {
    const base = { id: 'booking', seekerId: 's', providerId: 'p', service: { price: 900 } };
    expect(mapBookingToEngagement({ ...base, agreedAmount: 0 }).price).toBe(0);
    expect(mapBookingToEngagement({ ...base, agreedAmount: '350', directRequest: { agreedPrice: 500 } }).price).toBe(350);
    expect(mapBookingToEngagement({ ...base, agreedAmount: null, directRequest: { agreedPrice: 500 } }).price).toBe(500);
    expect(mapBookingToEngagement({ ...base, offer: { id: 'o', requestId: 'r', offeredPrice: 450 } }).price).toBe(450);
  });
});
