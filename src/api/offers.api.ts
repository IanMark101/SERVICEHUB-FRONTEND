import { api } from './axios';

export async function apiSubmitOffer(data: { requestId: string; offeredPrice: number; estimatedDuration: number; availability?: string; message?: string }) {
  const response = await api.post('/offers', data);
  return response.data;
}

export async function apiGetReceivedOffers() {
  const response = await api.get('/offers/received');
  return response.data;
}

// Provider: get own submitted offers/bids
export async function apiGetMyOffers() {
  const response = await api.get('/offers/mine');
  return response.data;
}

export async function apiAcceptOffer(id: string) {
  const response = await api.patch(`/offers/${id}/accept`);
  return response.data;
}

export async function apiRejectOffer(id: string) {
  const response = await api.patch(`/offers/${id}/reject`);
  return response.data;
}

