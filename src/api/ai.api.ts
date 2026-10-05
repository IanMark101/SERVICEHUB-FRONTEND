import { api } from '../lib/api/axios';
import { peekApiResponse } from '../lib/api/cachedAdapter';
import { invalidateApiCache } from '../lib/api/responseCache';

export interface ProviderSummaryPayload {
  summary: string | null;
  reason?: string;
  cached?: boolean;
  source?: 'gemini' | 'computed' | 'empty';
  refreshing?: boolean;
  reviewCount?: number;
  averageRating?: number;
  reviewContext?: 'provider' | 'seeker';
  reviewLimit?: number;
}

interface ProviderSummaryResponse {
  success: boolean;
  data: ProviderSummaryPayload;
}

function summaryUrl(providerId: string, serviceId?: string, waitForFresh = false) {
  const params = new URLSearchParams();
  params.set('digest', '2'); // Do not reuse responses from the previous summary algorithm.
  if (serviceId) params.set('serviceId', serviceId);
  if (!waitForFresh) params.set('fast', '1');
  return `/ai/provider-summary/${providerId}${params.size ? `?${params}` : ''}`;
}

export function getCachedProviderSummary(providerId: string, serviceId?: string) {
  return peekApiResponse<ProviderSummaryResponse>(summaryUrl(providerId, serviceId), api.defaults.baseURL || '');
}

export function invalidateProviderSummaryCache() {
  invalidateApiCache(['summaries']);
}

export async function apiGetProviderSummary(
  providerId: string,
  serviceId?: string,
  options?: { force?: boolean; waitForFresh?: boolean },
) {
  const response = await api.get<ProviderSummaryResponse>(summaryUrl(providerId, serviceId, options?.waitForFresh), {
    apiCache: options?.force ? 'reload' : 'default',
  });
  return response.data;
}

function seekerSummaryUrl(seekerId: string, waitForFresh = false) {
  return `/ai/seeker-summary/${encodeURIComponent(seekerId)}?digest=2${waitForFresh ? '' : '&fast=1'}`;
}

export function getCachedSeekerSummary(seekerId: string) {
  return peekApiResponse<ProviderSummaryResponse>(seekerSummaryUrl(seekerId), api.defaults.baseURL || '');
}

export async function apiGetSeekerSummary(seekerId: string, options?: { force?: boolean; waitForFresh?: boolean }) {
  const response = await api.get<ProviderSummaryResponse>(seekerSummaryUrl(seekerId, options?.waitForFresh), {
    apiCache: options?.force ? 'reload' : 'default',
  });
  return response.data;
}

export async function apiMatchProviders(requestId: string) {
  const response = await api.post('/ai/match-providers', { requestId });
  return response.data;
}
