import { api } from '../lib/api/axios';

export async function apiGetProviderSummary(providerId: string, serviceId?: string) {
  const query = serviceId ? `?serviceId=${encodeURIComponent(serviceId)}` : '';
  const response = await api.get(`/ai/provider-summary/${providerId}${query}`);
  return response.data;
}

export async function apiMatchProviders(requestId: string) {
  const response = await api.post('/ai/match-providers', { requestId });
  return response.data;
}
