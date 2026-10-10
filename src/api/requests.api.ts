import type { LocationPoint } from '../lib/location';
import { api } from '../lib/api/axios';
import type { PaymentMethods } from '../types';
import type { RequestUrgency } from '../lib/requestUrgency';

export async function apiCreateRequest(data: { jobLocation?: LocationPoint; transportationFee?: number | null; categoryId: string; title: string; description: string; budgetMin: number; budgetMax: number; urgency: RequestUrgency; paymentMethods: PaymentMethods }) {
  const response = await api.post('/requests', { ...data, title: data.title.trim().toUpperCase() });
  return response.data;
}

export async function apiGetRequests(params?: { categoryId?: string }) {
  const response = await api.get('/requests', { params });
  return response.data;
}

export async function apiGetMyRequests() {
  const response = await api.get('/requests/mine');
  return response.data;
}

export interface RequestRepostTemplate {
  jobLocation?: LocationPoint;
  transportationFee?: number | null;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  budget: number;
  paymentMethods?: PaymentMethods | null;
}

export async function apiGetRequestRepostTemplate(id: string): Promise<{ success: boolean; data: RequestRepostTemplate }> {
  const response = await api.get(`/requests/${encodeURIComponent(id)}/repost-template`);
  return response.data;
}

type RequestUpdate = Partial<{
  jobLocation: LocationPoint;
  transportationFee: number | null;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  urgency: RequestUrgency;
  status: string;
  paymentMethods: PaymentMethods;
}>;

export async function apiUpdateRequest(id: string, data: RequestUpdate) {
  const response = await api.patch(`/requests/${id}`, {
    ...data,
    ...(data.title !== undefined && { title: data.title.trim().toUpperCase() }),
  });
  return response.data;
}

export async function apiDeleteRequest(id: string) {
  const response = await api.delete(`/requests/${id}`);
  return response.data;
}
