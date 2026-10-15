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
  const response = await api.post('/ai/match-providers', { requestId }, {timeout:30000});
  return response.data;
}

export interface MarketplaceMatch { id:string;title:string;category:string;name:string;userId:string;trustScore:number;rating:number|null;reviewCount:number;distanceKm:number|null;locationLabel:string|null;amount:number|null;priceType:string;rank:number;rationale:string }
export interface MarketplaceMatches { suggestions:MarketplaceMatch[];source:'gemini'|'computed';reason?:string }
export async function apiMatchRequests(serviceId:string) {
  return (await api.post('/ai/match-requests',{serviceId},{timeout:30000})).data;
}
export async function apiSuggestCategory(title:string,description:string,signal?:AbortSignal) {
  return (await api.post('/ai/suggest-category',{title,description},{signal,timeout:30000})).data as {success:boolean;data:{suggestions:Array<{id:string;name:string}>;source:string;reason?:string}};
}
