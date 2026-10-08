import axios, { AxiosError, AxiosHeaders, type AxiosAdapter } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, clearAccessToken, setAccessToken } from './axios';
import { responseCache } from './responseCache';

const identity = (id = 'resident', status = 'UNVERIFIED') => JSON.stringify([id, 'user', true, status, 'ACTIVE']);
const reads = ['/verifications/status', '/verifications/privacy-notice', '/auth/security', '/users/me/account-deletion'];

beforeEach(() => {
  clearAccessToken();
  setAccessToken(`header.${btoa(JSON.stringify({ sub: 'resident' }))}.signature`);
  responseCache.setIdentity(identity());
});
afterEach(() => { clearAccessToken(); vi.restoreAllMocks(); });

describe('Settings reads during profile refresh', () => {
  it('keeps verification and security reads active when deletion eligibility finishes first', async () => {
    const initialScope = responseCache.scope;
    const initialGeneration = responseCache.generation;
    const finishes = new Map<string, () => void>();
    const adapter: AxiosAdapter = config => new Promise(resolve => {
      finishes.set(config.url!, () => resolve({
        config, data: { success: true, data: { loaded: config.url } },
        status: 200, statusText: 'OK', headers: new AxiosHeaders(),
      }));
    });
    const pending = reads.map(path => api.get(path, { adapter }));
    // Observe every promise immediately, including cancellations in the broken
    // implementation, so the regression produces no unhandled rejections.
    const settled = Promise.allSettled(pending);
    await vi.waitFor(() => expect(finishes.size).toBe(reads.length));
    finishes.get('/users/me/account-deletion')!();
    await pending[3];
    for (const path of reads.slice(0, 3)) finishes.get(path)!();
    const results = await settled;
    expect(results.map(result => result.status)).toEqual(reads.map(() => 'fulfilled'));
    expect(responseCache.scope).toBe(initialScope);
    expect(responseCache.generation).toBe(initialGeneration);
  });

  it('still clears private account data after an actual successful account deletion', async () => {
    const adapter: AxiosAdapter = async config => ({
      config, data: { success: true, data: { deleted: true } },
      status: 200, statusText: 'OK', headers: new AxiosHeaders(),
    });
    await api.post('/users/me/account-deletion', { confirmation: 'DELETE' }, { adapter });
    expect(responseCache.scope).toBeNull();
  });

  it('allows overlapping eligibility checks without canceling the second check', async () => {
    const finishes: (() => void)[] = [];
    const adapter: AxiosAdapter = config => new Promise(resolve => {
      finishes.push(() => resolve({
        config, data: { success: true, data: { eligible: true } },
        status: 200, statusText: 'OK', headers: new AxiosHeaders(),
      }));
    });
    const first = api.get('/users/me/account-deletion', { adapter });
    const second = api.get('/users/me/account-deletion', { adapter });
    const settled = Promise.allSettled([first, second]);
    await vi.waitFor(() => expect(finishes).toHaveLength(2));
    finishes[0]();
    await first;
    finishes[1]();
    expect((await settled).map(result => result.status)).toEqual(['fulfilled', 'fulfilled']);
  });

  it.each(reads)('re-reads %s once after the same resident profile updates', async path => {
    let attempts = 0;
    const adapter = vi.fn<AxiosAdapter>(async config => {
      attempts++;
      if (attempts === 1) responseCache.setIdentity(identity('resident', 'APPROVED'));
      return { config, data: { success: true, data: { attempt: attempts } }, status: 200, statusText: 'OK', headers: new AxiosHeaders() };
    });
    expect((await api.get(path, { adapter })).data.data.attempt).toBe(2);
    expect(adapter).toHaveBeenCalledTimes(2);
  });

  it('retries an interrupted read while the initial verified profile is being established', async () => {
    responseCache.setIdentity(null);
    let attempts = 0;
    const adapter: AxiosAdapter = async config => {
      if (++attempts === 1) responseCache.setIdentity(identity());
      return { config, data: { success: true }, status: 200, statusText: 'OK', headers: new AxiosHeaders() };
    };
    await expect(api.get('/auth/security', { adapter })).resolves.toHaveProperty('status', 200);
    expect(attempts).toBe(2);
  });

  it('re-reads after a failed response under the old profile scope', async () => {
    let attempts = 0;
    const adapter: AxiosAdapter = async config => {
      if (++attempts === 1) {
        responseCache.setIdentity(identity('resident', 'APPROVED'));
        throw new AxiosError('Old request failed', 'ERR_BAD_RESPONSE', config);
      }
      return { config, data: { success: true }, status: 200, statusText: 'OK', headers: new AxiosHeaders() };
    };
    await expect(api.get('/verifications/privacy-notice', { adapter })).resolves.toHaveProperty('status', 200);
    expect(attempts).toBe(2);
  });

  it.each(['logout', 'another account', 'repeated scope updates'])('does not conceal %s or retry indefinitely', async change => {
    let attempts = 0;
    const adapter = vi.fn<AxiosAdapter>(async config => {
      attempts++;
      if (change === 'logout') clearAccessToken();
      else if (change === 'another account') responseCache.setIdentity(identity('another-resident'));
      else responseCache.setIdentity(identity('resident', `revision-${attempts}`));
      return { config, data: { success: true }, status: 200, statusText: 'OK', headers: new AxiosHeaders() };
    });
    await expect(api.get('/auth/security', { adapter })).rejects.toSatisfy(axios.isCancel);
    expect(attempts).toBe(change === 'repeated scope updates' ? 2 : 1);
  });

  it.each([
    ['post', '/verifications/submit'], ['delete', '/users/me/account-deletion'],
    ['get', '/admin/verifications/submission/proofs/proof/access'],
  ])('does not replay %s %s', async (method, url) => {
    const adapter = vi.fn<AxiosAdapter>(async config => {
      responseCache.setIdentity(identity('resident', 'APPROVED'));
      return { config, data: { success: true }, status: 200, statusText: 'OK', headers: new AxiosHeaders() };
    });
    await expect(api.request({ method, url, adapter })).rejects.toSatisfy(axios.isCancel);
    expect(adapter).toHaveBeenCalledTimes(1);
  });
});
