import { api } from '../lib/api/axios';

export async function apiCreateRequest(data: { categoryId: string; title: string; description: string; budgetMin: number; budgetMax: number; urgency?: 'low' | 'medium' | 'high' }) {
  const response = await api.post('/requests', data);
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

export async function apiUpdateRequest(id: string, data: any) {
  const response = await api.patch(`/requests/${id}`, data);
  return response.data;
}

export async function apiDeleteRequest(id: string) {
  const response = await api.delete(`/requests/${id}`);
  return response.data;
}
