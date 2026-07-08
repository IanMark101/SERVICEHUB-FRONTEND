import { api } from './axios';

export async function apiGetProviderSummary(providerId: string) {
  const response = await api.get(`/ai/provider-summary/${providerId}`);
  return response.data;
}

export async function apiMatchProviders(requestId: string) {
  const response = await api.post('/ai/match-providers', { requestId });
  return response.data;
}
