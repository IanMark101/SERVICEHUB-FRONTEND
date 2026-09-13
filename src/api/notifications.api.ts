import { api } from '../lib/api/axios';

export async function apiGetNotifications(page = 1, limit = 20) {
  const response = await api.get('/notifications', { params: { page, limit } });
  return response.data;
}

export async function apiMarkNotificationsRead() {
  const response = await api.patch('/notifications/read-all');
  return response.data;
}
