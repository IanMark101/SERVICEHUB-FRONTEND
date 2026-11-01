import axios, { AxiosHeaders, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, clearAccessToken, setAccessToken } from './axios';
import { responseCache } from './responseCache';

const token = (id = 'banned-resident') => `header.${btoa(JSON.stringify({ sub: id }))}.signature`;
const appeal = { id: 'appeal-1', status: 'PENDING', createdAt: '2026-11-02T00:00:00Z' };
const ok = (config: InternalAxiosRequestConfig, data: unknown, status = 200) => ({ config, data: { success: true, data }, status, statusText: 'OK', headers: new AxiosHeaders() });
async function pollBanStatus() {
  await api.get('/auth/me', { adapter: async config => ok(config, { user: { id: 'banned-resident', moderationStatus: 'BANNED' } }) });
  expect(responseCache.scope).toBeNull();
}

beforeEach(() => { clearAccessToken(); setAccessToken(token()); });
afterEach(() => { clearAccessToken(); vi.restoreAllMocks(); });

describe('ban appeal confirmation during account-status polling', () => {
  it.each(['get', 'post'])('keeps a successful %s when /auth/me clears the banned account cache', async method => {
    let finish!: () => void;
    const adapter = vi.fn<AxiosAdapter>(config => new Promise(resolve => {
      finish = () => resolve(ok(config, { appeal }, method === 'post' ? 201 : 200));
    }));
    const pending = api.request({ method, url: '/auth/ban-appeal', data: method === 'post' ? { message: 'Please review the evidence for my account ban.' } : undefined, adapter });
    const outcome = pending.then(value => ({ value }), error => ({ error }));
    await vi.waitFor(() => expect(adapter).toHaveBeenCalledOnce());
    await pollBanStatus();
    finish();
    expect(await outcome).toMatchObject({ value: { data: { data: { appeal } } } });
    expect(adapter).toHaveBeenCalledOnce();
  });

  it('preserves an actual duplicate-appeal response during the status poll', async () => {
    let finish!: () => void;
    const adapter = vi.fn<AxiosAdapter>(config => new Promise((_resolve, reject) => {
      finish = () => reject(new axios.AxiosError('Request failed with status code 409', 'ERR_BAD_REQUEST', config, undefined, {
        ...ok(config, {}), status: 409, data: { success: false, error: 'An appeal has already been submitted for this ban' },
      }));
    }));
    const pending = api.post('/auth/ban-appeal', { message: 'Please review the evidence for my account ban.' }, { adapter });
    const outcome = pending.catch(error => error);
    await vi.waitFor(() => expect(adapter).toHaveBeenCalledOnce());
    await pollBanStatus(); finish();
    expect(await outcome).toMatchObject({ response: { status: 409, data: { error: 'An appeal has already been submitted for this ban' } } });
    expect(adapter).toHaveBeenCalledOnce();
  });

  it.each(['logout', 'another account', 'different verified profile'])('still cancels an appeal response after %s', async change => {
    let finish!: () => void;
    const adapter = vi.fn<AxiosAdapter>(config => new Promise(resolve => { finish = () => resolve(ok(config, { appeal }, 201)); }));
    const pending = api.post('/auth/ban-appeal', { message: 'Please review the evidence for my account ban.' }, { adapter });
    const outcome = pending.catch(error => error);
    await vi.waitFor(() => expect(adapter).toHaveBeenCalledOnce());
    if (change === 'logout') clearAccessToken();
    else if (change === 'another account') expect(() => setAccessToken(token('another-resident'))).toThrow('browser account changed');
    else responseCache.setIdentity(JSON.stringify(['banned-resident', 'user', true, 'APPROVED', 'ACTIVE']));
    finish();
    expect(axios.isCancel(await outcome)).toBe(true);
    expect(adapter).toHaveBeenCalledOnce();
  });
});
