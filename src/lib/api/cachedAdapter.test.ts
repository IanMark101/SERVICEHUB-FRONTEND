import axios, { AxiosHeaders, type AxiosAdapter } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, clearAccessToken, getAccessToken, refreshAccessTokenOnce, setAccessToken } from './axios';
import { clearApiCache, invalidateApiCache, responseCache } from './responseCache';
import { getCachePolicy, mutationResources, socketResources } from './cachePolicy';

function transport() {
  return vi.fn<AxiosAdapter>(async config => ({
    data: JSON.stringify({ success: true, data: [{ title: 'Saved request' }] }),
    status: 200, statusText: 'OK', headers: new AxiosHeaders(), config,
  }));
}

describe('cached Axios transport across the application', () => {
  beforeEach(() => {
    clearAccessToken();
    sessionStorage.clear();
    setAccessToken('test-access');
    responseCache.setIdentity('verified-test-user');
  });
  afterEach(() => { clearAccessToken(); vi.restoreAllMocks(); });

  it('canonicalizes query keys and separates pages/filters', async () => {
    const adapter = transport();
    const [first, second] = await Promise.all([
      api.get('/requests?limit=10&page=1', { adapter }),
      api.get('/requests', { params: { page: 1, limit: 10 }, adapter }),
    ]);
    expect(adapter).toHaveBeenCalledTimes(1);
    expect(first.data).toEqual(second.data);
    await api.get('/requests', { params: { page: 2, limit: 10 }, adapter });
    expect(adapter).toHaveBeenCalledTimes(2);
  });

  it('invalidates owner and board reads before a mutation resolves to the UI', async () => {
    const adapter = transport();
    await api.get('/requests/mine', { adapter });
    await api.get('/requests', { adapter });
    await api.patch('/requests/request-1', { title: 'Changed' }, { adapter });
    await api.get('/requests/mine', { adapter });
    await api.get('/requests', { adapter });
    expect(adapter).toHaveBeenCalledTimes(5);
  });

  it('keeps the existing cache when a mutation fails', async () => {
    const adapter = transport();
    await api.get('/requests/mine', { adapter });
    await expect(api.patch('/requests/request', {}, { adapter: async () => { throw new Error('Save failed'); } })).rejects.toThrow('Save failed');
    await api.get('/requests/mine', { adapter });
    expect(adapter).toHaveBeenCalledTimes(1);
  });

  it('bypasses cache for authoritative identity, security, payment and audited/side-effect reads', async () => {
    for (const url of ['/auth/me', '/auth/security', '/auth/verify-email/token', '/users/me/account-deletion',
      '/verifications/status', '/messages/booking-1', '/admin/reports/id/evidence/access',
      '/admin/verifications/id/proofs/proof/access', '/admin/bookings/id/messages', '/admin/payments/reconciliation']) {
      const adapter = transport();
      await api.get(url, { adapter });
      await api.get(url, { adapter });
      expect(adapter).toHaveBeenCalledTimes(2);
      expect(getCachePolicy(url)).toBeNull();
    }
  });

  it('requires server-verified identity to cache private data', async () => {
    responseCache.clear();
    const adapter = transport();
    await api.get('/requests', { adapter });
    await api.get('/requests', { adapter });
    expect(adapter).toHaveBeenCalledTimes(2);
    await api.get('/auth/me', { adapter: async config => ({ data: { success: true, data: { user: { id: 'user-1', role: 'SEEKER' } } }, status: 200, statusText: 'OK', config, headers: new AxiosHeaders() }) });
    await api.get('/requests', { adapter });
    await api.get('/requests', { adapter });
    expect(adapter).toHaveBeenCalledTimes(3);
  });

  it('keeps cached data on token refresh and clears it on logout', async () => {
    const adapter = transport();
    await api.get('/requests', { adapter });
    setAccessToken('rotated-access');
    await api.get('/requests', { adapter });
    expect(adapter).toHaveBeenCalledTimes(1);
    clearAccessToken();
    setAccessToken('other-access');
    responseCache.setIdentity('another-verified-user');
    await api.get('/requests', { adapter });
    expect(adapter).toHaveBeenCalledTimes(2);
  });

  it('cancels one caller without aborting the shared network read', async () => {
    let finish!: () => void;
    const adapter = vi.fn<AxiosAdapter>(config => new Promise(resolve => {
      expect(config.signal).toBeUndefined();
      finish = () => resolve({ data: { success: true, data: [] }, status: 200, statusText: 'OK', config, headers: new AxiosHeaders() });
    }));
    const controller = new AbortController();
    const canceled = api.get('/requests', { adapter, signal: controller.signal });
    const survivor = api.get('/requests', { adapter });
    const assertion = expect(canceled).rejects.toSatisfy(axios.isCancel);
    await vi.waitFor(() => expect(adapter).toHaveBeenCalledTimes(1));
    controller.abort();
    finish();
    await assertion;
    expect((await survivor).data).toEqual({ success: true, data: [] });
  });

  it('deduplicates 401 retries while keeping each caller’s retry config independent', async () => {
    setAccessToken('expired');
    vi.spyOn(axios, 'post').mockResolvedValue({ data: { data: { accessToken: 'fresh' } } });
    const adapter = vi.fn<AxiosAdapter>(async config => {
      if (config.headers.Authorization === 'Bearer expired') throw new axios.AxiosError('Expired', 'ERR_BAD_REQUEST', config, undefined,
        { status: 401, statusText: 'Unauthorized', config, headers: new AxiosHeaders(), data: '{}' });
      return { status: 200, statusText: 'OK', config, headers: new AxiosHeaders(), data: '{"success":true,"data":[]}' };
    });
    const results = await Promise.all([api.get('/requests', { adapter }), api.get('/requests', { adapter })]);
    expect(results.map(result => result.data.success)).toEqual([true, true]);
    expect(adapter).toHaveBeenCalledTimes(2);
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it('supports explicit reload/no-store and invalidates before socket consumers fetch', async () => {
    const adapter = transport();
    await api.get('/services', { adapter });
    await api.get('/services', { adapter, apiCache: 'reload' });
    await api.get('/services', { adapter, apiCache: 'no-store' });
    expect(adapter).toHaveBeenCalledTimes(3);
    invalidateApiCache(socketResources('SERVICE_LISTINGS_CHANGED'), 'socket');
    await api.get('/services', { adapter });
    expect(adapter).toHaveBeenCalledTimes(4);
    expect(mutationResources('/bookings/1/confirm')).toContain('transactions');
    expect(mutationResources('/reviews')).toContain('summaries');
  });

  it('rejects late uncached identity responses after sign-out', async () => {
    let finish!: () => void;
    const adapter: AxiosAdapter = config => new Promise(resolve => {
      finish = () => resolve({ data: { success: true, data: { user: { id: 'old-user' } } }, status: 200, statusText: 'OK', config, headers: new AxiosHeaders() });
    });
    const pending = api.get('/auth/me', { adapter });
    const assertion = expect(pending).rejects.toSatisfy(axios.isCancel);
    await vi.waitFor(() => expect(finish).toBeTypeOf('function'));
    clearAccessToken();
    finish();
    await assertion;
    expect(responseCache.scope).toBeNull();
  });

  it('does not resurrect a signed-out session when a token refresh finishes late', async () => {
    let finish!: () => void;
    vi.spyOn(axios, 'post').mockImplementation(() => new Promise(resolve => {
      finish = () => resolve({ data: { data: { accessToken: 'late-token' } } });
    }));
    const refresh = refreshAccessTokenOnce();
    const assertion = expect(refresh).rejects.toSatisfy(axios.isCancel);
    clearAccessToken();
    finish();
    await assertion;
    expect(getAccessToken()).toBeNull();
  });

  it('does not restore an old identity after a ban clears its cache but keeps the appeal token', async () => {
    let finish!: () => void;
    const pending = api.get('/auth/me', { adapter: config => new Promise(resolve => {
      finish = () => resolve({ data: { success: true, data: { user: { id: 'old-active-user' } } }, status: 200, statusText: 'OK', config, headers: new AxiosHeaders() });
    }) });
    const assertion = expect(pending).rejects.toSatisfy(axios.isCancel);
    await vi.waitFor(() => expect(finish).toBeTypeOf('function'));
    clearApiCache();
    finish();
    await assertion;
    expect(getAccessToken()).toBe('test-access');
    expect(responseCache.scope).toBeNull();
  });

  it('rejects token refresh into a different account instead of filling the old account cache', () => {
    responseCache.setIdentity(JSON.stringify(['account-a', 'user']));
    const token = `header.${btoa(JSON.stringify({ sub: 'account-b' }))}.signature`;
    expect(() => setAccessToken(token)).toThrow('browser account changed');
    expect(getAccessToken()).toBeNull();
    expect(responseCache.scope).toBeNull();
  });
});
