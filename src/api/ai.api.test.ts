import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../lib/api/axios';
import { peekApiResponse } from '../lib/api/cachedAdapter';
import { getCachePolicy, mutationResources } from '../lib/api/cachePolicy';
import { apiGetProviderSummary, apiGetSeekerSummary, getCachedProviderSummary, getCachedSeekerSummary } from './ai.api';

vi.mock('../lib/api/axios', () => ({ api: { defaults: { baseURL: 'http://api.example.test' }, get: vi.fn() } }));
vi.mock('../lib/api/cachedAdapter', () => ({ peekApiResponse: vi.fn() }));
vi.mock('../lib/api/responseCache', () => ({ invalidateApiCache: vi.fn() }));

describe('role-specific digest API and cache keys', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: { summary: null } } }); });
  it('bypasses old provider-summary cache keys', async () => {
    await apiGetProviderSummary('provider', 'listing');
    expect(api.get).toHaveBeenCalledWith('/ai/provider-summary/provider?digest=2&serviceId=listing&fast=1', { apiCache: 'default' });
    getCachedProviderSummary('provider', 'listing');
    expect(peekApiResponse).toHaveBeenCalledWith('/ai/provider-summary/provider?digest=2&serviceId=listing&fast=1', 'http://api.example.test');
  });
  it('uses a separate client endpoint and cache key', async () => {
    await apiGetSeekerSummary('same-account');
    expect(api.get).toHaveBeenCalledWith('/ai/seeker-summary/same-account?digest=2&fast=1', { apiCache: 'default' });
    getCachedSeekerSummary('same-account');
    expect(peekApiResponse).toHaveBeenCalledWith('/ai/seeker-summary/same-account?digest=2&fast=1', 'http://api.example.test');
  });
  it('fresh refinement bypasses the response cache and omits fast for both roles', async () => {
    await apiGetSeekerSummary('client', { force: true, waitForFresh: true });
    expect(api.get).toHaveBeenLastCalledWith('/ai/seeker-summary/client?digest=2', { apiCache: 'reload' });
    await apiGetProviderSummary('provider', undefined, { force: true, waitForFresh: true });
    expect(api.get).toHaveBeenLastCalledWith('/ai/provider-summary/provider?digest=2', { apiCache: 'reload' });
  });
  it('keeps both digest caches private, non-persistent and invalidated by reviews', () => {
    for (const path of ['/ai/provider-summary/user', '/ai/seeker-summary/user']) {
      expect(getCachePolicy(path)).toMatchObject({ tags: ['summaries'], persist: false, public: false });
    }
    expect(mutationResources('/reviews/review-id')).toContain('summaries');
  });
});
