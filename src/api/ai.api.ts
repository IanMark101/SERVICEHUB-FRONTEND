import { api } from '../lib/api/axios';

export interface ProviderSummaryPayload {
  summary: string | null;
  reason?: string;
  cached?: boolean;
  source?: 'gemini' | 'computed' | 'empty';
  refreshing?: boolean;
}

interface ProviderSummaryResponse {
  success: boolean;
  data: ProviderSummaryPayload;
}

const SUMMARY_CACHE_TTL_MS = 5 * 60 * 1000;
const summaryCache = new Map<string, { expiresAt: number; response: ProviderSummaryResponse }>();
const summaryRequests = new Map<string, Promise<ProviderSummaryResponse>>();

export function getCachedProviderSummary(providerId: string) {
  const cached = summaryCache.get(providerId);
  if (!cached || cached.expiresAt <= Date.now()) {
    summaryCache.delete(providerId);
    return null;
  }
  return cached.response;
}

export function invalidateProviderSummaryCache(providerId?: string) {
  if (providerId) {
    summaryCache.delete(providerId);
    return;
  }
  summaryCache.clear();
}

export async function apiGetProviderSummary(
  providerId: string,
  serviceId?: string,
  options?: { force?: boolean; waitForFresh?: boolean },
) {
  const cached = options?.force ? null : getCachedProviderSummary(providerId);
  if (cached) return cached;

  const pending = summaryRequests.get(providerId);
  if (pending) return pending;

  const params = new URLSearchParams();
  if (serviceId) params.set('serviceId', serviceId);
  if (!options?.waitForFresh) params.set('fast', '1');
  const query = params.size ? `?${params.toString()}` : '';
  const request = api.get<ProviderSummaryResponse>(`/ai/provider-summary/${providerId}${query}`)
    .then((response) => {
      if (response.data.success) {
        summaryCache.set(providerId, {
          expiresAt: Date.now() + (response.data.data?.refreshing ? 2000 : SUMMARY_CACHE_TTL_MS),
          response: response.data,
        });
      }
      return response.data;
    })
    .finally(() => summaryRequests.delete(providerId));

  summaryRequests.set(providerId, request);
  return request;
}

export async function apiMatchProviders(requestId: string) {
  const response = await api.post('/ai/match-providers', { requestId });
  return response.data;
}
