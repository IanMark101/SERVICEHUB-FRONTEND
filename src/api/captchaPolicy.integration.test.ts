import axios, { AxiosHeaders, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiGetCaptchaPolicy } from './auth.api';
import { api, publicApi, clearAccessToken, setAccessToken } from '@/lib/api/axios';
import { responseCache } from '@/lib/api/responseCache';

const policy = { enabled: true, siteKey: 'public-key', loginRequired: false };
const originalApiAdapter = api.defaults.adapter;
const originalPublicAdapter = publicApi.defaults.adapter;

beforeEach(() => clearAccessToken());
afterEach(() => {
  api.defaults.adapter = originalApiAdapter;
  publicApi.defaults.adapter = originalPublicAdapter;
  clearAccessToken();
});

describe('public CAPTCHA policy during session changes', () => {
  it.each(['expired-session cleanup', 'verified-profile update', 'private-cache clearing'] as const)(
    'accepts the successful policy during %s', async (change) => {
      let finish!: () => void;
      const transport = vi.fn<AxiosAdapter>(config => new Promise(resolve => {
        finish = () => resolve({ config, data: { success: true, data: policy }, status: 200, statusText: 'OK', headers: new AxiosHeaders() });
      }));
      api.defaults.adapter = transport;
      publicApi.defaults.adapter = transport;
      const pending = apiGetCaptchaPolicy();
      // Observe failures immediately so the broken client produces a normal
      // assertion failure instead of an unhandled rejection.
      const outcome = pending.then(value => ({ value }), error => ({ error }));
      await vi.waitFor(() => expect(transport).toHaveBeenCalledOnce());
      if (change === 'expired-session cleanup') clearAccessToken();
      else if (change === 'verified-profile update') responseCache.setIdentity(JSON.stringify(['resident', 'user', true, 'APPROVED', 'ACTIVE']));
      else responseCache.clear();
      finish();
      expect(await outcome).toEqual({ value: policy });
    },
  );

  it('sends no account credentials or JSON Content-Type on the public GET', async () => {
    setAccessToken(`header.${btoa(JSON.stringify({ sub: 'resident' }))}.signature`);
    let sent!: InternalAxiosRequestConfig;
    const transport: AxiosAdapter = async config => {
      sent = config;
      return { config, data: { success: true, data: policy }, status: 200, statusText: 'OK', headers: new AxiosHeaders() };
    };
    api.defaults.adapter = transport;
    publicApi.defaults.adapter = transport;
    expect(await apiGetCaptchaPolicy()).toEqual(policy);
    expect(sent.withCredentials).toBe(false);
    expect(sent.headers.get('Authorization')).toBeUndefined();
    expect(sent.headers.get('Content-Type')).toBeUndefined();
    expect(sent.timeout).toBe(10_000);
  });

  it('still honors cancellation when the caller leaves the form', async () => {
    let finish!: () => void;
    const transport = vi.fn<AxiosAdapter>(config => new Promise(resolve => {
      finish = () => resolve({ config, data: { success: true, data: policy }, status: 200, statusText: 'OK', headers: new AxiosHeaders() });
    }));
    api.defaults.adapter = transport;
    publicApi.defaults.adapter = transport;
    const controller = new AbortController();
    const pending = apiGetCaptchaPolicy(controller.signal);
    const outcome = pending.catch(error => error);
    await vi.waitFor(() => expect(transport).toHaveBeenCalledOnce());
    controller.abort();
    finish();
    expect(axios.isCancel(await outcome)).toBe(true);
  });
});
