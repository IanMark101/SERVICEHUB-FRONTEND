import { api } from '../lib/api/axios';

type PaymentMethods = { cash: boolean; gcash: boolean; maya?: boolean; card?: boolean };

export interface ServicePayload {
  categoryId: string;
  title: string;
  description: string;
  price?: number | null;
  serviceType?: string;
  priceType?: string;
  estimatedDurationMins?: number;
  queueLimit?: number;
  paymentMethods: PaymentMethods;
}

export async function apiBrowseServices(params?: { categoryId?: string; search?: string; availableOnly?: boolean }) {
  const response = await api.get('/services', { params });
  return response.data;
}

export async function apiGetServiceById(id: string) {
  const response = await api.get(`/services/${id}`);
  return response.data;
}

export async function apiGetMyServices() {
  const response = await api.get('/services/mine');
  return response.data;
}

export async function apiCreateService(data: ServicePayload) {
  const response = await api.post('/services', data);
  return response.data;
}

export async function apiUpdateService(id: string, data: Partial<ServicePayload>) {
  const response = await api.patch(`/services/${id}`, data);
  return response.data;
}

export async function apiToggleServiceAvailability(id: string) {
  const response = await api.patch(`/services/${id}/toggle`);
  return response.data;
}

export async function apiDeleteService(id: string) {
  const response = await api.delete(`/services/${id}`);
  return response.data;
}
